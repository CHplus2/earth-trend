import type { Region, Variable } from '../lib/catalog';
import type { TrendResult } from '../lib/stats';
import type { EnsoResult, TurningPoint } from '../lib/explain';

interface Props {
  variable: Variable;
  region: Region;
  trend: TrendResult | null;
  enso: EnsoResult | null;
  turning: TurningPoint | null;
  loading: boolean;
}

const fmt = (v: number) => {
  const a = Math.abs(v);
  const s = a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 0.1 ? a.toFixed(2) : a.toFixed(3);
  return (v < 0 ? '-' : '+') + s;
};

function confidence(p: number): string {
  if (p < 0.01) return 'Very strong evidence';
  if (p < 0.05) return 'Strong evidence';
  if (p < 0.1) return 'Weak hint only';
  return 'No clear evidence';
}

/** Lead panel: the verdict first, in big type, before any statistics. */
export default function CaseFile({ variable, region, trend, enso, turning, loading }: Props) {
  let stamp = 'SCANNING';
  let tone = 'wait';
  if (trend) {
    if (!trend.significant) {
      stamp = 'INCONCLUSIVE';
      tone = 'flat';
    } else if (trend.direction === 'increasing') {
      stamp = 'SIGNIFICANT RISE';
      tone = 'up';
    } else {
      stamp = 'SIGNIFICANT FALL';
      tone = 'down';
    }
  }
  // Re-trigger the scan animation whenever the case changes.
  const key = `${region.id}-${variable.id}`;

  return (
    <section className={`casefile tone-${tone}`} key={key} aria-labelledby="case-title" data-tour="case">
      <div className="scanline" aria-hidden="true" />
      <div className="case-top">
        <span className="tag">ACTIVE INVESTIGATION</span>
        <span className="tag dim">FILE {variable.id.toUpperCase()} / {region.id.toUpperCase()} · NASA {variable.years}</span>
      </div>
      <div className="case-body">
        <div className="case-title">
          <h2 id="case-title">{variable.name}</h2>
          <p>{region.name}</p>
      {trend && (
            <ul className="badges" aria-label="Extra findings">
              {turning?.reversal && <li className="badge hot">Turned around in {turning.year}</li>}
              {enso && (enso.verdict === 'unchanged' || enso.verdict === 'strengthened') && trend.significant && (
                <li className="badge ok">Not explained by El Niño</li>
              )}
              {enso && (enso.verdict === 'lost' || enso.verdict === 'weakened') && <li className="badge warn">Partly El Niño</li>}
              {Math.sign(trend.olsSlopePerYear) !== Math.sign(trend.sensSlopePerYear) && (
                <li className="badge warn">Slope methods disagree: see statistics</li>
              )}
              {trend.n / 12 < 15 && <li className="badge warn">Short record ({Math.round(trend.n / 12)} years)</li>}
            </ul>
          )}
        </div>
        <div className="case-verdict" aria-live="polite">
          <span className="stamp">{loading || !trend ? 'SCANNING…' : stamp}</span>
        </div>
        <dl className="readouts">
          <div className="readout">
            <dt>Trend per decade</dt>
            <dd>{trend ? <>{fmt(trend.sensSlopePerDecade)} <small>{variable.unit}</small></> : '…'}</dd>
          </div>
          <div className="readout">
            <dt>Confidence</dt>
            <dd>
              {trend ? (
                <>
                  <span className="conf">{confidence(trend.mkPValue)}</span>
                  <small>{trend.mkPValue < 0.001 ? 'p < 0.001' : 'p = ' + trend.mkPValue.toFixed(3)}</small>
                </>
              ) : '…'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
