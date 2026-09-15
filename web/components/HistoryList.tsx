"use client";

import { useMemo, useState } from "react";
import styles from "./HistoryList.module.css";
import { HistoryCard } from "./HistoryCard";
import { useFadeOnChange } from "@/lib/useFadeOnChange";
import type { HistoricalAlert } from "@/lib/types";
import type { LeagueOption } from "@/lib/leagues";

const ALL = "all";

/**
 * Nota por liga pra quando o filtro não tem (ou tem pouco) resultado —
 * o ponto real é que nem todo campeonato tem a mesma maturidade de dado
 * no mesmo momento do ano (setembro = maioria da Europa recém-começou;
 * o Brasileirão está no meio da temporada). Em vez de mostrar uma tela
 * vazia genérica, explica por quê.
 */
const EARLY_SEASON_NOTE: Record<string, string> = {
  "champions-league": "A fase de liga começa em setembro — ainda não temos alertas fechados aqui.",
  "premier-league": "A temporada está no início — poucos jogos ainda pra gerar histórico.",
  "la-liga": "A temporada está no início — o histórico cresce jogo a jogo.",
};

interface RoundGroup {
  key: string;
  league: string;
  round: number;
  alerts: HistoricalAlert[];
  latestSettledAt: string;
}

/**
 * O torcedor não pensa em "meus últimos 6 alertas", pensa em "rodada 24
 * do Brasileirão" — é assim que o calendário do futebol organiza a cabeça
 * de quem acompanha. Cada rodada numera dentro da própria liga (ver
 * HistoricalAlert.round), então a chave de agrupamento é sempre liga+rodada,
 * nunca só um dos dois — senão "rodada 5" da La Liga se misturaria com
 * "rodada 5" do Brasileirão, que não têm nenhuma relação entre si.
 *
 * Os grupos saem ordenados pelo alerta mais recente de cada um — não por
 * número de rodada — porque com "Todos" selecionado isso intercala as
 * ligas na ordem em que os jogos realmente aconteceram, em vez de
 * empilhar uma liga inteira antes da outra começar.
 */
function groupByRound(alerts: HistoricalAlert[]): RoundGroup[] {
  const groups = new Map<string, RoundGroup>();

  for (const alert of alerts) {
    const key = `${alert.league}__${alert.round}`;
    const existing = groups.get(key);
    if (existing) {
      existing.alerts.push(alert);
      if (alert.settledAt > existing.latestSettledAt) {
        existing.latestSettledAt = alert.settledAt;
      }
    } else {
      groups.set(key, {
        key,
        league: alert.league,
        round: alert.round,
        alerts: [alert],
        latestSettledAt: alert.settledAt,
      });
    }
  }

  return [...groups.values()].sort((a, b) =>
    a.latestSettledAt < b.latestSettledAt ? 1 : -1
  );
}

export function HistoryList({
  alerts,
  leagues,
}: {
  alerts: HistoricalAlert[];
  leagues: LeagueOption[];
}) {
  const [selected, setSelected] = useState<string>(ALL);
  const shown = useFadeOnChange(selected);

  const filtered = useMemo(() => {
    if (selected === ALL) return alerts;
    const league = leagues.find((l) => l.id === selected);
    if (!league) return alerts;
    return alerts.filter((a) => a.league === league.label);
  }, [alerts, leagues, selected]);

  // com um campeonato específico filtrado, a liga já está implícita no
  // chip ativo — repeti-la em cada cabeçalho de rodada seria ruído.
  const showLeagueInHeader = selected === ALL;
  const grouped = useMemo(() => groupByRound(filtered), [filtered]);

  return (
    <>
      <div className={styles.filters}>
        <button
          type="button"
          className={`${styles.chip} ${selected === ALL ? styles.chipActive : ""}`}
          onClick={() => setSelected(ALL)}
        >
          Todos
        </button>
        {leagues.map((league) => (
          <button
            key={league.id}
            type="button"
            className={`${styles.chip} ${selected === league.id ? styles.chipActive : ""}`}
            onClick={() => setSelected(league.id)}
          >
            {league.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>Sem histórico ainda</span>
          <p className={styles.emptyBody}>
            {EARLY_SEASON_NOTE[selected] ??
              "Ainda não temos alertas fechados pra esse filtro."}
          </p>
        </div>
      ) : (
        <div className={`${styles.list} ${shown ? styles.listShown : ""}`}>
          {grouped.map((group) => (
            <section key={group.key} className={styles.roundGroup}>
              <div className={styles.roundHeader}>
                <span className={styles.roundLabel}>
                  {showLeagueInHeader ? `${group.league} · Rodada ${group.round}` : `Rodada ${group.round}`}
                </span>
                <span className={styles.roundRule} />
              </div>
              <div className={styles.roundCards}>
                {group.alerts.map((alert) => (
                  <HistoryCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
