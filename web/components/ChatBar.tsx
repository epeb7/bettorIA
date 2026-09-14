"use client";

import { useState } from "react";
import styles from "./ChatBar.module.css";

// TODO: ligar no backend de chat (Claude Haiku 4.5, ver CLAUDE.md — "LLM da
// camada de chat"). Por ora o envio só limpa o campo; nenhuma pergunta é
// respondida ainda.
export function ChatBar({ suggestedQuestions }: { suggestedQuestions: string[] }) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim()) return;
    // TODO: POST pra rota de chat quando o backend existir.
    console.log("[chat] pergunta enviada (ainda sem backend):", value);
    setValue("");
  }

  return (
    <div className={styles.bar}>
      {suggestedQuestions.length > 0 && (
        <div className={styles.chips}>
          {suggestedQuestions.map((q) => (
            <button key={q} type="button" className={styles.chip} onClick={() => setValue(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Pergunte sobre um jogo..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          aria-label="Pergunte sobre um jogo"
        />
        <button
          type="button"
          className={styles.send}
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Enviar pergunta"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
