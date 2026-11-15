export interface Point {
  /** ISO date, first day of the month, e.g. 2004-10-01 */
  date: string;
  value: number;
}

export interface TrendResult {
  n: number;
  /** Theil-Sen slope, units per year */
  sensSlopePerYear: number;
  /** Theil-Sen slope, units per decade */
  sensSlopePerDecade: number;
  /** OLS slope, units per year */
  olsSlopePerYear: number;
  olsCI95PerYear: [number, number];
  olsPValue: number;
  /** Mann-Kendall S statistic */
  mkS: number;
  mkZ: number;
  mkPValue: number;
  /** Lag-1 autocorrelation of detrended anomalies */
  lag1: number;
  /** True when p-value was adjusted for positive autocorrelation */
  autocorrAdjusted: boolean;
  direction: 'increasing' | 'decreasing' | 'none';
  significant: boolean;
  /** Total change over the record from the Sen slope */
  totalChange: number;
  intercept: number;
  /** Fractional year of first point (for drawing the fit line) */
  t0: number;
}

export function decimalYear(date: string): number {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  return y + (m - 1) / 12;
}

/** Remove the mean seasonal cycle: subtract each calendar month's mean. */
export function deseasonalize(points: Point[]): Point[] {
  const sums = new Array<number>(12).fill(0);
  const counts = new Array<number>(12).fill(0);
  for (const p of points) {
    const m = Number(p.date.slice(5, 7)) - 1;
    sums[m] += p.value;
    counts[m] += 1;
  }
  const means = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
  return points.map((p) => ({
    date: p.date,
    value: p.value - means[Number(p.date.slice(5, 7)) - 1],
  }));
}

/** Standard normal CDF via the Abramowitz-Stegun erf approximation. */
export function normCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp((-z * z) / 2);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Two-sided p-value for a t statistic (normal approximation with df correction). */
export function tTwoSidedP(t: number, df: number): number {
  // Convert t to an approximately normal z (Wallace 1959 approximation).
  const z = Math.sqrt(df * Math.log(1 + (t * t) / df)) * Math.sqrt(1 - 1 / (4 * df)) * Math.sign(t);
  return 2 * (1 - normCdf(Math.abs(z)));
}

/** 97.5th percentile of Student t (Cornish-Fisher expansion; fine for df > ~10). */
function tCrit975(df: number): number {
  const z = 1.959964;
  return (
    z +
    (z ** 3 + z) / (4 * df) +
    (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df ** 2)
  );
}

export function lag1Autocorr(x: number[]): number {
  const n = x.length;
  const mean = x.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    den += (x[i] - mean) ** 2;
    if (i < n - 1) num += (x[i] - mean) * (x[i + 1] - mean);
  }
  return den === 0 ? 0 : num / den;
}

function median(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Linear trend analysis on a monthly series.
 * Pass already-deseasonalized anomalies for a cleaner trend.
 *
 * - Theil-Sen slope: median of all pairwise slopes (robust to outliers).
 * - Mann-Kendall: non-parametric monotonic trend test with tie correction.
 *   If lag-1 autocorrelation is positive, the variance of S is inflated by
 *   (1+r)/(1-r), a simplified effective-sample-size correction.
 * - OLS slope with 95% confidence interval and t-test p-value.
 */
export function analyzeTrend(points: Point[], alpha = 0.05): TrendResult {
  const n = points.length;
  if (n < 10) throw new Error('Need at least 10 points for a trend test.');
  const t = points.map((p) => decimalYear(p.date));
  const y = points.map((p) => p.value);

  // Mann-Kendall S
  let s = 0;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      s += Math.sign(y[j] - y[i]);
      if (t[j] !== t[i]) slopes.push((y[j] - y[i]) / (t[j] - t[i]));
    }
  }

  // Tie-corrected variance of S
  const tieCounts = new Map<number, number>();
  for (const v of y) tieCounts.set(v, (tieCounts.get(v) ?? 0) + 1);
  let tieTerm = 0;
  tieCounts.forEach((c) => {
    if (c > 1) tieTerm += c * (c - 1) * (2 * c + 5);
  });
  let varS = (n * (n - 1) * (2 * n + 5) - tieTerm) / 18;

  const sen = median(slopes);
  const intercept0 = median(y.map((v, i) => v - sen * (t[i] - t[0])));

  // Autocorrelation of residuals around the Sen line
  const resid = y.map((v, i) => v - (intercept0 + sen * (t[i] - t[0])));
  const lag1 = lag1Autocorr(resid);
  let adjusted = false;
  if (lag1 > 0) {
    varS *= (1 + lag1) / (1 - lag1);
    adjusted = true;
  }

  const mkZ = s === 0 ? 0 : (s - Math.sign(s)) / Math.sqrt(varS);
  const mkP = 2 * (1 - normCdf(Math.abs(mkZ)));

  // OLS
  const tMean = t.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (t[i] - tMean) ** 2;
    sxy += (t[i] - tMean) * (y[i] - yMean);
  }
  const olsSlope = sxy / sxx;
  const olsIntercept = yMean - olsSlope * tMean;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (y[i] - (olsIntercept + olsSlope * t[i])) ** 2;
  const df = n - 2;
  const se = Math.sqrt(sse / df / sxx);
  const crit = tCrit975(df);
  const olsP = se === 0 ? 0 : tTwoSidedP(olsSlope / se, df);

  const significant = mkP < alpha;
  return {
    n,
    sensSlopePerYear: sen,
    sensSlopePerDecade: sen * 10,
    olsSlopePerYear: olsSlope,
    olsCI95PerYear: [olsSlope - crit * se, olsSlope + crit * se],
    olsPValue: olsP,
    mkS: s,
    mkZ,
    mkPValue: mkP,
    lag1,
    autocorrAdjusted: adjusted,
    direction: sen > 0 ? 'increasing' : sen < 0 ? 'decreasing' : 'none',
    significant,
    totalChange: sen * (t[n - 1] - t[0]),
    intercept: intercept0,
    t0: t[0],
  };
}

export interface CorrelationResult {
  n: number;
  /** Pearson r of the two series after removing each one's linear trend */
  rDetrended: number;
  /** Pearson r of the series as given (trends included) */
  rRaw: number;
  /** Effective sample size after allowing for autocorrelation */
  nEff: number;
  /** Two-sided p-value for rDetrended using nEff */
  pDetrended: number;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
}

function detrend(points: Point[]): number[] {
  const tr = analyzeTrend(points);
  return points.map((p) => p.value - (tr.intercept + tr.sensSlopePerYear * (decimalYear(p.date) - tr.t0)));
}

/**
 * Compare two monthly series over the months they share.
 * Two series that both trend will correlate strongly even if unrelated, so the
 * headline number is the correlation of the detrended series (do they rise and
 * fall together from month to month?). The p-value uses an effective sample
 * size reduced for autocorrelation.
 */
export function correlate(a: Point[], b: Point[]): CorrelationResult | null {
  const mapB = new Map(b.map((p) => [p.date, p.value]));
  const pa: Point[] = [];
  const pb: Point[] = [];
  for (const p of a) {
    const v = mapB.get(p.date);
    if (v !== undefined) {
      pa.push(p);
      pb.push({ date: p.date, value: v });
    }
  }
  if (pa.length < 24) return null;
  const da = detrend(pa);
  const db = detrend(pb);
  const r = pearson(da, db);
  const ra = Math.max(0, lag1Autocorr(da));
  const rb = Math.max(0, lag1Autocorr(db));
  const n = pa.length;
  const nEff = Math.min(n, Math.max(4, (n * (1 - ra * rb)) / (1 + ra * rb)));
  const t = r * Math.sqrt((nEff - 2) / Math.max(1e-12, 1 - r * r));
  return {
    n,
    rDetrended: r,
    rRaw: pearson(pa.map((p) => p.value), pb.map((p) => p.value)),
    nEff,
    pDetrended: tTwoSidedP(t, nEff - 2),
  };
}
