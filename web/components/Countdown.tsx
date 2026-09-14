"use client";

import { useEffect, useState } from "react";
import { formatCountdown, minutesUntilKickoff } from "@/lib/time";

/**
 * Só este pedaço da tela é "client" — o resto do card continua renderizado
 * no servidor. Atualiza a cada 30s (não precisa de precisão de segundo
 * pra "começa em 2h 14min", e poupa bateria/render).
 */
export function Countdown({ kickoffAt }: { kickoffAt: string }) {
  const [minutes, setMinutes] = useState(() => minutesUntilKickoff(kickoffAt));

  useEffect(() => {
    const id = setInterval(() => setMinutes(minutesUntilKickoff(kickoffAt)), 30_000);
    return () => clearInterval(id);
  }, [kickoffAt]);

  return <span>{formatCountdown(minutes)}</span>;
}
