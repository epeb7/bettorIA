import { describe, it, expect } from "vitest";
import {
  overround,
  fairProbabilitiesProportional,
  fairProbabilitiesShin,
  expectedValue,
  kellyStake,
  closingLineValue,
  evaluateMarket,
} from "./math";

describe("overround", () => {
  it("bate com o exemplo do CLAUDE.md: 1.95/1.90 -> ~3,91%", () => {
    const or = overround([
      { label: "over", odd: 1.95 },
      { label: "under", odd: 1.9 },
    ]);
    expect(or).toBeCloseTo(0.0391, 3);
  });
});

describe("fairProbabilitiesProportional", () => {
  it("bate com o exemplo do CLAUDE.md: consenso 1.83/2.03 -> over 52,59%", () => {
    const { probabilities } = fairProbabilitiesProportional([
      { label: "over", odd: 1.83 },
      { label: "under", odd: 2.03 },
    ]);
    expect(probabilities.over).toBeCloseTo(0.5259, 3);
  });
});

describe("expectedValue + kellyStake", () => {
  it("bate com o exemplo do CLAUDE.md: p=0,5259, bet365 paga 2.00 -> EV +5,18%", () => {
    const p = 0.5259;
    const ev = expectedValue(p, 2.0);
    expect(ev).toBeCloseTo(0.0518, 2);

    const stakeQuarter = kellyStake(p, 2.0, 0.25);
    // Kelly cheio bate ~5,18%; 1/4 disso é ~1,30%
    expect(stakeQuarter).toBeCloseTo(0.013, 2);
  });
});

describe("fairProbabilitiesShin", () => {
  // Odds reais de mercado (1X2 típico da bet365, com overround genuíno) —
  // as odds "justas" 1.93/3.83/4.55 usadas em outro exemplo já são de-vigadas
  // (somam ~1 de probabilidade), então alimentá-las de volta no Shin é um
  // caso degenerado (divide por ~zero). Aqui usamos odds crua com margem real.
  const sides = [
    { label: "home", odd: 1.85 },
    { label: "draw", odd: 3.6 },
    { label: "away", odd: 4.2 },
  ];

  it("em 1X2, soma das probabilidades justas fecha em 1", () => {
    const { probabilities } = fairProbabilitiesShin(sides);
    const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it("Shin reduz a probabilidade do azarão vs. normalização proporcional ingênua", () => {
    const shin = fairProbabilitiesShin(sides);
    const proportional = fairProbabilitiesProportional(sides);
    // away é o azarão (odd mais alta) — Shin deve dar probabilidade menor a ele
    expect(shin.probabilities.away).toBeLessThan(proportional.probabilities.away);
  });
});

describe("closingLineValue", () => {
  it("odd pega 2.00 vs justo no fechamento 1.90 -> CLV +5,26%", () => {
    expect(closingLineValue(2.0, 1.9)).toBeCloseTo(0.0526, 3);
  });
});

describe("evaluateMarket", () => {
  it("integra fairProbabilities + EV + Kelly num único resultado", () => {
    const result = evaluateMarket(
      [
        { label: "over", odd: 1.83 },
        { label: "under", odd: 2.03 },
      ],
      "over",
      2.0
    );
    expect(result.ev).toBeGreaterThan(0);
    expect(result.kellyStake).toBeGreaterThan(0);
    expect(result.method).toBe("proportional");
  });
});
