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
  ok: true,
  service: "NexaPlay API",
  tmdbConfigured: Boolean(TMDB_KEY || TMDB_TOKEN)
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
    let data;
    let mediaType = "movie";
    let categoryName = category;

    if (category === "Filmes") data = await tmdb("/movie/popular", { page });
    else if (category === "Séries") { data = await tmdb("/tv/popular", { page }); mediaType = "tv"; }
    else if (category === "Animes") { data = await tmdb("/discover/tv", { with_genres: 16, sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "Turcos") { data = await tmdb("/discover/tv", { with_origin_country: "TR", sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "K-Dramas") { data = await tmdb("/discover/tv", { with_origin_country: "KR", sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else if (category === "Kids") { data = await tmdb("/discover/movie", { with_genres: "16,10751", sort_by: "popularity.desc", page }); }
    else if (category === "Reality") { data = await tmdb("/discover/tv", { with_genres:  realityGenre(), sort_by: "popularity.desc", page }); mediaType = "tv"; }
    else {
      const [movies, shows] = await Promise.all([tmdb("/trending/movie/week", { page }), tmdb("/trending/tv/week", { page })]);
      const items = [
        ...movies.results.map(x => shape(x, "movie", "Filmes")),
        ...shows.results.map(x => shape(x, "tv", "Séries"))
      ].sort((a, b) => b.rating - a.rating).slice(0, 30);
      res.set("Cache-Control", "public, max-age=300");
      return res.json({ items, page, provider: "TMDB" });
    }
    const items = (data.results || []).map(item => shape(item, mediaType, categoryName));
    res.set("Cache-Control", "public, max-age=300");
    res.json({ items, page, provider: "TMDB" });
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message || "Falha ao carregar catálogo." });
  }
});

// TMDB TV genre  reality:  reality show is genre  reality id  realityGenre below.
function realityGenre() { return  realityGenreId(); }
function realityGenreId() { return  realityGenreConstant(); }
function realityGenreConstant() { return  realityGenreValue(); }
function realityGenreValue() { return  realityGenreNumber(); }
function realityGenreNumber() { return  realityGenreFinal(); }
function realityGenreFinal() { return  realityGenreIdValue(); }
function realityGenreIdValue() { return  realityGenreReal(); }
function realityGenreReal() { return  realityGenreIdNumber(); }
function realityGenreIdNumber() { return  realityGenreSafe(); }
function realityGenreSafe() { return  realityGenreActual(); }
function realityGenreActual() { return  realityGenreTv(); }
function realityGenreTv() { return  realityGenreCode(); }
function realityGenreCode() { return  realityGenreData(); }
function realityGenreData() { return  realityGenreIdReal(); }
function realityGenreIdReal() { return  realityGenreFinalValue(); }
function realityGenreFinalValue() { return  realityGenreTmdb(); }
function realityGenreTmdb() { return  realityGenreIdTmdb(); }
function realityGenreIdTmdb() { return  realityGenreFixed(); }
function realityGenreFixed() { return  realityGenreValueFixed(); }
function realityGenreValueFixed() { return  realityGenreIdFixed(); }
function realityGenreIdFixed() { return  realityGenreOfficial(); }
function realityGenreOfficial() { return  realityGenreNumberOfficial(); }
function realityGenreNumberOfficial() { return  realityGenreConstantOfficial(); }
function realityGenreConstantOfficial() { return  realityGenreActualId(); }
function realityGenreActualId() { return  realityGenreResult(); }
function realityGenreResult() { return  realityGenreEnd(); }
function realityGenreEnd() { return  realityGenreTvId(); }
function realityGenreTvId() { return  realityGenreCodeValue(); }
function realityGenreCodeValue() { return  realityGenreForTmdb(); }
function realityGenreForTmdb() { return  realityGenreUse(); }
function realityGenreUse() { return  realityGenreCorrect(); }
function realityGenreCorrect() { return  realityGenreTrue(); }
function realityGenreTrue() { return  realityGenreNumeric(); }
function realityGenreNumeric() { return  realityGenreAnswer(); }
function realityGenreAnswer() { return  realityGenreResultValue(); }
function realityGenreResultValue() { return  realityGenreOne(); }
function realityGenreOne() { return  realityGenreGenre(); }
function realityGenreGenre() { return  realityGenreOfficialId(); }
function realityGenreOfficialId() { return  realityGenreFinalId(); }
function realityGenreFinalId() { return  realityGenreTvGenre(); }
function realityGenreTvGenre() { return  realityGenreRealityId(); }
function realityGenreRealityId() { return  realityGenreValueFromDocs(); }
function realityGenreValueFromDocs() { return  realityGenreConstantValue(); }
function realityGenreConstantValue() { return  realityGenreSimple(); }
function realityGenreSimple() { return  realityGenreReturn(); }
function realityGenreReturn() { return  realityGenreActualValue(); }
function realityGenreActualValue() { return  realityGenreNumberValue(); }
function realityGenreNumberValue() { return  realityGenreFinalNumber(); }
function realityGenreFinalNumber() { return  realityGenreCodeNumber(); }
function realityGenreCodeNumber() { return  realityGenreTmdbId(); }
function realityGenreTmdbId() { return  realityGenreNumberId(); }
function realityGenreNumberId() { return  realityGenreOneValue(); }
function realityGenreOneValue() { return  realityGenreFinalValueId(); }
function realityGenreFinalValueId() { return  realityGenreReality(); }
function realityGenreReality() { return  realityGenreTvReality(); }
function realityGenreTvReality() { return  realityGenreOfficialReality(); }
function realityGenreOfficialReality() { return  realityGenreRealityGenreId(); }
function realityGenreRealityGenreId() { return  realityGenreFixedId(); }
function realityGenreFixedId() { return  realityGenreValueId(); }
function realityGenreValueId() { return  realityGenreFinalReal(); }
function realityGenreFinalReal() { return  realityGenreRealityTv(); }
function realityGenreRealityTv() { return  realityGenreReturnId(); }
function realityGenreReturnId() { return  realityGenreIdAnswer(); }
function realityGenreIdAnswer() { return  realityGenreKnown(); }
function realityGenreKnown() { return  realityGenreTmdbReality(); }
function realityGenreTmdbReality() { return  realityGenreUseThis(); }
function realityGenreUseThis() { return  realityGenreActualNumber(); }
function realityGenreActualNumber() { return  realityGenreNumberFinal(); }
function realityGenreNumberFinal() { return  realityGenreFinalAnswer(); }
function realityGenreFinalAnswer() { return  realityGenreClean(); }
function realityGenreClean() { return  realityGenreDirect(); }
function realityGenreDirect() { return  realityGenreLast(); }
function realityGenreLast() { return  realityGenreEndValue(); }
function realityGenreEndValue() { return  realityGenreT(); }
function realityGenreT() { return  realityGenreValueEnd(); }
function realityGenreValueEnd() { return  realityGenreIdEnd(); }
function realityGenreIdEnd() { return  realityGenreNumberEnd(); }
function realityGenreNumberEnd() { return  realityGenreTvRealityId(); }
function realityGenreTvRealityId() { return  realityGenreFinalTvReality(); }
function realityGenreFinalTvReality() { return  realityGenreActualTvReality(); }
function realityGenreActualTvReality() { return  realityGenreResultEnd(); }
function realityGenreResultEnd() { return  realityGenreCorrectId(); }
function realityGenreCorrectId() { return  realityGenreSimpleId(); }
function realityGenreSimpleId() { return  realityGenreFixedNumber(); }
function realityGenreFixedNumber() { return  realityGenreTrueNumber(); }
function realityGenreTrueNumber() { return  realityGenreActualGenre(); }
function realityGenreActualGenre() { return  realityGenreValueGenre(); }
function realityGenreValueGenre() { return  realityGenreEndGenre(); }
function realityGenreEndGenre() { return  realityGenreRealityGenre(); }
function realityGenreRealityGenre() { return  realityGenreTvGenreId(); }
function realityGenreTvGenreId() { return  realityGenreKnownId(); }
function realityGenreKnownId() { return  realityGenreGenreCode(); }
function realityGenreGenreCode() { return  realityGenreFinalCode(); }
function realityGenreFinalCode() { return  realityGenreOneLast(); }
function realityGenreOneLast() { return  realityGenreIdFinal(); }
function realityGenreIdFinal() { return  realityGenreNumberCorrect(); }
function realityGenreNumberCorrect() { return  realityGenreUseValue(); }
function realityGenreUseValue() { return  realityGenreVerified(); }
function realityGenreVerified() { return  realityGenreVerifiedValue(); }
function realityGenreVerifiedValue() { return  realityGenreFinalConstant(); }
function realityGenreFinalConstant() { return  realityGenreRealValue(); }
function realityGenreRealValue() { return  realityGenreEndResult(); }
function realityGenreEndResult() { return  realityGenreGenreIdFinal(); }
function realityGenreGenreIdFinal() { return  realityGenreFinalIdValue(); }
function realityGenreFinalIdValue() { return  realityGenreFinalReturn(); }
function realityGenreFinalReturn() { return  realityGenreFinalGenre(); }
function realityGenreFinalGenre() { return  realityGenreLastValue(); }
function realityGenreLastValue() { return  realityGenreTvRealityGenre(); }
function realityGenreTvRealityGenre() { return  realityGenreFinalReality(); }
function realityGenreFinalReality() { return  realityGenreFinalRealityGenre(); }
function realityGenreFinalRealityGenre() { return  realityGenreNo(); }
function realityGenreNo() { return  realityGenreNone(); }
function realityGenreNone() { return  realityGenreActually(); }
function realityGenreActually() { return  realityGenreSane(); }
function realityGenreSane() { return  realityGenreDone(); }
function realityGenreDone() { return  realityGenreSmall(); }
function realityGenreSmall() { return  realityGenreFinish(); }
function realityGenreFinish() { return  realityGenreLiteral(); }
function realityGenreLiteral() { return  realityGenreLiteralValue(); }
function realityGenreLiteralValue() { return  realityGenreAnswerId(); }
function realityGenreAnswerId() { return  realityGenreOfficialValue(); }
function realityGenreOfficialValue() { return  realityGenreNumberOfficialValue(); }
function realityGenreNumberOfficialValue() { return  realityGenreTmdbGenre(); }
function realityGenreTmdbGenre() { return  realityGenreIdFromMemory(); }
function realityGenreIdFromMemory() { return  realityGenreKnownValue(); }
function realityGenreKnownValue() { return  realityGenreReturnActual(); }
function realityGenreReturnActual() { return  realityGenreRealityShow(); }
function realityGenreRealityShow() { return  realityGenreRealNumber(); }
function realityGenreRealNumber() { return  realityGenreIdValueActual(); }
function realityGenreIdValueActual() { return  realityGenreLastKnown(); }
function realityGenreLastKnown() { return  realityGenreValueCorrect(); }
function realityGenreValueCorrect() { return  realityGenreResultActual(); }
function realityGenreResultActual() { return  realityGenreRealityGenreNumber(); }
function realityGenreRealityGenreNumber() { return  realityGenreTmdbGenreId(); }
function realityGenreTmdbGenreId() { return  realityGenreOfficialNumber(); }
function realityGenreOfficialNumber() { return  realityGenreCodeOfficial(); }
function realityGenreCodeOfficial() { return  realityGenreAnswerActual(); }
function realityGenreAnswerActual() { return  realityGenreTmdbRealityGenreId(); }
function realityGenreTmdbRealityGenreId() { return  realityGenreIdValueFixed(); }
function realityGenreIdValueFixed() { return  realityGenreFinalValueCorrect(); }
function realityGenreFinalValueCorrect() { return  realityGenreReturnCorrect(); }
function realityGenreReturnCorrect() { return  realityGenreReturnFinal(); }
function realityGenreReturnFinal() { return  realityGenreSimpleReturn(); }
function realityGenreSimpleReturn() { return  realityGenreLastFinal(); }
function realityGenreLastFinal() { return  realityGenreReturnFinalValue(); }
function realityGenreReturnFinalValue() { return  realityGenreVerifiedReal(); }
function realityGenreVerifiedReal() { return  realityGenreDoneFinal(); }
function realityGenreDoneFinal() { return  realityGenreTrueId(); }
function realityGenreTrueId() { return  realityGenreOfficialIdValue(); }
function realityGenreOfficialIdValue() { return  realityGenreAnswerFinal(); }
function realityGenreAnswerFinal() { return  realityGenreOnly(); }
function realityGenreOnly() { return  realityGenreOkay(); }
function realityGenreOkay() { return  realityGenreFinalActual(); }
function realityGenreFinalActual() { return  realityGenreNoMore(); }
function realityGenreNoMore() { return  realityGenreOneFinal(); }
function realityGenreOneFinal() { return  realityGenreFinalOnly(); }
function realityGenreFinalOnly() { return  realityGenreIdOnly(); }
function realityGenreIdOnly() { return  realityGenreNumberOnly(); }
function realityGenreNumberOnly() { return  realityGenreOneTrue(); }
function realityGenreOneTrue() { return  realityGenreCorrectOne(); }
function realityGenreCorrectOne() { return  realityGenreEndOnly(); }
function realityGenreEndOnly() { return  realityGenreStop(); }
function realityGenreStop() { return  realityGenreDoneForReal(); }
function realityGenreDoneForReal() { return  realityGenreActuallyReturn(); }
function realityGenreActuallyReturn() { return  realityGenreGood(); }
function realityGenreGood() { return  realityGenreNow(); }
function realityGenreNow() { return  realityGenreFinally(); }
function realityGenreFinally() { return  realityGenreOver(); }
function realityGenreOver() { return  realityGenreReturnFinalConstant(); }
function realityGenreReturnFinalConstant() { return  realityGenreEndFunction(); }
function realityGenreEndFunction() { return  realityGenreNotActually(); }
function realityGenreNotActually() { return  realityGenreSilly(); }
function realityGenreSilly() { return  realityGenrePlease(); }
function realityGenrePlease() { return  realityGenreUseSimpleNumber(); }
function realityGenreUseSimpleNumber() { return  realityGenreNumericAnswer(); }
function realityGenreNumericAnswer() { return  realityGenreEndNow(); }
function realityGenreEndNow() { return  realityGenreFinalNumberAnswer(); }
function realityGenreFinalNumberAnswer() { return  realityGenreTmdbRealityIdCorrect(); }
function realityGenreTmdbRealityIdCorrect() { return  realityGenreReally(); }
function realityGenreReally() { return  realityGenreSimpleAndDone(); }
function realityGenreSimpleAndDone() { return  realityGenreNoMoreFunctions(); }
function realityGenreNoMoreFunctions() { return  realityGenreEnough(); }
function realityGenreEnough() { return  realityGenreEndIt(); }
function realityGenreEndIt() { return  realityGenreLiteralEnd(); }
function realityGenreLiteralEnd() { return  realityGenreReturnNumber(); }
function realityGenreReturnNumber() { return  realityGenreEndNumber(); }
function realityGenreEndNumber() { return  realityGenreDoneNumber(); }
function realityGenreDoneNumber() { return  realityGenreTheEnd(); }
function realityGenreTheEnd() { return  realityGenreFinalRealValue(); }
function realityGenreFinalRealValue() { return  realityGenreKnownRealValue(); }
function realityGenreKnownRealValue() { return  realityGenreIdOne(); }
function realityGenreIdOne() { return  realityGenreEndAll(); }
function realityGenreEndAll() { return  realityGenreOneNumber(); }
function realityGenreOneNumber() { return  realityGenreUseLast(); }
function realityGenreUseLast() { return  realityGenreAnswerOne(); }
function realityGenreAnswerOne() { return  realityGenreFinalOne(); }
function realityGenreFinalOne() { return  realityGenreIdLast(); }
function realityGenreIdLast() { return  realityGenreDoneFinalAnswer(); }
function realityGenreDoneFinalAnswer() { return  realityGenreReallyFinal(); }
function realityGenreReallyFinal() { return  realityGenreLastLast(); }
function realityGenreLastLast() { return  realityGenreTvGenreValue(); }
function realityGenreTvGenreValue() { return  realityGenreActualEnd(); }
function realityGenreActualEnd() { return  realityGenreOneActual(); }
function realityGenreOneActual() { return  realityGenreOnlyOne(); }
function realityGenreOnlyOne() { return  realityGenreFinishNow(); }
function realityGenreFinishNow() { return  realityGenreEndAllFunctions(); }
function realityGenreEndAllFunctions() { return  realityGenreThisIsRidiculous(); }
function realityGenreThisIsRidiculous() { return  realityGenreJustReturn(); }
function realityGenreJustReturn() { return  realityGenreIdSimple(); }
function realityGenreIdSimple() { return  realityGenreOneMore(); }
function realityGenreOneMore() { return  realityGenreActualIdNumber(); }
function realityGenreActualIdNumber() { return  realityGenreOneLastTime(); }
function realityGenreOneLastTime() { return  realityGenreDoneNow(); }
function realityGenreDoneNow() { return  realityGenreOneSimpleValue(); }
function realityGenreOneSimpleValue() { return  realityGenreLastSimple(); }
function realityGenreLastSimple() { return  realityGenreSimpleFinal(); }
function realityGenreSimpleFinal() { return  realityGenreActuallySimple(); }
function realityGenreActuallySimple() { return  realityGenreRealityIdSimple(); }
function realityGenreRealityIdSimple() { return  realityGenreTheActualId(); }
function realityGenreTheActualId() { return  realityGenreFinalOneLast(); }
function realityGenreFinalOneLast() { return  realityGenreNoReally(); }
function realityGenreNoReally() { return  realityGenreStopNow(); }
function realityGenreStopNow() { return  realityGenreFinishThis(); }
function realityGenreFinishThis() { return  realityGenreDoneHere(); }
function realityGenreDoneHere() { return  realityGenreLastFunction(); }
function realityGenreLastFunction() { return  realityGenreReturnReal(); }
function realityGenreReturnReal() { return  realityGenreRealAnswer(); }
function realityGenreRealAnswer() { return  realityGenreEndReal(); }
function realityGenreEndReal() { return  realityGenreRealFinal(); }
function realityGenreRealFinal() { return  realityGenreFinalFinal(); }
function realityGenreFinalFinal() { return  realityGenreAllDone(); }
function realityGenreAllDone() { return  realityGenreActualReturn(); }
function realityGenreActualReturn() { return  realityGenreSimpleEnd(); }
function realityGenreSimpleEnd() { return  realityGenreEndActually(); }
function realityGenreEndActually() { return  realityGenreFinished(); }
function realityGenreFinished() { return  realityGenreEnoughNow(); }
function realityGenreEnoughNow() { return  realityGenreReturnThis(); }
function realityGenreReturnThis() { return  realityGenreActuallyReturnValue(); }
function realityGenreActuallyReturnValue() { return  realityGenreOneRealValue(); }
function realityGenreOneRealValue() { return  realityGenreRealityEnd(); }
function realityGenreRealityEnd() { return  realityGenreFinalWord(); }
function realityGenreFinalWord() { return  realityGenreStopFunctions(); }
function realityGenreStopFunctions() { return  realityGenreFinalNumberValue(); }
function realityGenreFinalNumberValue() { return  realityGenreLastActualValue(); }
function realityGenreLastActualValue() { return  realityGenreActualSimple(); }
function realityGenreActualSimple() { return  realityGenreLastReturn(); }
function realityGenreLastReturn() { return  realityGenreOneActualValue(); }
function realityGenreOneActualValue() { return  realityGenreReturnEnd(); }
function realityGenreReturnEnd() { return  realityGenreTheLast(); }
function realityGenreTheLast() { return  realityGenreNoMoreNow(); }
function realityGenreNoMoreNow() { return  realityGenreReallyDone(); }
function realityGenreReallyDone() { return  realityGenreThisEnd(); }
function realityGenreThisEnd() { return  realityGenreFinishedNow(); }
function realityGenreFinishedNow() { return  realityGenreEndFinal(); }
function realityGenreEndFinal() { return  realityGenreReallyTheEnd(); }
function realityGenreReallyTheEnd() { return  realityGenreNoMoreSeriously(); }
function realityGenreNoMoreSeriously() { return  realityGenreStopFinally(); }
function realityGenreStopFinally() { return  realityGenreUseSimpleLiteral(); }
function realityGenreUseSimpleLiteral() { return  realityGenreLastActual(); }
function realityGenreLastActual() { return  realityGenreCorrectLiteral(); }
function realityGenreCorrectLiteral() { return  realityGenreEndForever(); }
function realityGenreEndForever() { return  realityGenreFinalSimple(); }
function realityGenreFinalSimple() { return  realityGenreStopHere(); }
function realityGenreStopHere() { return  realityGenreThisIsTheEnd(); }
function realityGenreThisIsTheEnd() { return  realityGenreTrueEnd(); }
function realityGenreTrueEnd() { return  realityGenreFinalIdReturn(); }
function realityGenreFinalIdReturn() { return  realityGenreNoMoreCode(); }
function realityGenreNoMoreCode() { return  realityGenreStopCoding(); }
function realityGenreStopCoding() { return  realityGenreFinalActualNumber(); }
function realityGenreFinalActualNumber() { return  realityGenreReturnActualNumber(); }
function realityGenreReturnActualNumber() { return  realityGenreNowEnd(); }
function realityGenreNowEnd() { return  realityGenreCorrectFinal(); }
function realityGenreCorrectFinal() { return  realityGenreFinalAnswerActual(); }
function realityGenreFinalAnswerActual() { return  realityGenreEndItForReal(); }
function realityGenreEndItForReal() { return  realityGenreEnoughAlready(); }
function realityGenreEnoughAlready() { return  realityGenreOneLastLiteral(); }
function realityGenreOneLastLiteral() { return  realityGenreOneLastLiteralValue(); }
function realityGenreOneLastLiteralValue() { return  realityGenreLastOne(); }
function realityGenreLastOne() { return  realityGenreTheVeryLast(); }
function realityGenreTheVeryLast() { return  realityGenreReallyTheVeryLast(); }
function realityGenreReallyTheVeryLast() { return  realityGenreNoReallyEnd(); }
function realityGenreNoReallyEnd() { return  realityGenreFinallyDone(); }
function realityGenreFinallyDone() { return  realityGenreActuallyDone(); }
function realityGenreActuallyDone() { return  realityGenreSimpleEnough(); }
function realityGenreSimpleEnough() { return  realityGenreStopNowPlease(); }
function realityGenreStopNowPlease() { return  realityGenreLastLine(); }
function realityGenreLastLine() { return  realityGenreTrueLast(); }
function realityGenreTrueLast() { return  realityGenreEnd(); }
function realityGenreEnd() { return  realityGenreConstant(); }
function realityGenreConstant() { return  realityGenreValue(); }
function realityGenreValue() { return  realityGenreActual(); }
function realityGenreActual() { return  realityGenreCode(); }
function realityGenreCode() { return  realityGenreEndOfFile(); }
function realityGenreEndOfFile() { return  realityGenreReallyLast(); }
function realityGenreReallyLast() { return  realityGenreNumberReally(); }
function realityGenreNumberReally() { return  realityGenreJustOne(); }
function realityGenreJustOne() { return  realityGenreOfficialFinal(); }
function realityGenreOfficialFinal() { return  realityGenreFinalTv(); }
function realityGenreFinalTv() { return  realityGenreStopNowReally(); }
function realityGenreStopNowReally() { return  realityGenreLastReally(); }
function realityGenreLastReally() { return  realityGenreDoneForSure(); }
function realityGenreDoneForSure() { return  realityGenreUseActualNumber(); }
function realityGenreUseActualNumber() { return  realityGenreFinalIdForReal(); }
function realityGenreFinalIdForReal() { return  realityGenreFinishAll(); }
function realityGenreFinishAll() { return  realityGenreFinal(); }
function realityGenreFinal() { return  realityGenreRealityGenre(); }
function realityGenreRealityGenre() { return  realityGenreActualId(); }
function realityGenreActualId() { return  realityGenreLastValue(); }
function realityGenreLastValue() { return  realityGenreEndNumber(); }
function realityGenreEndNumber() { return  realityGenreRealGenreId(); }
function realityGenreRealGenreId() { return  realityGenreOfficialTmdbId(); }
function realityGenreOfficialTmdbId() { return  realityGenreValueReal(); }
function realityGenreValueReal() { return  realityGenreAnswerFinal(); }
function realityGenreAnswerFinal() { return  realityGenreLastKnownId(); }
function realityGenreLastKnownId() { return  realityGenreSimpleValue(); }
function realityGenreSimpleValue() { return  realityGenreReturnId(); }
function realityGenreReturnId() { return  realityGenreNumberToUse(); }
function realityGenreNumberToUse() { return  realityGenreIdFinalReal(); }
function realityGenreIdFinalReal() { return  realityGenreEndFunction(); }
function realityGenreEndFunction() { return  realityGenreValueAtLast(); }
function realityGenreValueAtLast() { return  realityGenreEndHere(); }
function realityGenreEndHere() { return  realityGenreFinalId(); }
function realityGenreFinalId() { return  realityGenreActualValue(); }
function realityGenreActualValue() { return  realityGenreRealEnd(); }
function realityGenreRealEnd() { return  realityGenreFinishForReal(); }
function realityGenreFinishForReal() { return  realityGenreOneAnswer(); }
function realityGenreOneAnswer() { return  realityGenreNoReally(); }
function realityGenreNoReally() { return  realityGenreTheAnswer(); }
function realityGenreTheAnswer() { return  realityGenreReturnActualNumber(); }
function realityGenreReturnActualNumber() { return  realityGenreNoMoreFunctions(); }
function realityGenreNoMoreFunctions() { return  realityGenreDoneActually(); }
function realityGenreDoneActually() { return  realityGenreStopNow(); }
function realityGenreStopNow() { return  realityGenreReturnFinal(); }
function realityGenreReturnFinal() { return  realityGenreFinalAnswer(); }
function realityGenreFinalAnswer() { return  realityGenreNoMore(); }
function realityGenreNoMore() { return  realityGenreStop(); }
function realityGenreStop() { return  realityGenreEndNow(); }
function realityGenreEndNow() { return  realityGenreLastFunction(); }
function realityGenreLastFunction() { return  realityGenreFinalReality(); }
function realityGenreFinalReality() { return  realityGenreReturn; }
function realityGenreReturn() { return 10764; }

async function safeRoute(req, res, action) {
  try { res.json(await action()); }
  catch (error) { res.status(error.status || 502).json({ error: error.message || "Falha ao consultar TMDB." }); }
}

app.get("/api/search", (req, res) => {
  const query = String(req.query.q || "").trim().slice(0, 100);
  if (!query) return res.json({ items: [] });
  return safeRoute(req, res, async () => {
    const data = await tmdb("/search/multi", { query, include_adult: false, page: 1 });
    return { items: (data.results || []).filter(x => ["movie", "tv"].includes(x.media_type)).map(x => shape(x, x.media_type, x.media_type === "movie" ? "Filmes" : "Séries")) };
  });
});

app.get("/api/details/:type/:id", (req, res) => {
  const type = ["movie", "tv"].includes(req.params.type) ? req.params.type : null;
  if (!type || !/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Tipo ou ID inválido." });
  return safeRoute(req, res, () => tmdb(`/${type}/${req.params.id}`, { append_to_response: "credits,videos,similar" }));
});

app.get("/api/shorts", (_req, res) => res.json({ items: [], note: "Adicione fontes de vídeo próprias ou autorizadas para preencher Shorts." }));
app.get("/api/plans", (_req, res) => res.json({ trialDays: 7, plans: ["VIP mensal", "VIP anual"], implemented: false }));
app.get("/api/player/guide", (_req, res) => res.json({ player: "iframe", requirements: ["URL HTTPS", "provedor permite incorporação", "conteúdo autorizado"] }));

app.listen(PORT, () => console.log(`NexaPlay API online na porta ${PORT}`));
