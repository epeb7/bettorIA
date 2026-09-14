import { describe, it, expect } from "vitest";
import { generateActivationToken, activationLink, consumeToken } from "./token";

describe("generateActivationToken", () => {
  it("gera tokens diferentes a cada chamada", () => {
    const a = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    const b = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    expect(a.token).not.toBe(b.token);
  });

  it("token só tem caracteres seguros pra URL", () => {
    const t = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    expect(t.token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("começa sem ter sido consumido", () => {
    const t = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    expect(t.consumedAt).toBeNull();
  });
});

describe("activationLink", () => {
  it("monta a URL certa, tirando barra duplicada", () => {
    const t = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    expect(activationLink("https://app.bettoria.com.br/", t)).toBe(
      `https://app.bettoria.com.br/ativar/${t.token}`
    );
  });
});

describe("consumeToken — a regra de uso único", () => {
  it("primeiro consumo funciona e marca consumedAt", () => {
    const t = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    const consumed = consumeToken(t);
    expect(consumed).not.toBeNull();
    expect(consumed!.consumedAt).not.toBeNull();
  });

  it("segundo consumo do mesmo token falha (devolve null) — é a regra que protege contra encaminhar o link", () => {
    const t = generateActivationToken({ clientPhone: "+5511999999999", clientName: "A", amountPaidCents: 100 });
    const firstDevice = consumeToken(t)!;
    const secondDevice = consumeToken(firstDevice);
    expect(secondDevice).toBeNull();
  });
});
