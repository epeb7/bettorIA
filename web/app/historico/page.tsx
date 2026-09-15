import Link from "next/link";
import styles from "./page.module.css";
import { TrackRecordCard } from "@/components/TrackRecordCard";
import { HistoryCard } from "@/components/HistoryCard";
import type { HistoricalAlert, TrackRecord } from "@/lib/types";

// TODO: substituir por dados reais do Supabase (tabelas `alerts` +
// `closing_lines`, ver CLAUDE.md § "Banco de dados"). Os exemplos abaixo
// são de propósito MISTOS — ganhou/perdeu, CLV positivo/negativo — porque
// a promessa do produto é mostrar os erros também, não só os green (ver
// CLAUDE.md § "Descoberta: CLV viabiliza o negócio").
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

const SAMPLE_TRACK_RECORD: TrackRecord = {
  windowLabel: "30 dias",
  avgClv: 0.021,
  n: 42,
  winRate: 0.52,
};

const SAMPLE_HISTORY: HistoricalAlert[] = [
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
];

export default function HistoricoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className={styles.title}>Histórico</span>
      </div>

      <div className={styles.content}>
        <TrackRecordCard record={SAMPLE_TRACK_RECORD} />

        <span className={styles.sectionLabel}>Alertas recentes</span>
        <div className={styles.list}>
          {SAMPLE_HISTORY.map((alert) => (
            <HistoryCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </main>
  );
}
