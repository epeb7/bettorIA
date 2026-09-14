"use client";

import { useState } from "react";
import styles from "./CopyPixButton.module.css";
import { useFadeOnChange } from "@/lib/useFadeOnChange";

export function CopyPixButton({ payload }: { payload: string }) {
  const [copied, setCopied] = useState(false);
  const shown = useFadeOnChange(copied);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard pode ser bloqueado (contexto sem HTTPS, permissão negada)
      // — sem drama, o QR ainda funciona por escaneamento normal.
    }
  }

  return (
    <button type="button" className={styles.button} onClick={handleCopy}>
      <span className={`${styles.text} ${shown ? styles.textShown : ""}`}>
        {copied ? "Código copiado!" : "ou toque para copiar o código Pix"}
      </span>
    </button>
  );
}
