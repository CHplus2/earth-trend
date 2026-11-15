import { readFileSync } from 'node:fs';
import { parseCsv } from '../src/lib/data.ts';
import { VARIABLES } from '../src/lib/catalog.ts';
import { analyzeTrend, correlate, deseasonalize } from '../src/lib/stats.ts';
const load = (vid: string, rid: string) => {
  const v = VARIABLES.find((x) => x.id === vid)!;
  const k = v.scale ?? 1, o = v.offset ?? 0;
  return deseasonalize(parseCsv(readFileSync(`public/data/${vid}__${rid}.csv`, 'utf8')).map((p) => ({ ...p, value: p.value * k + o })));
};
for (const r of ['nino34', 'natlantic', 'barents']) {
  const out: Record<string, ReturnType<typeof load>> = {};
  for (const v of ['sst', 'air850', 'air300']) {
    out[v] = load(v, r);
    const t = analyzeTrend(out[v]);
    console.log(r.padEnd(10), v.padEnd(7), 'n', t.n, 'slope/dec', t.sensSlopePerDecade.toFixed(3), 'p', t.mkPValue.toFixed(4), t.significant ? 'SIG' : 'ns');
  }
  const c1 = correlate(out.sst, out.air850)!, c2 = correlate(out.air850, out.air300)!;
  console.log(r.padEnd(10), 'sst~air850 r', c1.rDetrended.toFixed(2), 'p', c1.pDetrended.toFixed(4), '| air850~air300 r', c2.rDetrended.toFixed(2), 'p', c2.pDetrended.toFixed(4));
}
