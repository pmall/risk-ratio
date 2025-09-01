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

export function norm_cdf(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.78141444; // Corrected constant
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c2 = 0.39894228; // 1/sqrt(2*PI)

  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - c2 * Math.exp(-absX * absX / 2) * (b1 * t + b2 * t * t + b3 * t * t * t + b4 * t * t * t * t + b5 * t * t * t * t * t);

  if (x < 0) {
    return 1 - y;
  } else {
    return y;
  }
}