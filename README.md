# NexaPlay

Aplicativo de entretenimento com interface web responsiva e backend Node.js para consultar o catálogo TMDB sem expor a chave no navegador.

## Estrutura inicial
- `backend/`: API Node.js/Express e integração segura com TMDB.
- `web/`: interface de catálogo e player para fontes de vídeo autorizadas.
- `docs/`: notas de integração e plataformas.
- `apps/`: estruturas iniciais para Android, Samsung Tizen e LG webOS.

## Executar localmente
Requer Node.js 18+.

1. Entre em `backend/`.
2. Copie `.env.example` para `.env` e preencha `TMDB_READ_ACCESS_TOKEN` ou `TMDB_API_KEY` localmente.
3. Execute `npm install` e `npm start`.
4. Abra `http://localhost:8080` e teste `/api/health`.

Nunca publique o arquivo `.env` nem coloque chaves em HTML, JavaScript público ou aplicativos distribuídos.

## Importante
O TMDB fornece metadados e imagens, não vídeos completos. Use apenas fontes de vídeo próprias, licenciadas ou autorizadas. Login, teste VIP, gestão de contas e pagamentos ainda não estão implementados. As pastas de TV são bases de desenvolvimento, não apps compilados/assinados prontos para lojas.

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Exiba a atribuição exigida pelo TMDB e confira os termos atuais antes de qualquer uso comercial.