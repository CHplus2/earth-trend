import { useEffect, useMemo, useState } from 'react';
import { REGIONS, VARIABLES } from '../lib/catalog';
import { loadVariableSeries } from '../lib/data';
import { analyzeTrend, deseasonalize } from '../lib/stats';

interface Row {
  regionId: string;
  regionName: string;
  variableId: string;
  variableName: string;
  domain: string;
  unit: string;
  first: string;
  last: string;
  years: number;
  perDecade: number;
  total: number;
  z: number;
  p: number;
  sig: boolean;
  /** Still significant after correcting for running many tests (Benjamini-Hochberg, 5%) */
  holds: boolean;
}

interface Props {
  onOpen: (regionId: string, variableId: string) => void;
}

const fmt = (v: number) => {
  const a = Math.abs(v);
  return (v < 0 ? '-' : '') + (a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 1 ? a.toFixed(2) : a.toFixed(3));
};
const fmtP = (p: number) => (p < 0.001 ? '< 0.001' : p.toFixed(3));

export default function Scanner({ onOpen }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [onlySig, setOnlySig] = useState(false);
  const [domain, setDomain] = useState('all');
  const [sort, setSort] = useState<'strength' | 'p' | 'region' | 'variable'>('strength');

  useEffect(() => {
    let cancelled = false;
    const combos = REGIONS.flatMap((r) =>
      VARIABLES.filter((v) => v.regionTypes.includes(r.type)).map((v) => ({ r, v })),
    );
    Promise.allSettled(combos.map(({ r, v }) => loadVariableSeries(v, r.id))).then((results) => {
      if (cancelled) return;
      const out: Row[] = [];
      const missing: string[] = [];
      results.forEach((res, i) => {
        const { r, v } = combos[i];
        if (res.status !== 'fulfilled' || res.value.length < 24) {
          missing.push(`${v.name} in ${r.name}`);
          return;
        }
        const pts = res.value;
        const t = analyzeTrend(deseasonalize(pts));
        out.push({
          regionId: r.id,
          regionName: r.name,
          variableId: v.id,
          variableName: v.name,
          domain: v.domain,
          unit: v.unit,
          first: pts[0].date.slice(0, 4),
          last: pts[pts.length - 1].date.slice(0, 4),
          years: pts.length / 12,
          perDecade: t.sensSlopePerDecade,
          total: t.totalChange,
          z: t.mkZ,
          p: t.mkPValue,
          sig: t.significant,
          holds: false,
        });
      });
      // Benjamini-Hochberg false discovery control at 5%
      const order = [...out].sort((a, b) => a.p - b.p);
      let cutoff = -1;
      order.forEach((row, k) => {
        if (row.p <= ((k + 1) / order.length) * 0.05) cutoff = k;
      });
      order.forEach((row, k) => (row.holds = k <= cutoff));
      setRows(out);
      setSkipped(missing);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = useMemo(() => {
    if (!rows) return [];
    let list = rows.filter((r) => (domain === 'all' || r.domain === domain) && (!onlySig || r.sig));
    list = [...list].sort((a, b) =>
      sort === 'strength' ? Math.abs(b.z) - Math.abs(a.z)
      : sort === 'p' ? a.p - b.p
      : sort === 'region' ? a.regionName.localeCompare(b.regionName)
      : a.variableName.localeCompare(b.variableName),
    );
    return list;
  }, [rows, domain, onlySig, sort]);

  if (!rows) return <p>Scanning every region and variable...</p>;

  const nSig = rows.filter((r) => r.sig).length;
  const nHold = rows.filter((r) => r.holds).length;

  return (
    <section className="scanner">
      <h2>Which variables are trending?</h2>
      <p>
        This scans every region and variable that has data ({rows.length} combinations), removes the seasonal cycle, and tests
        each for a linear trend. <strong>{nSig}</strong> are significant at the usual 5% level, and <strong>{nHold}</strong> still
        hold up after allowing for the fact that so many tests were run (some would pass by luck alone). Click a row to open it.
      </p>

      <div className="controls">
        <label>
          Show
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="all">All domains</option>
            <option value="atmosphere">Atmosphere</option>
            <option value="land">Land</option>
            <option value="ocean">Ocean</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="strength">Strength of trend</option>
            <option value="p">Significance (p-value)</option>
            <option value="region">Region</option>
            <option value="variable">Variable</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={onlySig} onChange={(e) => setOnlySig(e.target.checked)} />
          Significant only
        </label>
      </div>

      <div className="tablewrap">
        <table className="scan">
          <thead>
            <tr>
              <th>Region</th>
              <th>Variable</th>
              <th>Period</th>
              <th>Change per decade</th>
              <th>Strength</th>
              <th>p-value</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.regionId + r.variableId} onClick={() => onOpen(r.regionId, r.variableId)} className="clickable">
                <td>{r.regionName}</td>
                <td>{r.variableName}</td>
                <td>{r.first} to {r.last}</td>
                <td>
                  <span className={r.perDecade >= 0 ? 'up' : 'down'}>{r.perDecade >= 0 ? 'Rising' : 'Falling'}</span> {fmt(r.perDecade)} {r.unit}
                </td>
                <td>
                  <span className="bar"><span style={{ width: `${Math.min(100, (Math.abs(r.z) / 8) * 100)}%` }} /></span> {Math.abs(r.z).toFixed(1)}
                </td>
                <td>{fmtP(r.p)}</td>
                <td className={r.holds ? 'ok' : r.sig ? 'maybe' : 'none'}>
                  {r.holds ? 'Clear trend' : r.sig ? 'Significant, less certain' : 'No clear trend'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p>Nothing matches these filters.</p>}
      {skipped.length > 0 && <p className="note">Skipped (missing or too short): {skipped.join('; ')}.</p>}
      <p className="note">
        "Strength" is the Mann-Kendall Z score: it measures how consistent the trend is, in units that can be compared across
        variables. A bigger number means a clearer trend, not a bigger change. Records differ in length (from 24 to 46 years),
        so a short record can hide a real trend. Linear trends only. A trend does not show what caused it.
      </p>
    </section>
  );
}
