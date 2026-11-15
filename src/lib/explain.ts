import { analyzeTrend, decimalYear, deseasonalize } from './stats';
import type { Point, TrendResult } from './stats';

/* ------------------------------------------------------------------ */
/* El Nino (ENSO) adjustment                                           */
/* ------------------------------------------------------------------ */

export interface EnsoResult {
  /** Months where both the region and the El Nino index have data */
  n: number;
  /** El Nino signal leads the region by this many months (chosen as the best fit, 0 to 6) */
  lagMonths: number;
  /** Region units change per 1 degC of El Nino index (positive: warm El Nino raises the region) */
  coefficient: number;
  /** Share of month-to-month variability explained by El Nino (0 to 1) */
  varianceShare: number;
  /** Trend over the overlap period, before removing El Nino */
  before: TrendResult;
  /** Trend over the same period after removing the El Nino signal */
  after: TrendResult;
  /** Adjusted anomaly series (for drawing) */
  adjusted: Point[];
  verdict: 'unchanged' | 'weakened' | 'strengthened' | 'lost' | 'gained';
}

/** Solve a small linear system A x = b by Gaussian elimination with pivoting. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) return new Array<number>(n).fill(0);
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** Multiple linear regression y = c + s*t + b*x. Returns [c, s, b] and R^2 of the x-part. */
function regress(t: number[], x: number[], y: number[]) {
  const n = y.length;
  const cols = [new Array<number>(n).fill(1), t, x];
  const A = cols.map((a) => cols.map((b) => a.reduce((s, v, i) => s + v * b[i], 0)));
  const rhs = cols.map((a) => a.reduce((s, v, i) => s + v * y[i], 0));
  return solve(A, rhs);
}

function addMonths(date: string, k: number): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7)) - 1 + k;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  return `${yy}-${String(mm + 1).padStart(2, '0')}-01`;
}

/**
 * Remove the El Nino / La Nina signal from a region's anomaly series and re-test the trend.
 *
 * The El Nino index is the sea-surface-temperature anomaly of the Nino 3.4 box with its own
 * warming trend removed, so it measures only the year-to-year swings. The region's anomalies
 * are regressed on time and on that index (tried at lags of 0 to 6 months, keeping the lag with
 * the best fit). The fitted El Nino part is subtracted and the trend is tested again over the
 * same months, so the before and after numbers are directly comparable.
 */
export function adjustForEnso(region: Point[], ninoRaw: Point[]): EnsoResult | null {
  const nino = deseasonalize(ninoRaw);
  // Remove the Nino box's own long-term trend so the index only holds El Nino swings.
  const nt = analyzeTrend(nino);
  const index = new Map(
    nino.map((p) => [p.date, p.value - (nt.intercept + nt.sensSlopePerYear * (decimalYear(p.date) - nt.t0))]),
  );

  let best: { lag: number; dates: string[]; t: number[]; x: number[]; y: number[]; coef: number[]; sse: number } | null = null;
  for (let lag = 0; lag <= 6; lag++) {
    const dates: string[] = [];
    const t: number[] = [];
    const x: number[] = [];
    const y: number[] = [];
    for (const p of region) {
      const v = index.get(addMonths(p.date, -lag));
      if (v === undefined) continue;
      dates.push(p.date);
      t.push(decimalYear(p.date));
      x.push(v);
      y.push(p.value);
    }
    if (dates.length < 60) continue;
    const coef = regress(t, x, y);
    let sse = 0;
    for (let i = 0; i < y.length; i++) sse += (y[i] - coef[0] - coef[1] * t[i] - coef[2] * x[i]) ** 2;
    if (!best || sse < best.sse) best = { lag, dates, t, x, y, coef, sse };
  }
  if (!best) return null;

  const { dates, x, y, coef, lag } = best;
  const xMean = x.reduce((a, b) => a + b, 0) / x.length;
  const overlap: Point[] = dates.map((d, i) => ({ date: d, value: y[i] }));
  const adjusted: Point[] = dates.map((d, i) => ({ date: d, value: y[i] - coef[2] * (x[i] - xMean) }));

  const before = analyzeTrend(overlap);
  const after = analyzeTrend(adjusted);

  const varBefore = y.reduce((s, v) => s + v * v, 0);
  const varAdj = adjusted.reduce((s, p) => s + p.value * p.value, 0);
  const share = Math.max(0, Math.min(1, 1 - varAdj / varBefore));

  let verdict: EnsoResult['verdict'];
  if (before.significant && !after.significant) verdict = 'lost';
  else if (!before.significant && after.significant) verdict = 'gained';
  else {
    const ratio = before.sensSlopePerYear === 0 ? 1 : after.sensSlopePerYear / before.sensSlopePerYear;
    verdict = ratio < 0.75 ? 'weakened' : ratio > 1.25 ? 'strengthened' : 'unchanged';
  }

  return { n: dates.length, lagMonths: lag, coefficient: coef[2], varianceShare: share, before, after, adjusted, verdict };
}

/* ------------------------------------------------------------------ */
/* Turning point (change point)                                        */
/* ------------------------------------------------------------------ */

export interface TurningPoint {
  /** Date of the first month of the second segment */
  date: string;
  year: number;
  first: TrendResult;
  second: TrendResult;
  /** True if the two segments trend in opposite directions and both are significant */
  reversal: boolean;
}

/**
 * Search for the single month where splitting the record into two straight lines fits best
 * (smallest total squared error). Each side must have at least 7 years.
 * This is exploratory: choosing the best split inflates apparent significance, so a turning
 * point is only reported as a reversal when both sides have a significant trend (autocorrelation
 * adjusted) in opposite directions.
 */
export function findTurningPoint(series: Point[], minMonths = 84): TurningPoint | null {
  const n = series.length;
  if (n < 2 * minMonths) return null;
  const t = series.map((p) => decimalYear(p.date));
  const y = series.map((p) => p.value);

  // Prefix sums make each candidate split O(1).
  const P = { n: [0], t: [0], y: [0], tt: [0], ty: [0], yy: [0] };
  for (let i = 0; i < n; i++) {
    P.n.push(i + 1);
    P.t.push(P.t[i] + t[i]);
    P.y.push(P.y[i] + y[i]);
    P.tt.push(P.tt[i] + t[i] * t[i]);
    P.ty.push(P.ty[i] + t[i] * y[i]);
    P.yy.push(P.yy[i] + y[i] * y[i]);
  }
  const sse = (a: number, b: number) => {
    const m = b - a;
    const st = P.t[b] - P.t[a];
    const sy = P.y[b] - P.y[a];
    const stt = P.tt[b] - P.tt[a] - (st * st) / m;
    const sty = P.ty[b] - P.ty[a] - (st * sy) / m;
    const syy = P.yy[b] - P.yy[a] - (sy * sy) / m;
    return stt === 0 ? syy : syy - (sty * sty) / stt;
  };

  let bestK = -1;
  let bestSse = Infinity;
  for (let k = minMonths; k <= n - minMonths; k++) {
    const s = sse(0, k) + sse(k, n);
    if (s < bestSse) {
      bestSse = s;
      bestK = k;
    }
  }
  if (bestK < 0) return null;

  const first = analyzeTrend(series.slice(0, bestK));
  const second = analyzeTrend(series.slice(bestK));
  const reversal =
    first.significant && second.significant && Math.sign(first.sensSlopePerYear) !== Math.sign(second.sensSlopePerYear);
  return { date: series[bestK].date, year: Number(series[bestK].date.slice(0, 4)), first, second, reversal };
}
