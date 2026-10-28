require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const PORT = Number(process.env.PORT || 8080);
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY || "";
const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || "";

app.use(express.static(path.join(__dirname, "../web")));

async function tmdb(endpoint, params = {}) {
  if (!TMDB_KEY && !TMDB_TOKEN) {
    const error = new Error("TMDB ainda não foi configurado no servidor.");
    error.status = 503;
    throw error;
  }
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.set("language", "pt-BR");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const headers = { accept: "application/json" };
  if (TMDB_TOKEN) headers.Authorization = `Bearer ${TMDB_TOKEN}`;
  else url.searchParams.set("api_key", TMDB_KEY);
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = new Error(`Erro ao consultar TMDB (HTTP ${response.status}).`);
    error.status = response.status === 401 ? 502 : response.status;
    throw error;
  }
  return response.json();
}

function shape(item, mediaType, category) {
  return {
    id: item.id,
    title: item.title || item.name || item.original_title || item.original_name || "Sem título",
    overview: item.overview || "Sinopse não disponível.",
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
    rating: Number(item.vote_average || 0),
    year: (item.release_date || item.first_air_date || "").slice(0, 4),
    mediaType,
    category
  };
}

app.get("/api/health", (_req, res) => res.json({
  ok: true, service: "NexaPlay API", tmdbConfigured: Boolean(TMDB_KEY || TMDB_TOKEN)
}));
app.get("/api/attribution", (_req, res) => res.json({
  provider: "TMDB",
  logo: "https://www.themoviedb.org/assets/2/v4/logos/312x276-powered-by-rectangle-green.png",
  notice: "This product uses the TMDB API but is not endorsed or certified by TMDB."
}));
app.get("/api/categories", (_req, res) => res.json({
  items: ["Início", "Filmes", "Séries", "Animes", "Turcos", "K-Dramas", "Kids", "Reality", "Esportes", "Shorts"]
}));

app.get("/api/catalog", async (req, res) => {
  try {
    const category = String(req.query.category || "Início");
    const page = Math.max(1, Math.min(100, Number.parseInt(req.query.page || "1", 10) || 1));
    let data, mediaType = "movie";
    if (category === "Filmes") data = await tmdb("/movie/popular", { page });
    else if (category === "Séries") { data = await tmdb("/tv/popular", { page }); mediaType = "tv"; }
    else if (category === "Animes") { data = await tmdb("/discover/tv", { with_genres: 16, sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "Turcos") { data = await tmdb("/discover/tv", { with_origin_country: "TR", sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "K-Dramas") { data = await tmdb("/discover/tv", { with_origin_country: "KR", sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "Kids") data = await tmdb("/discover/movie", { with_genres: "16,10751", sort_by: "popularity.desc", page });
    else if (category === "Reality") { data = await tmdb("/discover/tv", { with_genres: 10764, sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else {
      const [movies, shows] = await Promise.all([tmdb("/trending/movie/week", { page }), tmdb("/trending/tv/week", { page })]);
      const items = [...movies.results.map(x => shape(x, "movie", "Filmes")), ...shows.results.map(x => shape(x, "tv", "Séries"))]
        .sort((a, b) => b.rating - a.rating).slice(0, 30);
      res.set("Cache-Control", "public, max-age=300");
      return res.json({ items, page, provider: "TMDB" });
    }
    res.set("Cache-Control", "public, max-age=300");
    res.json({ items: (data.results || []).map(x => shape(x, mediaType, category)), page, provider: "TMDB" });
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message || "Falha ao carregar catálogo." });
  }
});

app.get("/api/search", async (req, res) => {
  const query = String(req.query.q || "").trim().slice(0, 100);
  if (!query) return res.json({ items: [] });
  try {
    const data = await tmdb("/search/multi", { query, include_adult: false, page: 1 });
    res.json({ items: (data.results || []).filter(x => ["movie", "tv"].includes(x.media_type))
      .map(x => shape(x, x.media_type, x.media_type === "movie" ? "Filmes" : "Séries")) });
  } catch (error) { res.status(error.status || 502).json({ error: error.message || "Falha na busca." }); }
});

app.get("/api/details/:type/:id", async (req, res) => {
  const type = ["movie", "tv"].includes(req.params.type) ? req.params.type : null;
  if (!type || !/^\\d+$/.test(req.params.id)) return res.status(400).json({ error: "Tipo ou ID inválido." });
  try { res.json(await tmdb(`/${type}/${req.params.id}`, { append_to_response: "credits,videos,similar" })); }
  catch (error) { res.status(error.status || 502).json({ error: error.message || "Falha ao carregar detalhes." }); }
});

app.get("/api/shorts", (_req, res) => res.json({ items: [], note: "Adicione fontes de vídeo próprias ou autorizadas para preencher Shorts." }));
app.get("/api/plans", (_req, res) => res.json({ trialDays: 7, plans: ["VIP mensal", "VIP anual"], implemented: false }));
app.get("/api/player/guide", (_req, res) => res.json({ player: "iframe", requirements: ["URL HTTPS", "provedor permite incorporação", "conteúdo autorizado"] }));
app.listen(PORT, () => console.log(`NexaPlay API online na porta ${PORT}`));
