import { useEffect, useMemo, useState } from 'react';
import MapPicker from './components/MapPicker';
import TrendChart from './components/TrendChart';
import StatsCard from './components/StatsCard';
import CompareChart from './components/CompareChart';
import CompareCard from './components/CompareCard';
import Summary from './components/Summary';
import Tour from './components/Tour';
import CaseFile from './components/CaseFile';
import Guide from './components/Guide';
import ReadAloud from './components/ReadAloud';
import ExplainCard from './components/ExplainCard';
import { adjustForEnso, findTurningPoint } from './lib/explain';
import Scanner from './components/Scanner';
import Method from './components/Method';
import { computeRegionTrends } from './lib/regionTrends';
import type { RegionTrend } from './lib/regionTrends';
import { DEMOS, REGIONS, TEMPERATURE_EVERYWHERE, VARIABLES } from './lib/catalog';
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
  const [tour, setTour] = useState(false);
  const [panel, setPanel] = useState<'guide' | 'cases' | null>(null);
  const [view, setView] = useState<'explore' | 'scan' | 'method'>('explore');
  const [trends, setTrends] = useState<Record<string, RegionTrend> | null>(null);
  const [mapLayer, setMapLayer] = useState<'variable' | 'temperature'>('temperature');
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
    if (mapLayer === 'temperature') {
      const t2m = VARIABLES.find((v) => v.id === 't2m')!;
      const sst = VARIABLES.find((v) => v.id === 'sst')!;
      Promise.all([computeRegionTrends(t2m), computeRegionTrends(sst)]).then(
        ([a, b]) => !cancelled && setTrends({ ...a, ...b }),
      );
    } else {
      computeRegionTrends(variable).then((t) => !cancelled && setTrends(t));
    }
    return () => {
      cancelled = true;
    };
  }, [variable, mapLayer]);

  const mapVariable = mapLayer === 'temperature' ? TEMPERATURE_EVERYWHERE : variable;

  function selectFromMap(id: string) {
    pickRegion(id);
    if (mapLayer === 'temperature') {
      const r = REGIONS.find((x) => x.id === id)!;
      setVariableId(r.type === 'land' ? 't2m' : 'sst');
    }
  }

  const series = useMemo(() => (raw ? (removeSeason ? deseasonalize(raw) : raw) : null), [raw, removeSeason]);
  const trend = useMemo(() => (series ? analyzeTrend(series) : null), [series]);

  // El Nino index: sea surface temperature in the Nino 3.4 box.
  const [nino, setNino] = useState<Point[] | null>(null);
  useEffect(() => {
    const sst = VARIABLES.find((v) => v.id === 'sst')!;
    loadVariableSeries(sst, 'nino34').then(setNino).catch(() => setNino(null));
  }, []);
  const anomalies = useMemo(() => (raw ? deseasonalize(raw) : null), [raw]);
  const enso = useMemo(() => (anomalies && nino && regionId !== 'nino34' ? adjustForEnso(anomalies, nino) : null), [anomalies, nino, regionId]);
  const turning = useMemo(() => (anomalies ? findTurningPoint(anomalies) : null), [anomalies]);

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
    // "All" shows temperature for every region; Land / Ocean colour by the selected variable.
    setMapLayer(k === 'all' ? 'temperature' : 'variable');
    // The trend colours depend on the variable, so move to a region and variable of this kind.
    if (k !== 'all' && region.type !== k) {
      const first = REGIONS.find((r) => r.type === k);
      if (first) pickRegion(first.id);
    }
  }

  function variableOptions(exclude?: string) {
    const groups: Array<['atmosphere' | 'land' | 'ocean', string]> = [
      ['atmosphere', 'Air and weather'],
      ['land', 'Ground and water'],
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

  function setupTour() {
    setView('explore');
    setRegionId('china');
    setVariableId('no2');
    setCompareId('');
    setDemo(null);
    setRemoveSeason(true);
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
      <a className="skip" href="#main">Skip to results</a>
      <header className="brand">
        <div>
          <p className="kicker">EARTH SYSTEM INTELLIGENCE</p>
          <h1>Terra Trace</h1>
          <p className="tagline">
            Earth System Trend Detective. Find what is really changing on Earth, where, by how much, and how sure we are.
          </p>
        </div>
        <span className="status"><i aria-hidden="true" /> OBSERVATORY ONLINE</span>
      </header>

      {synthetic && (
        <div className="banner">
          Placeholder data: these series are synthetic, not NASA measurements. Replace the files in public/data with Giovanni downloads (see README).
        </div>
      )}

      <nav className="mission" aria-label="Mission stages">
        {([
          ['explore', '1', 'Explore', 'Pick a place'],
          ['scan', '2', 'Discover', 'Scan every trend'],
          ['method', '3', 'Understand', 'How we know'],
        ] as const).map(([k, n, name, sub]) => (
          <button key={k} className={view === k ? 'active' : ''} aria-current={view === k ? 'page' : undefined} onClick={() => setView(k)}>
            <span className="num" aria-hidden="true">{n}</span>
            <span className="txt"><strong>{name}</strong><small>{sub}</small></span>
          </button>
        ))}
      </nav>

      {view === 'scan' && <Scanner onOpen={openFromScanner} />}
      {view === 'method' && <Method />}

      {view === 'explore' && (<>
      <div className="starters" role="group" aria-label="Ways to start">
        <button className="starter" onClick={() => { setPanel(null); setTour(true); }}>
          <span className="ico" aria-hidden="true">▶</span>
          <span><strong>Watch the demo</strong><small>1-minute guided case</small></span>
        </button>
        <button className="starter" aria-expanded={panel === 'guide'} onClick={() => setPanel(panel === 'guide' ? null : 'guide')}>
          <span className="ico" aria-hidden="true">?</span>
          <span><strong>Help me choose</strong><small>Two quick questions</small></span>
        </button>
        <button className="starter" aria-expanded={panel === 'cases'} onClick={() => setPanel(panel === 'cases' ? null : 'cases')}>
          <span className="ico" aria-hidden="true">#</span>
          <span><strong>Case library</strong><small>{DEMOS.length} real examples</small></span>
        </button>
      </div>
      {tour && <Tour onClose={() => setTour(false)} onSetup={setupTour} />}

      {panel === 'guide' && <Guide onOpen={(r, v) => { openFromScanner(r, v); setPanel(null); }} />}

      {panel === 'cases' && (
      <section className="demos" aria-label="Case library">
        <div className="demo-buttons">
          {DEMOS.map((d, i) => (
            <button key={d.title} className={demo === i ? 'active' : ''} aria-pressed={demo === i} onClick={() => startDemo(i)}>
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
      )}

      <CaseFile variable={variable} region={region} trend={trend} enso={enso} turning={turning} loading={!series && !error} />

      <main id="main">
        <div className="left" data-tour="map">
          <div className="chips">
            <span>Map shows:</span>
            {([['all', 'All (temperature)'], ['land', 'Land'], ['ocean', 'Ocean']] as const).map(([k, label]) => (
              <button key={k} aria-pressed={mapFilter === k} className={mapFilter === k ? 'active' : ''} onClick={() => chooseCategory(k)}>{label}</button>
            ))}
          </div>
          <p className="legend-line">
            <span><i className="sw rise" /> rising</span>
            <span><i className="sw fall" /> falling</span>
            <span><i className="sw flat" /> no clear trend</span>
            <span><i className="sw none" /> no data</span>
          </p>
          <p className="legend-note">
            {mapLayer === 'temperature' ? (
              <>Colours show the <strong>temperature</strong> trend: air temperature over land (1980 to 2026) and sea surface temperature over ocean (2002 to 2026). The records differ in length, so compare with care.</>
            ) : (
              <>Colours show the trend of <strong>{variable.name}</strong> ({mapFilter} regions only; it is the variable chosen in the menu). Dashed circles mean this variable has no data there; choose "All" to colour every region by temperature.</>
            )}{' '}
            Deeper colour means a clearer trend. Click a dot to open that region.
          </p>
          <div role="region" aria-label="Map of regions. Keyboard and screen reader users can choose a place with the Place menu instead."><MapPicker selectedId={regionId} onSelect={selectFromMap} filter={mapFilter} trends={trends} variable={mapVariable} /></div>
          <p className="blurb"><strong>{region.name}:</strong> {region.blurb}</p>
        </div>

        <div className="right">
          <div className="controls" data-tour="controls">
            <label className="wide">
              Place
              <select value={regionId} onChange={(e) => pickRegion(e.target.value)}>
                <optgroup label="Land">
                  {REGIONS.filter((r) => r.type === 'land').map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </optgroup>
                <optgroup label="Ocean">
                  {REGIONS.filter((r) => r.type === 'ocean').map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </optgroup>
              </select>
            </label>
            <label>
              Variable
              <select value={variableId} onChange={(e) => { setVariableId(e.target.value); setDemo(null); }}>
                {variableOptions()}
              </select>
            </label>
            <label>
              Compare with
              <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
                <option value="">No comparison</option>
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
              {raw && <ReadAloud selector=".summary" />}
              {raw && <div data-tour="summary"><Summary variableName={variable.name} regionName={region.name} unit={variable.unit} raw={raw} trend={trend} showPercent={variable.unit !== '°C'} /></div>}
              <div data-tour="chart"><TrendChart points={series} trend={trend} unit={variable.unit} anomalies={removeSeason} /></div>
              <details className="evidence" data-tour="stats"><summary>Show the statistics</summary><StatsCard trend={trend} unit={variable.unit} /></details>
              <details className="evidence" data-tour="explain"><summary>Is something else behind it? (El Niño, turning point)</summary><ExplainCard unit={variable.unit} variableName={variable.name} enso={enso} isNinoBox={regionId === 'nino34'} turning={turning} /></details>
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
