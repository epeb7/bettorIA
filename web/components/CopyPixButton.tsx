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
        // padding maior que o texto precisa, de propósito: mantém a
        // fonte pequena mas garante ~44px de área de toque real
        padding: "13px 8px",
        margin: "-13px -8px",
      }}
    >
      {copied ? "Código copiado!" : "ou toque para copiar o código Pix"}
    </button>
  );
}
