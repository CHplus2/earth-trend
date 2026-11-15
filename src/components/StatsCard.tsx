import type { TrendResult } from '../lib/stats';

interface Props {
  trend: TrendResult;
  unit: string;
}

const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(1) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3));
const fmtP = (p: number) => (p < 0.001 ? '< 0.001' : p.toFixed(3));

export default function StatsCard({ trend, unit }: Props) {
  const verb = trend.direction === 'increasing' ? 'rising' : trend.direction === 'decreasing' ? 'falling' : 'flat';
  return (
    <div className="card">
      <h3>What the data says</h3>
      <p className={trend.significant ? 'verdict yes' : 'verdict no'}>
        {trend.significant ? 'Significant trend: ' : 'Not significant: '}
        {verb} by {fmt(Math.abs(trend.sensSlopePerDecade))} {unit} per decade
      </p>
      <p>
        {trend.significant
          ? 'The chance of seeing a trend this strong from random variation alone is below 5%.'
          : 'This could still be random variation. A longer record might make it significant.'}
      </p>
      <table>
        <tbody>
          <tr><td>Months analysed</td><td>{trend.n}</td></tr>
          <tr><td>Total change (Sen)</td><td>{fmt(trend.totalChange)} {unit}</td></tr>
          <tr><td>Mann-Kendall p-value</td><td>{fmtP(trend.mkPValue)}</td></tr>
          <tr>
            <td>OLS slope (95% CI)</td>
            <td>
              {fmt(trend.olsSlopePerYear * 10)} ({fmt(trend.olsCI95PerYear[0] * 10)} to {fmt(trend.olsCI95PerYear[1] * 10)}) {unit}/decade
            </td>
          </tr>
          <tr><td>OLS t-test p-value</td><td>{fmtP(trend.olsPValue)}</td></tr>
          <tr><td>Lag-1 autocorrelation</td><td>{trend.lag1.toFixed(2)}</td></tr>
        </tbody>
      </table>
      {trend.autocorrAdjusted && (
        <p className="note">
          Month-to-month values are correlated, so the Mann-Kendall variance was widened to avoid overstating significance. The OLS p-value is not adjusted and is likely too optimistic.
        </p>
      )}
    </div>
  );
}
