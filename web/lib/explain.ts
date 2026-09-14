/**
 * Explicação em texto de cada alerta — montada por template a partir de
 * números que já calculamos (ver engine/src/engine/math.ts). Não é IA,
 * não chama o Claude, não custa nada — é a mesma matemática, só em
 * português explicado em vez de número solto.
 */
import type { MatchAlert } from "./types";

export function explainAlert(alert: MatchAlert): string {
  const evPct = (alert.ev * 100).toFixed(1).replace(".", ",");
  const stakePct = (alert.suggestedStake * 100).toFixed(1).replace(".", ",");

  return (
    `A bet365 está pagando ${alert.bet365Odd.toFixed(2)}, mas o consenso do mercado ` +
    `diz que o valor justo é ${alert.fairOdd.toFixed(2)} — uma vantagem de ${evPct}%. ` +
    `Tamanho sugerido: ${stakePct}% da banca (Kelly ¼, nunca mais que isso).`
  );
}
