import { useEffect, useMemo, useState } from 'react';
import MapPicker from './components/MapPicker';
import TrendChart from './components/TrendChart';
import StatsCard from './components/StatsCard';
import CompareChart from './components/CompareChart';
import CompareCard from './components/CompareCard';
import Summary from './components/Summary';
import { DEMOS, REGIONS, VARIABLES } from './lib/catalog';
import { loadManifest, loadVariableSeries } from './lib/data';
import { analyzeTrend, correlate, deseasonalize } from './lib/stats';
import type { Point } from './lib/stats';

export default function App() {
  const [regionId, setRegionId] = useState('china');
  const [variableId, setVariableId] = useState('no2');
  const [removeSeason, setRemoveSeason] = useState(true);
  const [raw, setRaw] = useState<Point[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synthetic, setSynthetic] = useState(false);
  const [demo, setDemo] = useState<number | null>(null);
  const [compareId, setCompareId] = useState('');
  const [raw2, setRaw2] = useState<Point[] | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const region = REGIONS.find((r) => r.id === regionId)!;
  const variable = VARIABLES.find((v) => v.id === variableId)!;

  useEffect(() => {
    loadManifest().then((m) => setSynthetic(m.synthetic));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRaw(null);
    setError(null);
    loadVariableSeries(variable, regionId)
      .then((p) => !cancelled && setRaw(p))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [variableId, regionId]);

  useEffect(() => {
    let cancelled = false;
    setRaw2(null);
    setError2(null);
    if (!compareId || compareId === variableId) return;
    const v2 = VARIABLES.find((v) => v.id === compareId);
    if (!v2) return;
    loadVariableSeries(v2, regionId)
      .then((p) => !cancelled && setRaw2(p))
      .catch((e: Error) => !cancelled && setError2(e.message));
    return () => {
      cancelled = true;
    };
  }, [compareId, variableId, regionId]);

  const series = useMemo(() => (raw ? (removeSeason ? deseasonalize(raw) : raw) : null), [raw, removeSeason]);
  const trend = useMemo(() => (series ? analyzeTrend(series) : null), [series]);

  const series2 = useMemo(() => (raw2 ? (removeSeason ? deseasonalize(raw2) : raw2) : null), [raw2, removeSeason]);
  const trend2 = useMemo(() => (series2 ? analyzeTrend(series2) : null), [series2]);
  const corr = useMemo(() => (series && series2 ? correlate(series, series2) : null), [series, series2]);
  const variable2 = VARIABLES.find((v) => v.id === compareId);

  function pickRegion(id: string) {
    const r = REGIONS.find((x) => x.id === id)!;
    setRegionId(id);
    setDemo(null);
    // Keep the variable valid for this kind of region (land vs ocean).
    if (variable.regionType !== r.type) {
      const next = VARIABLES.find((v) => v.regionType === r.type);
      if (next) setVariableId(next.id);
    }
    if (compareId) {
      const c = VARIABLES.find((v) => v.id === compareId);
      if (c && c.regionType !== r.type) setCompareId('');
    }
  }

  function variableOptions(exclude?: string) {
    const groups: Array<['atmosphere' | 'land' | 'ocean', string]> = [
      ['atmosphere', 'Atmosphere'],
      ['land', 'Land'],
      ['ocean', 'Ocean'],
    ];
    return groups.map(([d, label]) => (
      <optgroup key={d} label={label}>
        {VARIABLES.filter((v) => v.domain === d && v.id !== exclude).map((v) => (
          <option key={v.id} value={v.id} disabled={v.regionType !== region.type}>
            {v.name}{v.regionType !== region.type ? ` (no data for ${region.type} regions)` : ''}
          </option>
        ))}
      </optgroup>
    ));
  }

  function startDemo(i: number) {
    setDemo(i);
    setRegionId(DEMOS[i].regionId);
    setVariableId(DEMOS[i].variableId);
    setRemoveSeason(true);
  }

  return (
    <div className="app">
      <header>
        <h1>Earth System Trend Detective</h1>
        <p>Pick a place and a variable. Find out what is changing, where, by how much, and whether it is significant.</p>
      </header>

      {synthetic && (
        <div className="banner">
          Placeholder data: these series are synthetic, not NASA measurements. Replace the files in public/data with Giovanni downloads (see README).
        </div>
      )}

      <section className="demos">
        <strong>Try an example:</strong>
        {DEMOS.map((d, i) => (
          <button key={d.title} className={demo === i ? 'active' : ''} onClick={() => startDemo(i)}>
            {d.title}
          </button>
        ))}
        {demo !== null && <p className="demo-text">{DEMOS[demo].text}</p>}
      </section>

      <main>
        <div className="left">
          <MapPicker selectedId={regionId} onSelect={pickRegion} />
          <p className="blurb"><strong>{region.name}:</strong> {region.blurb}</p>
        </div>

        <div className="right">
          <div className="controls">
            <label>
              Variable
              <select value={variableId} onChange={(e) => { setVariableId(e.target.value); setDemo(null); }}>
                {variableOptions()}
              </select>
            </label>
            <label>
              Compare with
              <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
                <option value="">(none)</option>
                {variableOptions(variableId)}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={removeSeason} onChange={(e) => setRemoveSeason(e.target.checked)} />
              Remove seasonal cycle
            </label>
          </div>
          <p className="def"><strong>What is this?</strong> {variable.definition} <span className="muted">({variable.unit}, source record {variable.years})</span></p>

          {error && <div className="error">{error}</div>}
          {!error && !series && <p>Loading...</p>}
          {series && trend && (
            <>
              {raw && <Summary variableName={variable.name} regionName={region.name} unit={variable.unit} raw={raw} trend={trend} />}
              <TrendChart points={series} trend={trend} unit={variable.unit} anomalies={removeSeason} />
              <StatsCard trend={trend} unit={variable.unit} />
            </>
          )}

          {compareId && compareId !== variableId && (
            <>
              <h2 className="sub">{variable.name} vs {variable2?.name}</h2>
              {error2 && <div className="error">{error2}</div>}
              {series && series2 && trend && trend2 && variable2 && (
                <>
                  <CompareChart a={series} b={series2} nameA={variable.name} nameB={variable2.name} unitA={variable.unit} unitB={variable2.unit} />
                  <CompareCard nameA={variable.name} nameB={variable2.name} trendA={trend} trendB={trend2} corr={corr} />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer>
        Trends are linear (Theil-Sen slope, Mann-Kendall test). Real climate signals can be non-linear, and a trend does not prove its cause.
        Data: NASA Giovanni (MERRA-2, GPM IMERG, GLDAS, OMI). Imagery: NASA GIBS.
      </footer>
    </div>
  );
}
