import styles from "./HistoryCard.module.css";
import { formatPercent } from "@/lib/format";
import { formatPastDate } from "@/lib/time";
import type { HistoricalAlert } from "@/lib/types";

const OUTCOME_LABEL: Record<HistoricalAlert["outcome"], string> = {
  won: "Ganhou",
  lost: "Perdeu",
  void: "Anulado",
};

const OUTCOME_CLASS: Record<HistoricalAlert["outcome"], string> = {
  won: "outcomeWon",
  lost: "outcomeLost",
  void: "outcomeVoid",
};

/**
 * Uma linha do histórico. CLV é o número com cor (é a métrica que prova
 * o motor); "ganhou/perdeu" é um selo neutro, de propósito — não reforça
 * a leitura errada de que perder = motor errado (ver TrackRecordCard).
 */
export function HistoryCard({ alert }: { alert: HistoricalAlert }) {
  const clvPositive = alert.clv >= 0;

  return (
    <article className={styles.card}>
      <div className={styles.info}>
        <span className={styles.teams}>
          {alert.homeTeam} × {alert.awayTeam}
        </span>
        <span className={styles.meta}>
          {alert.market} · {formatPastDate(alert.settledAt)} · odd {alert.oddTaken.toFixed(2)}
        </span>
      </div>

      <div className={styles.right}>
        <span className={`${styles.outcome} ${styles[OUTCOME_CLASS[alert.outcome]]}`}>
          {OUTCOME_LABEL[alert.outcome]}
        </span>
        <div className={styles.clv}>
          <span className={styles.clvLabel}>clv</span>
          <span
            className={`${styles.clvValue} ${clvPositive ? styles.clvPositive : styles.clvNegative} mono`}
          >
            {formatPercent(alert.clv)}
          </span>
        </div>
      </div>
    </article>
  );
}
