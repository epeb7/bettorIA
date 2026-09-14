/**
 * Motor de valor — bettorIA
 *
 * Implementa a matemática estabelecida no CLAUDE.md (seção "Matemática do motor"):
 * overround, probabilidade justa (normalização proporcional + Shin para 1X2),
 * EV, Kelly ¼, CLV e tamanho de amostra necessário pra validar o motor.
 *
 * Tudo aqui é função pura, sem I/O — fácil de testar isoladamente.
 */

export interface OddsSide {
  /** nome do lado do mercado, ex: "home" | "draw" | "away" | "over" | "under" */
  label: string;
  odd: number;
}

export interface FairProbabilityResult {
  /** probabilidade justa por lado, mesma ordem de entrada */
  probabilities: Record<string, number>;
  /** overround do mercado de entrada, ex 0.0391 = 3,91% */
  overround: number;
  method: "proportional" | "shin";
}

/**
 * overround = Σ(1/odd_i) − 1
 */
export function overround(sides: OddsSide[]): number {
  const sum = sides.reduce((acc, s) => acc + 1 / s.odd, 0);
  return sum - 1;
}

/**
 * Normalização proporcional — serve bem para mercados de 2 lados
 * (over/under, ambas marcam, corners/cards). p_justa(i) = (1/odd_i) / Σ(1/odd_j)
 */
export function fairProbabilitiesProportional(sides: OddsSide[]): FairProbabilityResult {
  const raw = sides.map((s) => ({ label: s.label, p: 1 / s.odd }));
  const sum = raw.reduce((acc, r) => acc + r.p, 0);
  const probabilities: Record<string, number> = {};
  for (const r of raw) probabilities[r.label] = r.p / sum;
  return { probabilities, overround: sum - 1, method: "proportional" };
}

/**
 * Método de Shin — corrige a superestimação do azarão que a normalização
 * proporcional comete em mercados de 3+ lados (1X2). Resolve o parâmetro z
 * por bisseção: p_justa(i) = [ sqrt(z^2 + 4(1-z)*(pi_i^2/S)) − z ] / (2*(1-z))
 * onde pi_i = 1/odd_i, S = Σ pi_i.
 *
 * Referência: Shin (1993), "Measuring the incidence of insider trading in a
 * market for state-contingent claims".
 */
export function fairProbabilitiesShin(sides: OddsSide[]): FairProbabilityResult {
  const pi = sides.map((s) => 1 / s.odd);
  const S = pi.reduce((a, b) => a + b, 0);

  const probsForZ = (z: number): number[] =>
    pi.map((p) => (Math.sqrt(z * z + 4 * (1 - z) * ((p * p) / S)) - z) / (2 * (1 - z)));

  // bisseção em z ∈ (0, 1): a soma das probabilidades deve fechar em 1
  let lo = 1e-6;
  let hi = 1 - 1e-6;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const sum = probsForZ(mid).reduce((a, b) => a + b, 0);
    if (sum > 1) lo = mid;
    else hi = mid;
  }
  const z = (lo + hi) / 2;
  const finalProbs = probsForZ(z);

  const probabilities: Record<string, number> = {};
  sides.forEach((s, i) => (probabilities[s.label] = finalProbs[i]));
  return { probabilities, overround: S - 1, method: "shin" };
}

/**
 * Escolhe o método certo por formato de mercado — regra do CLAUDE.md:
 * 1X2 (3 lados) usa Shin; mercados de 2 lados usam proporcional.
 */
export function fairProbabilities(sides: OddsSide[]): FairProbabilityResult {
  return sides.length >= 3
    ? fairProbabilitiesShin(sides)
    : fairProbabilitiesProportional(sides);
}

/**
 * EV = p_justa × (odd_b365 − 1) − (1 − p_justa)
 */
export function expectedValue(fairProbability: number, oddOffered: number): number {
  return fairProbability * (oddOffered - 1) - (1 - fairProbability);
}

/**
 * Critério de Kelly, fracionado. f* = EV / (odd − 1); usamos sempre 1/4
 * (ver "Descoberta: Kelly ¼ sempre" no CLAUDE.md — Kelly cheio quebra quando
 * a probabilidade é estimada, não conhecida).
 */
export function kellyStake(
  fairProbability: number,
  oddOffered: number,
  fraction: number = 0.25
): number {
  const b = oddOffered - 1;
  const fullKelly = (fairProbability * b - (1 - fairProbability)) / b;
  return Math.max(0, fullKelly * fraction);
}

/**
 * CLV = (odd_pega / odd_justa_fechamento) − 1
 */
export function closingLineValue(oddTaken: number, oddFairAtClose: number): number {
  return oddTaken / oddFairAtClose - 1;
}

/**
 * Tamanho de amostra necessário pra provar um ROI (ou CLV) com confiança,
 * n = (z·σ/alvo)². Usado no CLAUDE.md para mostrar que CLV converge ~111x
 * mais rápido que ROI de apostas.
 *
 * @param target ROI ou CLV médio esperado, ex 0.03 = 3%
 * @param stdDev desvio-padrão do lucro por unidade apostada
 * @param confidenceZ z-score da confiança desejada (1.96 ≈ 95%)
 */
export function sampleSizeNeeded(target: number, stdDev: number, confidenceZ = 1.96): number {
  return Math.pow((confidenceZ * stdDev) / target, 2);
}

/** Resultado consolidado de uma avaliação de mercado — o que o job de scan grava. */
export interface MarketEvaluation {
  fairProbability: number;
  overround: number;
  method: "proportional" | "shin";
  ev: number;
  kellyStake: number;
}

/**
 * Avalia um mercado: dado o consenso (várias casas, mesmo mercado) e a odd
 * que a bet365 está pagando no MESMO lado, devolve EV e stake sugerido.
 */
export function evaluateMarket(
  consensusSides: OddsSide[],
  sideLabel: string,
  bet365Odd: number
): MarketEvaluation {
  const fair = fairProbabilities(consensusSides);
  const p = fair.probabilities[sideLabel];
  if (p === undefined) {
    throw new Error(`lado "${sideLabel}" não encontrado no consenso`);
  }
  const ev = expectedValue(p, bet365Odd);
  return {
    fairProbability: p,
    overround: fair.overround,
    method: fair.method,
    ev,
    kellyStake: kellyStake(p, bet365Odd),
  };
}
