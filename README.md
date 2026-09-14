# bettorIA

Copiloto de sugestão de apostas de futebol, com ênfase na bet365. Ver
[CLAUDE.md](CLAUDE.md) pro contexto completo (produto, matemática do motor,
decisões de arquitetura, plano de lançamento).

## Estrutura

```
web/      Interface (Next.js, mobile-first) — deploy: Vercel
engine/   Motor de valor: adaptador OddsPapi + cálculo de EV/Kelly/CLV — deploy: Render (cron job)
```

Cada pasta é independente (`package.json` próprio) — não é monorepo com
workspace compartilhado por enquanto, propositalmente simples pra sair do
zero rápido.

## `web/` — rodar local

```bash
cd web
npm install
npm run dev     # http://localhost:3000
```

Hoje a tela mostra dados de exemplo (`SAMPLE_ALERTS` em `app/page.tsx`) — os
mesmos usados no canvas de design aprovado. Trocar por dados reais do
Supabase é o próximo passo (ver TODOs no código).

**Deploy na Vercel**: importar o repositório, apontar o *Root Directory* pra
`web/`. A Vercel detecta Next.js sozinha, não precisa de config extra.

## `engine/` — rodar local

```bash
cd engine
npm install
cp .env.example .env    # preencher ODDSPAPI_API_KEY
npm run discover        # confirma nomes reais de bookmaker (bet365, pinnacle, betfair)
npm test                 # testa a matemática (overround, EV, Kelly, CLV, Shin)
```

`npm run scan` ainda não está pronto pra produção — falta mapear os
`tournamentIds` reais da OddsPapi e implementar `extractSidesForMarket` (ver
TODOs em `src/jobs/scan.ts` e `src/jobs/discover.ts`).

**Deploy no Render**: usar o `render.yaml` na raiz (Blueprint) — cria
automaticamente um cron job rodando `npm run scan` a cada 15 min. Configurar
`ODDSPAPI_API_KEY` no painel do Render (Environment), nunca no `.env.example`
nem no código.

## Segurança

`.env` está no `.gitignore` — nunca commitar chave de API. `render.yaml`
referencia `ODDSPAPI_API_KEY` com `sync: false`, ou seja, o valor é
configurado manualmente no painel do Render, não vai pro git.
