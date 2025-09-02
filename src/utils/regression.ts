
// Solves a 3x3 system of linear equations: Ax = b
function solve3x3(A: number[][], b: number[]): number[] {
  const detA =
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

  if (Math.abs(detA) < 1e-9) {
    // Simplified fallback or singular matrix handling
    return [0, 0, b[2] / A[2][2]];
  }

  const invA: number[][] = [
    [
      (A[1][1] * A[2][2] - A[1][2] * A[2][1]) / detA,
      (A[0][2] * A[2][1] - A[0][1] * A[2][2]) / detA,
      (A[0][1] * A[1][2] - A[0][2] * A[1][1]) / detA,
    ],
    [
      (A[1][2] * A[2][0] - A[1][0] * A[2][2]) / detA,
      (A[0][0] * A[2][2] - A[0][2] * A[2][0]) / detA,
      (A[0][2] * A[1][0] - A[0][0] * A[1][2]) / detA,
    ],
    [
      (A[1][0] * A[2][1] - A[1][1] * A[2][0]) / detA,
      (A[0][1] * A[2][0] - A[0][0] * A[2][1]) / detA,
      (A[0][0] * A[1][1] - A[0][1] * A[1][0]) / detA,
    ],
  ];

  return [
    invA[0][0] * b[0] + invA[0][1] * b[1] + invA[0][2] * b[2],
    invA[1][0] * b[0] + invA[1][1] * b[1] + invA[1][2] * b[2],
    invA[2][0] * b[0] + invA[2][1] * b[1] + invA[2][2] * b[2],
  ];
}

export function polynomialFit(
  points: { x: number; y: number }[]
): { a: number; b: number; c: number } {
  if (points.length < 3) {
    // Not enough points for a quadratic fit, return a constant model
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length || 0;
    return { a: 0, b: 0, c: avgY };
  }

  let sum_x = 0,
    sum_y = 0,
    sum_x2 = 0,
    sum_x3 = 0,
    sum_x4 = 0,
    sum_xy = 0,
    sum_x2y = 0;

  for (const p of points) {
    const x = p.x;
    const y = p.y;
    const x2 = x * x;

    sum_x += x;
    sum_y += y;
    sum_x2 += x2;
    sum_x3 += x2 * x;
    sum_x4 += x2 * x2;
    sum_xy += x * y;
    sum_x2y += x2 * y;
  }

  const n = points.length;

  const A = [
    [sum_x4, sum_x3, sum_x2],
    [sum_x3, sum_x2, sum_x],
    [sum_x2, sum_x, n],
  ];

  const b = [sum_x2y, sum_xy, sum_y];

  const [a, b_coeff, c] = solve3x3(A, b);

  return { a, b: b_coeff, c };
}
