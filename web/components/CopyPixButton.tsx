"use client";

import { useState } from "react";

export function CopyPixButton({ payload }: { payload: string }) {
  const [copied, setCopied] = useState(false);

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
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: "none",
        border: "none",
        color: "var(--accent)",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        padding: "6px 0",
      }}
    >
      {copied ? "Código copiado!" : "ou toque para copiar o código Pix"}
    </button>
  );
}
