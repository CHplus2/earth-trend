import type { Point, TrendResult } from '../lib/stats';

interface Props {
  variableName: string;
  regionName: string;
  unit: string;
  raw: Point[];
  trend: TrendResult;
}

const fmt = (v: number) => {
  const a = Math.abs(v);
  return a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 1 ? a.toFixed(2) : a.toFixed(3);
};

function confidence(p: number): { label: string; cls: string } {
  if (p < 0.01) return { label: 'Very strong evidence', cls: 'yes' };
  if (p < 0.05) return { label: 'Strong evidence', cls: 'yes' };
  if (p < 0.1) return { label: 'Weak hint only', cls: 'no' };
  return { label: 'No clear evidence', cls: 'no' };
}

export default function Summary({ variableName, regionName, unit, raw, trend }: Props) {
  const first = raw[0].date.slice(0, 4);
  const last = raw[raw.length - 1].date.slice(0, 4);
  const years = Math.round(trend.n / 12);
  const mean = raw.reduce((s, p) => s + p.value, 0) / raw.length;
  const pct = mean !== 0 ? (Math.abs(trend.totalChange) / Math.abs(mean)) * 100 : null;
  const dir = trend.direction === 'increasing' ? 'rising' : trend.direction === 'decreasing' ? 'falling' : 'flat';
  const conf = confidence(trend.mkPValue);

  return (
    <div className="summary">
      <p className="headline">
        {trend.significant ? (
          <>
            <strong>{variableName}</strong> in the <strong>{regionName}</strong> is <strong>{dir}</strong>, by about{' '}
            <strong>{fmt(trend.sensSlopePerDecade)} {unit}</strong> every 10 years.
          </>
        ) : (
          <>
            For <strong>{variableName}</strong> in the <strong>{regionName}</strong>, we <strong>cannot say</strong> it is
            going up or down. The best estimate is {dir}, by about {fmt(trend.sensSlopePerDecade)} {unit} per decade, but
            that is within what chance could produce.
          </>
        )}
      </p>
      <ul>
        <li>
          <strong>How much in total:</strong> about {fmt(trend.totalChange)} {unit} between {first} and {last}
          {pct !== null && trend.significant ? ` (roughly ${pct < 1 ? '<1' : pct.toFixed(0)}% of the average level)` : ''}.
        </li>
        <li>
          <strong>How sure are we:</strong> <span className={conf.cls}>{conf.label}</span> (p = {trend.mkPValue < 0.001 ? '< 0.001' : trend.mkPValue.toFixed(3)}).
          A p-value below 0.05 means a trend this strong would show up by luck less than 1 time in 20.
        </li>
        {years < 15 && (
          <li>
            <strong>Short record:</strong> only {years} years of data. A longer record could turn an unclear result into a
            clear one, or the other way round.
          </li>
        )}
        {trend.autocorrAdjusted && trend.lag1 > 0.5 && (
          <li>
            <strong>Slow-changing data:</strong> neighbouring months are very similar, so we count fewer independent
            observations than months. The significance above already allows for this.
          </li>
        )}
      </ul>
    </div>
  );
}
