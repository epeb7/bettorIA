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
}
