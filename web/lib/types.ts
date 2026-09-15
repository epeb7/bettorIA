/**
 * Tipos do lado do front — espelham o que o engine grava (ver
 * engine/src/jobs/scan.ts e engine/src/engine/math.ts), mas o front nunca
 * calcula nada, só exibe o que já veio pronto do banco.
 */
export interface MatchAlert {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  /** horário real do jogo, ISO 8601 — vira "hoje 21:00" e contagem regressiva no navegador, sem chamada nenhuma */
  kickoffAt: string;
  market: string; // ex: "Escanteios — Over 9.5"
  bet365Odd: number;
  fairOdd: number;
  ev: number; // ex 0.078 = +7,8%
  suggestedStake: number; // ex 0.019 = 1,9% da banca
}

export interface TrackRecord {
  windowLabel: string; // ex: "últimos 7 dias"
  avgClv: number; // ex 0.0184 = +1,84%
  n: number; // quantidade de alertas na janela — dá credibilidade ao número
  winRate: number; // ex 0.55 = 55% dos palpites ganharam (métrica secundária, ver HistoricalAlert)
}

/**
 * Um alerta já fechado — resultado real, pra tela de histórico. Diferente
 * de MatchAlert (que é "o que sugerimos agora"), aqui o que importa é
 * `clv`, não `ev`: é a métrica que prova o motor, não o resultado de uma
 * aposta isolada (ver CLAUDE.md § "Descoberta: CLV viabiliza o negócio").
 * `outcome` é mostrado porque as pessoas entendem "ganhou/perdeu" de
 * cara, mas é a métrica secundária — CLV positivo com aposta perdida
 * ainda é o motor acertando, e a tela precisa deixar isso visível, não
 * só os green.
 */
export interface HistoricalAlert {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  settledAt: string; // ISO 8601 — quando o jogo terminou
  oddTaken: number;
  clv: number; // pode ser negativo — mostrar sempre, nunca esconder
  outcome: "won" | "lost" | "void";
}
