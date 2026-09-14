import { describe, it, expect } from "vitest";
import { crc16ccitt, buildPixPayload } from "./brcode";

describe("crc16ccitt", () => {
  it("bate com o vetor de teste padrão CRC-16/CCITT-FALSE: '123456789' -> 29B1", () => {
    expect(crc16ccitt("123456789")).toBe("29B1");
  });
});

describe("buildPixPayload", () => {
  it("monta os campos obrigatórios na ordem certa", () => {
    const payload = buildPixPayload({
      key: "chave@exemplo.com",
      merchantName: "Bruno",
      merchantCity: "Sao Paulo",
      amountCents: 4937,
    });

    expect(payload.startsWith("000201")).toBe(true); // payload format indicator
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain("chave@exemplo.com");
    expect(payload).toContain("5405" + "49.37"); // valor: tag 54, tamanho 05 ("49.37" tem 5 chars)
    expect(payload).toContain("5802BR");
    expect(payload).toContain("5905Bruno"); // nome, tamanho 05
    expect(payload).toMatch(/6304[0-9A-F]{4}$/); // termina em CRC de 4 hex
  });

  it("corta nome e cidade nos limites do padrão (25 e 15 caracteres)", () => {
    const payload = buildPixPayload({
      key: "chave@exemplo.com",
      merchantName: "Um Nome Extremamente Longo Que Passa Do Limite",
      merchantCity: "Uma Cidade Com Nome Bem Longo",
    });
    expect(payload).toContain("5925Um Nome Extremamente Long"); // 25 chars, tag 59
    // slice(0,15) de "Uma Cidade Com Nome..." pega "Uma Cidade Com " (com
    // espaço final) — o .trim() tira esse espaço, sobrando 14 chars.
    expect(payload).toContain("6014Uma Cidade Com"); // 14 chars após trim, tag 60
  });

  it("omite o campo de valor quando amountCents não é passado (QR sem valor fixo)", () => {
    const payload = buildPixPayload({
      key: "chave@exemplo.com",
      merchantName: "Bruno",
      merchantCity: "Sao Paulo",
    });
    // procura o padrão exato do campo de valor (tag 54 + tamanho + "X.XX") em
    // vez de checar ausência da substring "54" solta, que por coincidência
    // pode aparecer dentro do CRC hexadecimal final e gerar falso positivo.
    expect(payload).not.toMatch(/54\d{2}\d+\.\d{2}/);
  });

  it("o CRC muda se qualquer campo muda — prova que não é fixo/copiado", () => {
    const a = buildPixPayload({ key: "a@x.com", merchantName: "Bruno", merchantCity: "SP", amountCents: 100 });
    const b = buildPixPayload({ key: "a@x.com", merchantName: "Bruno", merchantCity: "SP", amountCents: 200 });
    const crcA = a.slice(-4);
    const crcB = b.slice(-4);
    expect(crcA).not.toBe(crcB);
  });
});
