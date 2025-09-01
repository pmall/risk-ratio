
export function logNormalPdf(
  x: number,
  mu: number,
  sigma: number
): number {
  if (x <= 0) {
    return 0;
  }
  const term1 = 1 / (x * sigma * Math.sqrt(2 * Math.PI));
  const term2 = Math.exp(-((Math.log(x) - mu) ** 2) / (2 * sigma ** 2));
  return term1 * term2;
}
