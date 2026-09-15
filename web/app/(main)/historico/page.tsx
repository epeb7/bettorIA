import styles from "./page.module.css";
import { TrackRecordCard } from "@/components/TrackRecordCard";
import { HistoryList } from "@/components/HistoryList";
import { LEAGUES } from "@/lib/leagues";
import type { HistoricalAlert, TrackRecord } from "@/lib/types";

// TODO: substituir por dados reais do Supabase (tabelas `alerts` +
// `closing_lines`, ver CLAUDE.md § "Banco de dados"). Os exemplos abaixo
// são de propósito MISTOS — ganhou/perdeu, CLV positivo/negativo — porque
// a promessa do produto é mostrar os erros também, não só os green.
//
// Champions League e Premier League ficam SEM exemplo de propósito: em
// setembro a maioria dos campeonatos europeus está no início da
// temporada, então o histórico real deles também estaria vazio agora —
// isso mostra o aviso de "início de temporada" funcionando de verdade.
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

const SAMPLE_TRACK_RECORD: TrackRecord = {
  windowLabel: "30 dias",
  avgClv: 0.021,
  n: 42,
  winRate: 0.52,
};

const SAMPLE_HISTORY: HistoricalAlert[] = [
  // La Liga
  {
    id: "h1",
    homeTeam: "Atlético Madrid",
    awayTeam: "Osasuna",
    league: "La Liga",
    market: "Escanteios · Over 9.5",
    settledAt: daysAgo(1),
    oddTaken: 2.1,
    clv: 0.058,
    outcome: "won",
  },
  {
    id: "h2",
    homeTeam: "Real Betis",
    awayTeam: "Valencia",
    league: "La Liga",
    market: "Ambas Marcam · Sim",
    settledAt: daysAgo(2),
    oddTaken: 1.92,
    clv: 0.034,
    outcome: "lost",
  },
  {
    id: "h3",
    homeTeam: "Villarreal",
    awayTeam: "Celta de Vigo",
    league: "La Liga",
    market: "1X2 · Casa",
    settledAt: daysAgo(3),
    oddTaken: 2.35,
    clv: -0.008,
    outcome: "won",
  },
  {
    id: "h4",
    homeTeam: "Girona",
    awayTeam: "Alavés",
    league: "La Liga",
    market: "Cartões · Over 4.5",
    settledAt: daysAgo(4),
    oddTaken: 1.78,
    clv: -0.012,
    outcome: "lost",
  },
  {
    id: "h5",
    homeTeam: "Real Sociedad",
    awayTeam: "Mallorca",
    league: "La Liga",
    market: "Gols · Over 2.5",
    settledAt: daysAgo(6),
    oddTaken: 1.95,
    clv: 0.0,
    outcome: "void",
  },
  {
    id: "h6",
    homeTeam: "Real Madrid",
    awayTeam: "Sevilla",
    league: "La Liga",
    market: "Gols · Over 2.5",
    settledAt: daysAgo(8),
    oddTaken: 1.85,
    clv: 0.021,
    outcome: "won",
  },
  // Brasileirão — temporada no meio do ano, histórico mais rico
  {
    id: "b1",
    homeTeam: "Flamengo",
    awayTeam: "Fluminense",
    league: "Brasileirão",
    market: "Escanteios · Over 10.5",
    settledAt: daysAgo(1),
    oddTaken: 1.98,
    clv: 0.041,
    outcome: "won",
  },
  {
    id: "b2",
    homeTeam: "Palmeiras",
    awayTeam: "São Paulo",
    league: "Brasileirão",
    market: "Ambas Marcam · Sim",
    settledAt: daysAgo(2),
    oddTaken: 1.87,
    clv: 0.027,
    outcome: "won",
  },
  {
    id: "b3",
    homeTeam: "Atlético-MG",
    awayTeam: "Cruzeiro",
    league: "Brasileirão",
    market: "Cartões · Over 5.5",
    settledAt: daysAgo(3),
    oddTaken: 2.05,
    clv: -0.015,
    outcome: "lost",
  },
  {
    id: "b4",
    homeTeam: "Grêmio",
    awayTeam: "Internacional",
    league: "Brasileirão",
    market: "1X2 · Fora",
    settledAt: daysAgo(5),
    oddTaken: 3.1,
    clv: 0.062,
    outcome: "lost",
  },
  {
    id: "b5",
    homeTeam: "Botafogo",
    awayTeam: "Vasco",
    league: "Brasileirão",
    market: "Gols · Over 2.5",
    settledAt: daysAgo(7),
    oddTaken: 1.91,
    clv: 0.018,
    outcome: "won",
  },
  {
    id: "b6",
    homeTeam: "Bahia",
    awayTeam: "Corinthians",
    league: "Brasileirão",
    market: "Escanteios · Over 9.5",
    settledAt: daysAgo(9),
    oddTaken: 2.0,
    clv: -0.006,
    outcome: "won",
  },
];

export default function HistoricoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>Histórico</span>
      </div>

      <div className={styles.content}>
        <div className={styles.trackRecordWrap}>
          <TrackRecordCard record={SAMPLE_TRACK_RECORD} />
        </div>

        <HistoryList alerts={SAMPLE_HISTORY} leagues={LEAGUES} />
      </div>
    </main>
  );
}
