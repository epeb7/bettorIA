import styles from "./AlertSlide.module.css";
import { formatOdd, formatPercent } from "@/lib/format";
import { formatKickoffLabel } from "@/lib/time";
import { explainAlert } from "@/lib/explain";
import { Countdown } from "./Countdown";
import type { MatchAlert } from "@/lib/types";

/**
 * Uma tela cheia por alerta — o "hero" é o EV, não a lista de números.
 * Pensado pra scroll em sequência (ver AlertFeed): cada rolagem revela
 * um jogo novo, sempre com o mesmo ritmo visual.
 *
 * Layout em grid de 2 linhas (ver .module.css): conteúdo (1fr, centralizado
 * dentro da própria linha) + dica de rolagem (auto, embaixo). NUNCA
 * position:absolute pra dica — isso é o que causava ela sobrepor o texto
 * em janelas largas-e-baixas (desktop), onde não sobra espaço vertical
 * pro conteúdo "centralizado" sem invadir a área fixa da dica.
 */
export function AlertSlide({
  alert,
  showScrollHint,
}: {
  alert: MatchAlert;
  showScrollHint?: boolean;
}) {
  return (
    <section className={styles.slide}>
      <div className={styles.content}>
        <div className={styles.matchInfo}>
          <span className={styles.league}>{alert.league}</span>
          <span className={styles.teams}>
            {alert.homeTeam} × {alert.awayTeam}
          </span>
          <span className={styles.market}>
            {alert.market} · {formatKickoffLabel(alert.kickoffAt)}
          </span>
          <span className={styles.countdown}>
            <Countdown kickoffAt={alert.kickoffAt} />
          </span>
        </div>

        <div className={styles.hero}>
          <span className={styles.heroLabel}>valor esperado</span>
          <span className={`${styles.heroValue} mono`}>{formatPercent(alert.ev)}</span>
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
            <span className={styles.statLabel}>aposte</span>
            <span className={`${styles.statValue} mono`}>{formatPercent(alert.suggestedStake)}</span>
          </div>
        </div>

        <p className={styles.explain}>{explainAlert(alert)}</p>
      </div>

      {showScrollHint && (
        <div className={styles.hint}>
          <span>mais jogos</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}
    </section>
  );
}
