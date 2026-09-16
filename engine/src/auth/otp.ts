/**
 * Código de verificação de 6 dígitos via WhatsApp — a peça que confirma
 * "esse número é de verdade controlado por essa pessoa", sem a gente
 * nunca precisar saber nome/identidade de ninguém a partir do número
 * (ver phone.ts pro porquê disso importar — LGPD, não tem lookup de
 * terceiro aqui). Mesmo papel do OTP de qualquer app bancário.
 *
 * Fluxo pretendido: normalizeBrazilianMobile(phone) → generateOtp(phone)
 * → você manda o `code` pelo WhatsApp (mesma mecânica manual do
 * generate-link.ts, sem precisar da WhatsApp Business Platform ainda)
 * → cliente digita de volta → verifyOtp(challenge, digitado).
 */
import { randomInt, createHash, timingSafeEqual } from "node:crypto";

export interface OtpChallenge {
  phone: string; // já normalizado, +55DDXXXXXXXXX
  /** sha256(phone:code) — nunca guarda o código em claro, nem em memória depois de gerado */
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
  /** tentativas erradas — MAX_ATTEMPTS bloqueia força bruta no código de 6 dígitos */
  attempts: number;
}

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutos — igual ao padrão de app bancário
const MAX_ATTEMPTS = 5;

function hashCode(code: string, phone: string): string {
  // amarra o hash ao telefone: dois códigos de 6 dígitos iguais gerados
  // pra números diferentes não têm o mesmo hash
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export function generateOtp(phone: string): { challenge: OtpChallenge; code: string } {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = new Date();

  return {
    code,
    challenge: {
      phone,
      codeHash: hashCode(code, phone),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
      consumedAt: null,
      attempts: 0,
    },
  };
}

export type OtpVerifyResult =
  | { ok: true; challenge: OtpChallenge }
  | {
      ok: false;
      reason: "expired" | "already_used" | "too_many_attempts" | "wrong_code";
      /** challenge atualizado (attempts incrementado em wrong_code) — quem chama grava isso, mesmo padrão de consumeToken em token.ts */
      challenge: OtpChallenge;
    };

export function verifyOtp(challenge: OtpChallenge, inputCode: string): OtpVerifyResult {
  if (challenge.consumedAt !== null) {
    return { ok: false, reason: "already_used", challenge };
  }
  if (new Date(challenge.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "expired", challenge };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts", challenge };
  }

  // comparação em tempo constante — um código de 6 dígitos já é fraco
  // contra força bruta (por isso o limite de tentativas acima); não
  // precisa também vazar timing de "quantos dígitos bateram"
  const inputHash = Buffer.from(hashCode(inputCode, challenge.phone), "hex");
  const storedHash = Buffer.from(challenge.codeHash, "hex");
  const matches = timingSafeEqual(inputHash, storedHash);

  if (!matches) {
    return {
      ok: false,
      reason: "wrong_code",
      challenge: { ...challenge, attempts: challenge.attempts + 1 },
    };
  }

  return { ok: true, challenge: { ...challenge, consumedAt: new Date().toISOString() } };
}
