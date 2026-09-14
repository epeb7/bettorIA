"use client";

import { useEffect } from "react";
import styles from "./Glossary.module.css";
import { useAnimatedOpen } from "@/lib/useAnimatedOpen";

const TRANSITION_MS = 220;

const TERMS = [
  {
    name: "Valor esperado (EV)",
    body: "Quanto a aposta rende, em média, se você repetir ela muitas vezes. EV de +7,8% significa que, pra cada R$100 apostados desse jeito, o retorno médio esperado é R$107,80 — não que essa aposta específica vai ganhar.",
  },
  {
    name: "Odd \"justa\"",
    body: "A odd que o consenso de várias casas de aposta (não só a bet365) diz que é o preço real do mercado, sem a margem da casa. Quando a bet365 paga mais que isso, existe valor.",
  },
  {
    name: "Kelly ¼",
    body: "O tamanho de aposta recomendado. Usamos só 1/4 do que a fórmula de Kelly indicaria — Kelly cheio quebra quando a probabilidade é estimada (não é 100% certa), então 1/4 protege sua banca de oscilação forte.",
  },
  {
    name: "CLV (Closing Line Value)",
    body: "Compara a odd que você pegou com a odd no fechamento do mercado (quando toda informação já foi precificada). É como medimos se o motor está funcionando de verdade — de forma muito mais rápida que esperar o resultado de cada aposta.",
  },
];

export function Glossary() {
  const { open, setOpen, mounted, visible } = useAnimatedOpen(TRANSITION_MS);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="O que esses termos significam"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {mounted && (
        <div
          className={`${styles.backdrop} ${visible ? styles.backdropOpen : ""}`}
          onClick={() => setOpen(false)}
        >
          <div
            className={`${styles.sheet} ${visible ? styles.sheetOpen : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Glossário de termos"
          >
            <div className={styles.header}>
              <span className={styles.title}>Como ler os números</span>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.body}>
              {TERMS.map((term) => (
                <div key={term.name} className={styles.term}>
                  <span className={styles.termName}>{term.name}</span>
                  <span className={styles.termBody}>{term.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
