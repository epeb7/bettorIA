/**
 * Script de descoberta — roda uma vez, na mão, pra mapear o que a OddsPapi
 * realmente devolve com nossa chave: nome exato do bet365 (pode ter sufixo
 * regional, ex "bet365 BR"), e confirmar o formato de resposta antes de
 * escrever o parser de verdade em scan.ts.
 *
 * Uso:
 *   ODDSPAPI_API_KEY=xxx npx tsx src/jobs/discover.ts
 */
import { oddsPapiFromEnv } from "../adapters/oddspapi";

async function main() {
  const api = oddsPapiFromEnv();

  console.log("=== /v4/bookmakers ===");
  const bookmakers = await api.listBookmakers();
  console.log(`Total: ${bookmakers.length}`);
  const bet365Variants = bookmakers.filter((b) => b.name.toLowerCase().includes("bet365"));
  const pinnacle = bookmakers.filter((b) => b.name.toLowerCase().includes("pinnacle"));
  const betfair = bookmakers.filter((b) => b.name.toLowerCase().includes("betfair"));
  console.log("Variantes de bet365 encontradas:", bet365Variants);
  console.log("Pinnacle:", pinnacle);
  console.log("Betfair:", betfair);

  // TODO: ainda não confirmamos o endpoint de listagem de campeonatos/tournamentIds.
  // Checar a doc real da OddsPapi (ou suporte deles) por algo como /v4/tournaments.
  // Enquanto isso, sem tournamentIds não dá pra chamar getOddsByTournaments — é o
  // próximo passo depois de rodar este script.
  console.log(
    "\nPróximo passo: achar o endpoint de listagem de campeonatos (tournamentIds) na doc da OddsPapi."
  );
}

main().catch((err) => {
  console.error("Falhou:", err);
  process.exit(1);
});
