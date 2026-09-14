export function formatOdd(odd: number): string {
  return odd.toFixed(2);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1).replace(".", ",")}%`;
}
