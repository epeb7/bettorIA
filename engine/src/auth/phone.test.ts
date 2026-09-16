import { describe, it, expect } from "vitest";
import { normalizeBrazilianMobile } from "./phone";

describe("normalizeBrazilianMobile", () => {
  it("aceita número já formatado com máscara comum", () => {
    expect(normalizeBrazilianMobile("(11) 98765-4321")).toBe("+5511987654321");
  });

  it("aceita só dígitos, sem DDI", () => {
    expect(normalizeBrazilianMobile("11987654321")).toBe("+5511987654321");
  });

  it("aceita com +55 na frente", () => {
    expect(normalizeBrazilianMobile("+5511987654321")).toBe("+5511987654321");
  });

  it("aceita 55 sem o + na frente", () => {
    expect(normalizeBrazilianMobile("5511987654321")).toBe("+5511987654321");
  });

  it("aceita DDD de outra região (BA, dois dígitos, não é SP)", () => {
    expect(normalizeBrazilianMobile("71 98765-4321")).toBe("+5571987654321");
  });

  it("rejeita DDD que não existe (23 nunca foi atribuído pela Anatel)", () => {
    expect(normalizeBrazilianMobile("23987654321")).toBeNull();
  });

  it("rejeita fixo (8 dígitos depois do DDD, sem o 9º dígito)", () => {
    expect(normalizeBrazilianMobile("1132654321")).toBeNull();
  });

  it("rejeita número curto demais", () => {
    expect(normalizeBrazilianMobile("119876543")).toBeNull();
  });

  it("rejeita número longo demais", () => {
    expect(normalizeBrazilianMobile("119987654321999")).toBeNull();
  });

  it("rejeita texto sem dígito nenhum", () => {
    expect(normalizeBrazilianMobile("não é telefone")).toBeNull();
  });

  it("não confunde DDD 55 (RS) com o código de país 55", () => {
    // 55 + 987654321 (9 dígitos) = 11 dígitos totais, do jeito que um
    // número de RS de verdade tem — não deve cortar o "55" achando que
    // é DDI, porque sem cortar já bate com DDD+celular válido
    expect(normalizeBrazilianMobile("55987654321")).toBe("+5555987654321");
  });
});
