import { readFileSync, existsSync } from 'node:fs';
import { parseCsv } from '../src/lib/data.ts';
import { REGIONS, VARIABLES } from '../src/lib/catalog.ts';
import { analyzeTrend, deseasonalize } from '../src/lib/stats.ts';
const t0 = Date.now();
const rows: any[] = [];
for (const r of REGIONS) for (const v of VARIABLES) {
  if (!v.regionTypes.includes(r.type)) continue;
  const f = `public/data/${v.id}__${r.id}.csv`;
  if (!existsSync(f)) { console.log('MISSING', f); continue; }
  const pts = parseCsv(readFileSync(f, 'utf8')).map((p) => ({ ...p, value: p.value * (v.scale ?? 1) + (v.offset ?? 0) }));
  const t = analyzeTrend(deseasonalize(pts));
  rows.push({ r: r.id, v: v.id, z: t.mkZ, p: t.mkPValue, sig: t.significant, perDec: t.sensSlopePerDecade });
}
const order = [...rows].sort((a, b) => a.p - b.p); let cut = -1;
order.forEach((x, k) => { if (x.p <= ((k + 1) / order.length) * 0.05) cut = k; });
order.forEach((x, k) => (x.holds = k <= cut));
console.log('combos', rows.length, 'sig', rows.filter((x) => x.sig).length, 'holds', rows.filter((x) => x.holds).length, 'ms', Date.now() - t0, 'max|Z|', Math.max(...rows.map((x) => Math.abs(x.z))).toFixed(1));
console.log('significant but not holding:', rows.filter((x) => x.sig && !x.holds).map((x) => `${x.v}/${x.r} p=${x.p.toFixed(4)}`).join(', '));
console.log('top 8 by |Z|:', [...rows].sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 8).map((x) => `${x.v}/${x.r} Z=${x.z.toFixed(1)}`).join(', '));
