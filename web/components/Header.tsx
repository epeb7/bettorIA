import styles from "./Header.module.css";
import { formatPercent } from "@/lib/format";
import { Glossary } from "./Glossary";
import type { TrackRecord } from "@/lib/types";

export function Header({ trackRecord }: { trackRecord?: TrackRecord }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.wordmark}>bettorIA</span>
        {trackRecord && (
          <span className={`${styles.clvPill} mono`}>
            CLV {formatPercent(trackRecord.avgClv)}
          </span>
        )}
      </div>
      <div className={styles.right}>
        <Glossary />
        <button className={styles.avatar} aria-label="Perfil e configurações" type="button">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.4 0.01 90)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        </button>
      </div>
    </header>
  );
}
