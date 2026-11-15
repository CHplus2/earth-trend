import { readFileSync } from 'node:fs';
import { parseCsv } from '../src/lib/data.ts';
import { VARIABLES } from '../src/lib/catalog.ts';
import { analyzeTrend, correlate, deseasonalize } from '../src/lib/stats.ts';
const raw = (vid: string, rid: string) => {
  const v = VARIABLES.find((x) => x.id === vid)!;
  return parseCsv(readFileSync(`public/data/${vid}__${rid}.csv`, 'utf8')).map((p) => ({ ...p, value: p.value * (v.scale ?? 1) + (v.offset ?? 0) }));
};
const R = ['amazon', 'iberia', 'california', 'india', 'china', 'useast'];
for (const v of ['t2m', 'precip', 'tws', 'no2']) {
  for (const r of R) {
    const rw = raw(v, r);
    const t = analyzeTrend(deseasonalize(rw));
    const mean = rw.reduce((a, b) => a + b.value, 0) / rw.length;
    const pct = (t.sensSlopePerDecade / mean) * 100;
    console.log(v.padEnd(7), r.padEnd(11), 'n', t.n, rw[0].date.slice(0, 7), rw[rw.length - 1].date.slice(0, 7), 'slope/dec', t.sensSlopePerDecade.toFixed(3), `(${pct.toFixed(1)}%/dec of mean ${mean.toFixed(2)})`, 'p', t.mkPValue.toFixed(4), t.significant ? 'SIG' : 'ns');
  }
}
console.log('--- NO2 China by period (annual mean, 1e15)');
const c = raw('no2', 'china'); const byY: Record<string, number[]> = {};
c.forEach((p) => (byY[p.date.slice(0, 4)] ??= []).push(p.value));
console.log(Object.entries(byY).map(([y, a]) => y + ':' + (a.reduce((x, z) => x + z, 0) / a.length).toFixed(1)).join(' '));
console.log('--- tws~precip (detrended) per region');
for (const r of R) { const k = correlate(deseasonalize(raw('tws', r)), deseasonalize(raw('precip', r))); console.log(r.padEnd(11), k ? `r ${k.rDetrended.toFixed(2)} p ${k.pDetrended.toFixed(4)} n ${k.n}` : 'n/a'); }
