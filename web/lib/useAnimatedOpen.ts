"use client";

import { useEffect, useState } from "react";

/**
 * Mantém um modal/sheet montado um instante a mais depois de "fechar", só
 * pra a transição CSS de saída ter tempo de rodar — sem isso o React
 * desmonta na hora do clique e a animação nunca aparece na tela.
 *
 * Use `visible` (não `open`) pra alternar as classes CSS de transição — ele
 * só liga um quadro depois de montar, de propósito: se a classe "aberto"
 * fosse aplicada no mesmo instante que o elemento nasce no DOM, o
 * navegador nunca registraria o estado inicial fechado, e a transição de
 * entrada simplesmente não rodaria (o elemento já nasceria no estado final).
 *
 * `durationMs` tem que bater com o `transition` do CSS.
 *
 * Uso: const { open, setOpen, mounted, visible } = useAnimatedOpen();
 *      {mounted && <div className={visible ? styles.open : styles.base}>...}
 */
export function useAnimatedOpen(durationMs = 220) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      const timer = setTimeout(() => setMounted(false), durationMs);
      return () => clearTimeout(timer);
    }
  }, [open, mounted, durationMs]);

  useEffect(() => {
    if (!mounted) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(raf);
  }, [mounted, open]);

  return { open, setOpen, mounted, visible };
}
