import styles from "./AlertFeed.module.css";
import { AlertSlide } from "./AlertSlide";
import type { MatchAlert } from "@/lib/types";

/**
 * Feed de tela cheia com scroll-snap — a "tecnologia da rolagem" pedida:
 * cada jogo ocupa a tela toda, o scroll trava nele (scroll-snap-stop:
 * always em AlertSlide), não dá pra passar reto por cima igual lista
 * comum. É CSS nativo do navegador, sem biblioteca — leve, de propósito,
 * já que desempenho mobile é prioridade (ver CLAUDE.md).
 */
export function AlertFeed({ alerts }: { alerts: MatchAlert[] }) {
  return (
    <div className={styles.feed}>
      {alerts.map((alert, i) => (
        <AlertSlide key={alert.id} alert={alert} showScrollHint={i === 0 && alerts.length > 1} />
      ))}
    </div>
  );
}
