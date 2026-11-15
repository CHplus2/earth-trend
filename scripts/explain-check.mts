import { readFileSync, existsSync } from 'node:fs';
import { parseCsv } from '../src/lib/data.ts';
import { deseasonalize } from '../src/lib/stats.ts';
import { adjustForEnso, findTurningPoint } from '../src/lib/explain.ts';
import { VARIABLES, REGIONS } from '../src/lib/catalog.ts';

const load = (v: string, r: string) => {
  const f = `public/data/${v}__${r}.csv`;
  return existsSync(f) ? parseCsv(readFileSync(f, 'utf8')) : null;
};
const nino = load('sst', 'nino34')!;
for (const v of VARIABLES) for (const r of REGIONS) {
  if (!v.regionTypes.includes(r.type)) continue;
  const raw = load(v.id, r.id); if (!raw) continue;
  const k = v.scale ?? 1, off = v.offset ?? 0;
  const s = deseasonalize(raw.map(p => ({ ...p, value: p.value * k + off })));
  const e = r.id === 'nino34' ? null : adjustForEnso(s, nino);
  const c = findTurningPoint(s);
  console.log(`${v.id}/${r.id}`.padEnd(18),
    e ? `ENSO lag${e.lagMonths} share${(e.varianceShare*100).toFixed(0)}% ${e.before.sensSlopePerDecade.toFixed(3)}(${e.before.significant?'S':'n'})->${e.after.sensSlopePerDecade.toFixed(3)}(${e.after.significant?'S':'n'}) ${e.verdict}` : 'ENSO -',
    '|', c ? `TP ${c.date.slice(0,7)} ${c.first.sensSlopePerDecade.toFixed(2)}${c.first.significant?'*':''} / ${c.second.sensSlopePerDecade.toFixed(2)}${c.second.significant?'*':''} ${c.reversal?'REVERSAL':''}` : 'TP -');
}
