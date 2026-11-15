import { readdirSync, readFileSync } from 'node:fs';
import { parseCsv } from '../src/lib/data.ts';
for (const f of readdirSync('public/data').filter((x) => x.endsWith('.csv')).sort()) {
  const p = parseCsv(readFileSync('public/data/' + f, 'utf8'));
  const v = p.map((x) => x.value);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  console.log(f.padEnd(26), String(p.length).padStart(4), p[0]?.date.slice(0, 7), p[p.length - 1]?.date.slice(0, 7), 'min', Math.min(...v).toPrecision(4), 'mean', mean.toPrecision(4), 'max', Math.max(...v).toPrecision(4));
}
