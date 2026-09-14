import { describe, it, expect } from "vitest";
import { formatKickoffLabel, minutesUntilKickoff, formatCountdown } from "./time";

describe("formatKickoffLabel", () => {
  const now = new Date(2026, 8, 14, 12, 0); // 14/set/2026, meio-dia (mês 0-indexado)

  it("mesmo dia -> 'hoje HH:MM'", () => {
    const kickoff = new Date(2026, 8, 14, 21, 0).toISOString();
    expect(formatKickoffLabel(kickoff, now)).toBe("hoje 21:00");
  });

  it("dia seguinte -> 'amanhã HH:MM'", () => {
    const kickoff = new Date(2026, 8, 15, 18, 30).toISOString();
    expect(formatKickoffLabel(kickoff, now)).toBe("amanhã 18:30");
  });

  it("dentro da semana -> dia abreviado", () => {
    const kickoff = new Date(2026, 8, 17, 21, 0).toISOString(); // 3 dias depois
    const label = formatKickoffLabel(kickoff, now);
    expect(label).toMatch(/^(dom|seg|ter|qua|qui|sex|sáb) 21:00$/);
  });

  it("mais de uma semana -> data completa", () => {
    const kickoff = new Date(2026, 9, 1, 21, 0).toISOString(); // mês seguinte
    expect(formatKickoffLabel(kickoff, now)).toBe("01/10 21:00");
  });
});

describe("minutesUntilKickoff", () => {
  it("calcula minutos corretamente", () => {
    const now = new Date(2026, 8, 14, 20, 0);
    const kickoff = new Date(2026, 8, 14, 21, 30).toISOString();
    expect(minutesUntilKickoff(kickoff, now)).toBe(90);
  });

  it("jogo no passado dá número negativo", () => {
    const now = new Date(2026, 8, 14, 22, 0);
    const kickoff = new Date(2026, 8, 14, 21, 0).toISOString();
    expect(minutesUntilKickoff(kickoff, now)).toBeLessThan(0);
  });
});

describe("formatCountdown", () => {
  it("menos de 60 min -> 'começa em N min'", () => {
    expect(formatCountdown(45)).toBe("começa em 45 min");
  });

  it("horas exatas -> sem minutos sobrando", () => {
    expect(formatCountdown(120)).toBe("começa em 2h");
  });

  it("horas com resto -> mostra os dois", () => {
    expect(formatCountdown(134)).toBe("começa em 2h 14min");
  });

  it("mais de 24h -> em dias", () => {
    expect(formatCountdown(60 * 30)).toBe("começa em 1 dia");
    expect(formatCountdown(60 * 50)).toBe("começa em 2 dias");
  });

  it("zero ou negativo -> ao vivo", () => {
    expect(formatCountdown(0)).toBe("ao vivo agora");
    expect(formatCountdown(-5)).toBe("ao vivo agora");
  });
});
