"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { saveSession } from "@/lib/session";
import { useFadeOnChange } from "@/lib/useFadeOnChange";

type Status = "loading" | "success" | "already_used" | "error";

export default function AtivarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [clientName, setClientName] = useState<string>("");
  const shown = useFadeOnChange(status);

  useEffect(() => {
    let cancelled = false;

    async function activate() {
      try {
        const res = await fetch(`/api/ativar/${token}`, { method: "POST" });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok) {
          saveSession(data.deviceSecret, data.clientName);
          setClientName(data.clientName);
          setStatus("success");
        } else if (data.error === "already_used") {
          setStatus("already_used");
        } else {
          setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    activate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.wordmark}>bettorIA</span>

        <div className={`${styles.status} ${shown ? styles.statusShown : ""}`}>
        {status === "loading" && (
          <>
            <div className={`${styles.iconCircle} ${styles.loading}`}>
              <div className={styles.spinner} />
            </div>
            <span className={styles.title}>Ativando...</span>
            <p className={styles.body}>Confirmando seu acesso, um instante.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className={`${styles.iconCircle} ${styles.success}`}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="oklch(0.58 0.14 150)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className={styles.title}>Prontinho, {clientName}!</span>
            <p className={styles.body}>
              Este dispositivo está ativado. Pode voltar pro WhatsApp — os alertas chegam por lá,
              e você pode acompanhar tudo aqui quando quiser.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                marginTop: 4,
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: 100,
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Ver meus alertas
            </button>
          </>
        )}

        {status === "already_used" && (
          <>
            <div className={`${styles.iconCircle} ${styles.error}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.16 25)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className={styles.title}>Este link já foi usado</span>
            <p className={styles.body}>
              Este link de ativação já foi aberto em outro dispositivo. Se não foi você, fale com
              quem te vendeu o acesso.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className={`${styles.iconCircle} ${styles.error}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.16 25)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className={styles.title}>Link inválido</span>
            <p className={styles.body}>
              Não encontramos esse link de ativação. Confira se copiou o endereço completo.
            </p>
          </>
        )}
        </div>
      </div>
    </main>
  );
}
