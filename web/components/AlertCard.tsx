import styles from "./AlertCard.module.css";
import { formatOdd, formatPercent } from "@/lib/format";
import type { MatchAlert } from "@/lib/types";

export function AlertCard({ alert }: { alert: MatchAlert }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.matchInfo}>
          <span className={styles.teams}>
            {alert.homeTeam} × {alert.awayTeam}
          </span>
          <span className={styles.market}>{alert.market}</span>
        </div>
        <span className={styles.kickoff}>{alert.kickoffLabel}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>bet365</span>
          <span className={`${styles.statValue} mono`}>{formatOdd(alert.bet365Odd)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>justo</span>
          <span className={`${styles.statValue} mono`}>{formatOdd(alert.fairOdd)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>valor</span>
          <span className={`${styles.statValue} ${styles.statValuePositive} mono`}>
            {formatPercent(alert.ev)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>aposte</span>
          <span className={`${styles.statValue} mono`}>{formatPercent(alert.suggestedStake)}</span>
        </div>
      </div>
    </article>
  );
}
