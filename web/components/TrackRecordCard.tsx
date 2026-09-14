import styles from "./TrackRecordCard.module.css";
import { formatPercent } from "@/lib/format";
import type { TrackRecord } from "@/lib/types";

export function TrackRecordCard({ record }: { record: TrackRecord }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>CLV médio · {record.windowLabel}</span>
      <span className={`${styles.value} mono`}>{formatPercent(record.avgClv)}</span>
    </div>
  );
}
