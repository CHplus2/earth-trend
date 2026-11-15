import { useEffect, useMemo, useState } from 'react';
import MapPicker from './components/MapPicker';
import TrendChart from './components/TrendChart';
import StatsCard from './components/StatsCard';
import CompareChart from './components/CompareChart';
import CompareCard from './components/CompareCard';
import Summary from './components/Summary';
import Scanner from './components/Scanner';
import Method from './components/Method';
import { computeRegionTrends } from './lib/regionTrends';
import type { RegionTrend } from './lib/regionTrends';
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
  const [view, setView] = useState<'explore' | 'scan' | 'method'>('explore');
  const [mapMode, setMapMode] = useState<'category' | 'trend'>('trend');
  const [trends, setTrends] = useState<Record<string, RegionTrend> | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'land' | 'ocean'>('all');
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

  useEffect(() => {
    let cancelled = false;
    setTrends(null);
    computeRegionTrends(variable).then((t) => !cancelled && setTrends(t));
    return () => {
      cancelled = true;
    };
  }, [variable]);

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
    if (!variable.regionTypes.includes(r.type)) {
      const next = VARIABLES.find((v) => v.regionTypes.includes(r.type));
      if (next) setVariableId(next.id);
    }
    if (compareId) {
      const c = VARIABLES.find((v) => v.id === compareId);
      if (c && !c.regionTypes.includes(r.type)) setCompareId('');
    }
  }

  function chooseCategory(k: 'all' | 'land' | 'ocean') {
    setMapFilter(k);
    // The trend colours depend on the variable, so move to a region and variable of this kind.
    if (k !== 'all' && region.type !== k) {
      const first = REGIONS.find((r) => r.type === k);
      if (first) pickRegion(first.id);
    }
  }

  function variableOptions(exclude?: string) {
    const groups: Array<['atmosphere' | 'land' | 'ocean', string]> = [
      ['atmosphere', 'Atmosphere'],
      ['land', 'Land'],
      ['ocean', 'Ocean'],
    ];
    return groups.map(([d, label]) => {
      const options = VARIABLES.filter((v) => v.domain === d && v.id !== exclude && v.regionTypes.includes(region.type));
      if (options.length === 0) return null;
      return (
        <optgroup key={d} label={label}>
          {options.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </optgroup>
      );
    });
  }

  function openFromScanner(rid: string, vid: string) {
    setRegionId(rid);
    setVariableId(vid);
    setCompareId('');
    setDemo(null);
    setRemoveSeason(true);
    setView('explore');
    window.scrollTo({ top: 0 });
  }

  function startDemo(i: number) {
    setDemo(i);
    setRegionId(DEMOS[i].regionId);
    setVariableId(DEMOS[i].variableId);
    setCompareId(DEMOS[i].compareVariableId ?? '');
    setRemoveSeason(true);
  }

  return (
    <div className="app">
      <header>
        <h1>Terra Trace</h1>
        <p className="tagline">
          Earth System Trend Detective. Find what is really changing on Earth, where, by how much, and how sure we are.
        </p>
      </header>

      {synthetic && (
        <div className="banner">
          Placeholder data: these series are synthetic, not NASA measurements. Replace the files in public/data with Giovanni downloads (see README).
        </div>
      )}

      <nav className="tabs">
        <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}>Explore a place</button>
        <button className={view === 'scan' ? 'active' : ''} onClick={() => setView('scan')}>Scan everything for trends</button>
        <button className={view === 'method' ? 'active' : ''} onClick={() => setView('method')}>How it works</button>
      </nav>

      {view === 'scan' && <Scanner onOpen={openFromScanner} />}
      {view === 'method' && <Method />}

      {view === 'explore' && (<>
      <section className="demos">
        <span className="label">Not sure where to start? Try an example:</span>
        <div className="demo-buttons">
          {DEMOS.map((d, i) => (
            <button key={d.title} className={demo === i ? 'active' : ''} onClick={() => startDemo(i)}>
              {d.title}
            </button>
          ))}
        </div>
        {demo !== null && (
          <div className="demo-text">
            <p>{DEMOS[demo].text}</p>
            {DEMOS[demo].sources && (
              <p className="sources">
                Sources:{' '}
                {DEMOS[demo].sources!.map((src) => (
                  <a key={src.url} href={src.url} target="_blank" rel="noreferrer">{src.label}</a>
                ))}
              </p>
            )}
          </div>
        )}
      </section>

      <main>
        <div className="left">
          <div className="chips">
            <span>Colour by:</span>
            <button className={mapMode === 'trend' ? 'active' : ''} onClick={() => setMapMode('trend')}>Trend</button>
            <button className={mapMode === 'category' ? 'active' : ''} onClick={() => setMapMode('category')}>Land / ocean</button>
            <span className="gap" />
            <span>Show only:</span>
            {([['all', 'All'], ['land', 'Land'], ['ocean', 'Ocean']] as const).map(([k, label]) => (
              <button key={k} className={mapFilter === k ? 'active' : ''} onClick={() => chooseCategory(k)}>{label}</button>
            ))}
          </div>
          {mapMode === 'trend' ? (
            <p className="legend-line">
              <i className="sw rise" /> rising <i className="sw fall" /> falling <i className="sw flat" /> no clear trend
              &nbsp;for <strong>{variable.name}</strong>. Deeper colour means a clearer trend. Click a box to open it.
            </p>
          ) : (
            <p className="legend-line"><i className="sw land" /> land <i className="sw ocean" /> ocean</p>
          )}
          <MapPicker selectedId={regionId} onSelect={pickRegion} filter={mapFilter} mode={mapMode} trends={trends} variable={variable} />
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
              {raw && <Summary variableName={variable.name} regionName={region.name} unit={variable.unit} raw={raw} trend={trend} showPercent={variable.unit !== '°C'} />}
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
      </>)}

      <footer>
        Trends are linear (Theil-Sen slope, Mann-Kendall test). Real climate signals can be non-linear, and a trend does not prove its cause.
        Data: NASA Giovanni (MERRA-2, GPM IMERG, GLDAS, OMI). Imagery: NASA GIBS.
      </footer>
    </div>
  );
}
