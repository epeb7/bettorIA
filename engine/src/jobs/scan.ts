/**
 * Job periódico — Camada 1 do motor ("Consenso sem vig", ver CLAUDE.md).
 * Roda a cada 15 min via cron do Render (ver render.yaml).
 *
 * Fluxo: busca odds da bet365 + do consenso (demais casas) pros campeonatos
 * configurados, calcula EV/Kelly por mercado, e grava os alertas que passarem
 * do limiar.
 *
 * ATENÇÃO: o parsing de `bookmakerOdds[...].markets` abaixo ainda é um
 * placeholder — a forma exata do JSON de mercados da OddsPapi só é conhecida
 * depois de rodar discover.ts e ver uma resposta real. Não subir pro cron do
 * Render antes de confirmar isso com uma chamada de teste.
 *
 * PRINCÍPIO DE REQUISIÇÃO — uma chamada, vários palpites: `getOddsByTournaments`
 * já recebe uma LISTA de tournamentIds e devolve todos os jogos numa resposta
 * só (ver adapters/oddspapi.ts). O loop abaixo é por LIGA, nunca por JOGO —
 * calcular EV pra cada mercado de cada fixture acontece depois, em memória,
 * sobre a resposta já baixada. Isso é o que faz o orçamento de requisição do
 * CLAUDE.md fechar (5 requisições cobrem 28 jogos + todos os mercados deles).
 * Se algum dia parecer necessário chamar a API dentro do loop de fixtures,
 * é sinal de bug, não de feature — voltar e batchear.
 */
import { oddsPapiFromEnv, type OddsPapiFixture } from "../adapters/oddspapi";
import { evaluateMarket, type OddsSide } from "../engine/math";

// TODO: confirmar os tournamentIds reais da OddsPapi para estas 3 ligas
// (ver discover.ts — falta achar o endpoint de listagem de campeonatos).
const TOURNAMENT_IDS: Record<string, string> = {
  "la-liga": "TODO",
  "champions-league": "TODO",
  "premier-league": "TODO",
};

// Limiar mínimo de EV pra virar alerta — provisório, recalibrar depois que
// tivermos alertas reais medidos por CLV (ver "Regra invariável de operação").
const EV_THRESHOLD = 0.03;

export interface Alert {
  fixtureId: string;
  market: string;
  side: string;
  bet365Odd: number;
  fairProbability: number;
  ev: number;
  kellyStake: number;
  computedAt: string;
}

/**
 * Extrai os lados de odds de um mercado específico devolvido pela OddsPapi.
 * PLACEHOLDER — ajustar assim que virmos uma resposta real (discover.ts).
 */
function extractSidesForMarket(_fixture: OddsPapiFixture, _marketName: string): OddsSide[] {
  throw new Error(
    "extractSidesForMarket ainda não implementado — rode discover.ts, veja o JSON real de " +
      "bookmakerOdds[casa].markets, e escreva o parser aqui antes de ligar este job."
  );
}

export async function runScan(): Promise<Alert[]> {
  const api = oddsPapiFromEnv();
  const alerts: Alert[] = [];

  for (const [league, tournamentId] of Object.entries(TOURNAMENT_IDS)) {
    if (tournamentId === "TODO") {
      console.warn(`[scan] pulando ${league} — tournamentId ainda não mapeado`);
      continue;
    }

    const bet365Fixtures = await api.getOddsByTournaments("bet365", [tournamentId]);

    for (const fixture of bet365Fixtures) {
      if (!fixture.hasOdds) continue;

      // TODO: iterar os mercados reais do fixture (assim que extractSidesForMarket
      // estiver implementado) e chamar evaluateMarket() pra cada lado.
      // Estrutura pretendida:
      //
      // const consensusSides = extractSidesForMarket(fixture, "ML");
      // const bet365Odd = ... // ler do bookmakerOdds["bet365"]
      // const evalResult = evaluateMarket(consensusSides, "home", bet365Odd);
      // if (evalResult.ev > EV_THRESHOLD) {
      //   alerts.push({ fixtureId: fixture.fixtureId, market: "ML", side: "home",
      //     bet365Odd, fairProbability: evalResult.fairProbability, ev: evalResult.ev,
      //     kellyStake: evalResult.kellyStake, computedAt: new Date().toISOString() });
      // }
    }
  }

  console.log(`[scan] ${alerts.length} alertas gerados`);
  return alerts;
}

if (require.main === module) {
  runScan().catch((err) => {
    console.error("[scan] falhou:", err);
    process.exit(1);
  });
}
