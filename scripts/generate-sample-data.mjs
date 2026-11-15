// Generates PLACEHOLDER monthly series so the app runs before you download real
// Giovanni data. These numbers are synthetic and NOT NASA measurements.
// Replace the files in public/data and set "synthetic": false in manifest.json.
import { mkdirSync, writeFileSync } from 'node:fs';

const regions = ['amazon', 'iberia', 'california', 'india', 'china', 'useast'];

// Deterministic PRNG so the output is reproducible.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

// base, seasonal amplitude, trend per year, noise sd, start year, optional bend
const spec = {
  t2m: { start: 1980, base: 15, amp: 8, noise: 0.6, trend: { amazon: 0.025, iberia: 0.04, california: 0.03, india: 0.02, china: 0.045, useast: 0.025 } },
  precip: { start: 2000, base: 3, amp: 1.5, noise: 0.5, trend: { amazon: -0.02, iberia: -0.01, california: -0.005, india: 0.01, china: 0.005, useast: 0.015 } },
  tws: { start: 2003, base: 0, amp: 40, noise: 25, trend: { amazon: -2, iberia: -3, california: -9, india: -8, china: -5, useast: 2 } },
  no2: { start: 2004, base: 4, amp: 1.2, noise: 0.35, trend: { amazon: 0.0, iberia: -0.05, california: -0.1, india: 0.1, china: -0.0, useast: -0.12 } },
};

mkdirSync('public/data', { recursive: true });
let seed = 1;
for (const [vid, v] of Object.entries(spec)) {
  for (const rid of regions) {
    const r = rng(seed++ * 7919);
    const lines = ['date,value'];
    let ar = 0;
    for (let y = v.start; y <= 2025; y++) {
      for (let m = 0; m < 12; m++) {
        if (y === v.start && vid === 'precip' && m < 5) continue;
        const t = y - v.start + m / 12;
        ar = 0.5 * ar + gauss(r) * v.noise;
        let trend = v.trend[rid] * t;
        // China NO2: rise then fall
        if (vid === 'no2' && rid === 'china') trend = t < 7 ? 0.3 * t : 2.1 - 0.22 * (t - 7);
        const phase = ['amazon', 'california', 'india', 'iberia'].includes(rid) ? 1 : 1;
        const season = v.amp * Math.sin(((m - 3) / 12) * 2 * Math.PI) * phase;
        const val = v.base + season + trend + ar;
        lines.push(`${y}-${String(m + 1).padStart(2, '0')}-01,${val.toFixed(3)}`);
      }
    }
    writeFileSync(`public/data/${vid}__${rid}.csv`, lines.join('\n') + '\n');
  }
}
writeFileSync('public/data/manifest.json', JSON.stringify({ synthetic: true }, null, 2) + '\n');
console.log('Wrote placeholder data to public/data');
