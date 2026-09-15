import Link from "next/link";
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
          <Link href="/historico" className={styles.clvLink} aria-label="Ver histórico">
            <span className={`${styles.clvPill} mono`}>
              CLV {formatPercent(trackRecord.avgClv)}
            </span>
          </Link>
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        </button>
      </div>
    </header>
  );
}
