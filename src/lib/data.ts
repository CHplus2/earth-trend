import type { Point } from './stats';
import type { Variable } from './catalog';

export interface Manifest {
  /** True while the CSVs in public/data are generated placeholders, not NASA data. */
  synthetic: boolean;
}

/**
 * Parse a Giovanni CSV or a plain "date,value" CSV.
 * Giovanni files start with metadata lines; we keep only rows whose first
 * column looks like an ISO date and whose second column is a number.
 */
export function parseCsv(text: string): Point[] {
  // Group by calendar month so daily files are averaged to monthly values.
  const groups = new Map<string, { sum: number; n: number }>();
  for (const line of text.split(/\r?\n/)) {
    const cols = line.split(',');
    if (cols.length < 2) continue;
    if (!/^\d{4}-\d{2}/.test(cols[0].trim())) continue;
    const value = Number(cols[1]);
    // Skip non-numbers and fill values (Giovanni uses -9999 or very large numbers).
    if (!Number.isFinite(value) || value <= -9990 || Math.abs(value) > 1e20) continue;
    const key = cols[0].trim().slice(0, 7) + '-01';
    const g = groups.get(key) ?? { sum: 0, n: 0 };
    g.sum += value;
    g.n += 1;
    groups.set(key, g);
  }
  const isDaily = Array.from(groups.values()).some((g) => g.n > 1);
  const out: Point[] = [];
  groups.forEach((g, date) => {
    // For daily input, drop partial months (fewer than 20 days) so they don't bias the trend.
    if (isDaily && g.n < 20) return;
    out.push({ date, value: g.sum / g.n });
  });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export async function loadSeries(variableId: string, regionId: string): Promise<Point[]> {
  const res = await fetch(`/data/${variableId}__${regionId}.csv`);
  if (!res.ok) throw new Error(`No data file for ${variableId} in ${regionId}.`);
  const text = await res.text();
  // Cloudflare Pages serves index.html for unknown paths, so check the content too.
  const pts = parseCsv(text);
  if (pts.length === 0) throw new Error(`Data file for ${variableId} in ${regionId} is empty.`);
  return pts;
}

export async function loadManifest(): Promise<Manifest> {
  try {
    const res = await fetch('/data/manifest.json');
    if (!res.ok) return { synthetic: false };
    return (await res.json()) as Manifest;
  } catch {
    return { synthetic: false };
  }
}

/** Load a series and convert it to the variable's display unit. */
export async function loadVariableSeries(v: Variable, regionId: string): Promise<Point[]> {
  const pts = await loadSeries(v.id, regionId);
  const k = v.scale ?? 1;
  const off = v.offset ?? 0;
  return k === 1 && off === 0 ? pts : pts.map((x) => ({ ...x, value: x.value * k + off }));
}
