import { describe, it, expect } from "vitest";
import { generateOtp, verifyOtp, type OtpChallenge } from "./otp";

const PHONE = "+5511987654321";

describe("generateOtp", () => {
  it("gera código de exatamente 6 dígitos numéricos", () => {
    const { code } = generateOtp(PHONE);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("nunca guarda o código em claro — challenge só tem o hash", () => {
    const { challenge, code } = generateOtp(PHONE);
    expect(JSON.stringify(challenge)).not.toContain(code);
  });

  it("começa sem ter sido consumido e com zero tentativas", () => {
    const { challenge } = generateOtp(PHONE);
    expect(challenge.consumedAt).toBeNull();
    expect(challenge.attempts).toBe(0);
  });
});

describe("verifyOtp — código certo", () => {
  it("aceita o código certo e marca consumedAt", () => {
    const { challenge, code } = generateOtp(PHONE);
    const result = verifyOtp(challenge, code);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.challenge.consumedAt).not.toBeNull();
  });
});

describe("verifyOtp — código errado", () => {
  it("rejeita e incrementa attempts", () => {
    const { challenge, code } = generateOtp(PHONE);
    const wrongCode = code === "000000" ? "111111" : "000000"; // garante que é diferente do certo
    const result = verifyOtp(challenge, wrongCode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("wrong_code");
      expect(result.challenge.attempts).toBe(1);
    }
  });

  it("bloqueia depois de 5 tentativas erradas, mesmo com o código certo na 6ª", () => {
    const { challenge, code } = generateOtp(PHONE);
    const wrongCode = code === "000000" ? "111111" : "000000";

    let current: OtpChallenge = challenge;
    for (let i = 0; i < 5; i++) {
      const result = verifyOtp(current, wrongCode);
      expect(result.ok).toBe(false);
      if (!result.ok) current = result.challenge;
    }

    const finalTry = verifyOtp(current, code); // código certo, mas já esgotou tentativas
    expect(finalTry.ok).toBe(false);
    if (!finalTry.ok) expect(finalTry.reason).toBe("too_many_attempts");
  });
});

describe("verifyOtp — expiração e reuso", () => {
  it("rejeita código expirado mesmo estando certo", () => {
    const { challenge, code } = generateOtp(PHONE);
    const expired: OtpChallenge = { ...challenge, expiresAt: new Date(Date.now() - 1000).toISOString() };
    const result = verifyOtp(expired, code);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });

  it("rejeita reuso de código já consumido — mesma regra do token de ativação", () => {
    const { challenge, code } = generateOtp(PHONE);
    const first = verifyOtp(challenge, code);
    expect(first.ok).toBe(true);

    const consumedChallenge = (first as { ok: true; challenge: OtpChallenge }).challenge;
    const second = verifyOtp(consumedChallenge, code);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("already_used");
  });
});
