import { analyzeTrend, deseasonalize } from '../src/lib/stats.ts';

let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const mk = (slopePerYear: number, noise: number) => {
  const pts = [];
  for (let i = 0; i < 240; i++) {
    const y = 2000 + Math.floor(i / 12), m = i % 12;
    const v = 5 * Math.sin((m / 12) * 2 * Math.PI) + slopePerYear * (i / 12) + (rnd() - 0.5) * noise;
    pts.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-01`, value: v });
  }
  return deseasonalize(pts);
};
const a = analyzeTrend(mk(0.5, 4));
const b = analyzeTrend(mk(0, 4));
console.log('trend 0.5/yr  -> sen', a.sensSlopePerYear.toFixed(3), 'ols', a.olsSlopePerYear.toFixed(3), 'mkP', a.mkPValue.toExponential(2), 'olsP', a.olsPValue.toExponential(2));
console.log('no trend      -> sen', b.sensSlopePerYear.toFixed(3), 'mkP', b.mkPValue.toFixed(3), 'olsP', b.olsPValue.toFixed(3));
if (Math.abs(a.sensSlopePerYear - 0.5) > 0.05 || !a.significant) throw new Error('known-trend check failed');
if (b.significant) throw new Error('null-trend check failed');
console.log('OK');
