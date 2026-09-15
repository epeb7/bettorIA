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
          {filtered.map((alert) => (
            <HistoryCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </>
  );
}
