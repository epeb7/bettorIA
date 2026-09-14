import styles from "./AlertFeed.module.css";
import { AlertSlide } from "./AlertSlide";
import type { MatchAlert } from "@/lib/types";

/**
 * Feed de tela cheia com scroll-snap — a "tecnologia da rolagem" pedida:
 * cada jogo ocupa a tela toda, o scroll trava nele (scroll-snap-stop:
 * always em AlertSlide), não dá pra passar reto por cima igual lista
 * comum. É CSS nativo do navegador, sem biblioteca, já que desempenho
 * mobile é prioridade (ver CLAUDE.md).
 */
export function AlertFeed({ alerts }: { alerts: MatchAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className={styles.feed}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className={styles.emptyTitle}>Nenhum alerta agora</span>
          <p className={styles.emptyBody}>
            O motor varre o mercado a cada 15 minutos. Quando a bet365 sair da linha do
            consenso, aparece aqui na hora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      {alerts.map((alert, i) => (
        <AlertSlide key={alert.id} alert={alert} showScrollHint={i === 0 && alerts.length > 1} />
      ))}
    </div>
  );
}
