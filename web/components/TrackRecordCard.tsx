import styles from "./TrackRecordCard.module.css";
import { formatPercent } from "@/lib/format";
import type { TrackRecord } from "@/lib/types";

/**
 * Versão completa do resumo — usada no topo do histórico. O CLV é o
 * número grande (é a métrica que prova o motor); resultado e amostra
 * ficam como contexto secundário, não escondidos, mas também não como
 * "hero" — evita a leitura errada de "resultado é o que importa".
 */
export function TrackRecordCard({ record }: { record: TrackRecord }) {
  return (
    <div className={styles.card}>
      <div>
        <span className={styles.label}>CLV médio · {record.windowLabel}</span>
        <div>
          <span className={`${styles.value} mono`}>{formatPercent(record.avgClv)}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.stat}>
          <span className={`${styles.statValue} mono`}>{record.n}</span>
          <span className={styles.statLabel}>alertas</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} mono`}>{formatPercent(record.winRate)}</span>
          <span className={styles.statLabel}>taxa de acerto</span>
        </div>
      </div>

      <p className={styles.note}>
        CLV é a métrica que prova o motor — uma aposta pode perder com CLV positivo (foi azar,
        não erro) ou ganhar com CLV negativo (foi sorte). Por isso olhamos o CLV, não só quem
        ganhou.
      </p>
    </div>
  );
}
