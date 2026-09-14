"use client";

import { useEffect, useState } from "react";

/**
 * Mesma sensação de "assentar" do useAnimatedOpen, mas pra conteúdo que
 * troca de estado numa sequência linear (não abre/fecha) — como a página
 * de ativação indo de "carregando" pra "sucesso". Toda vez que `key` muda,
 * refaz o fade de entrada.
 *
 * Uso: const shown = useFadeOnChange(status);
 *      <div className={shown ? styles.contentShown : styles.content}>
 */
export function useFadeOnChange(key: unknown) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [key]);

  return shown;
}
