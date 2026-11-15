import type { CorrelationResult, TrendResult } from '../lib/stats';

interface Props {
  nameA: string;
  nameB: string;
  trendA: TrendResult;
  trendB: TrendResult;
  corr: CorrelationResult | null;
}

function strength(r: number): string {
  const a = Math.abs(r);
  return a < 0.2 ? 'little' : a < 0.4 ? 'a weak' : a < 0.6 ? 'a moderate' : 'a strong';
}

const dirWord = (t: TrendResult) =>
  !t.significant ? 'no significant trend' : t.direction === 'increasing' ? 'rising' : 'falling';

export default function CompareCard({ nameA, nameB, trendA, trendB, corr }: Props) {
  const sameDir = trendA.significant && trendB.significant && trendA.direction === trendB.direction;
  const oppDir = trendA.significant && trendB.significant && trendA.direction !== trendB.direction;
  return (
    <div className="card">
      <h3>Are they connected?</h3>
      <table>
        <tbody>
          <tr><td>{nameA}</td><td>{dirWord(trendA)}</td></tr>
          <tr><td>{nameB}</td><td>{dirWord(trendB)}</td></tr>
        </tbody>
      </table>
      {sameDir && <p>Both have a significant trend in the <strong>same direction</strong>.</p>}
      {oppDir && <p>Both have a significant trend, in <strong>opposite directions</strong>.</p>}
      {!sameDir && !oppDir && <p>At least one of them has no significant trend over this period.</p>}

      {corr ? (
        <>
          <p className={corr.pDetrended < 0.05 ? 'verdict yes' : 'verdict no'}>
            Month-to-month link: {strength(corr.rDetrended)} {corr.rDetrended >= 0 ? 'positive' : 'negative'} relationship
            (r = {corr.rDetrended.toFixed(2)}, p {corr.pDetrended < 0.001 ? '< 0.001' : '= ' + corr.pDetrended.toFixed(3)}).
          </p>
          <p>
            {corr.pDetrended < 0.05
              ? corr.rDetrended >= 0
                ? `When ${nameA} is above its trend, ${nameB} tends to be above its trend too.`
                : `When ${nameA} is above its trend, ${nameB} tends to be below its trend.`
              : 'No reliable month-to-month link was found.'}
          </p>
          <table>
            <tbody>
              <tr><td>Months compared</td><td>{corr.n}</td></tr>
              <tr><td>Effective independent months</td><td>{corr.nEff.toFixed(0)}</td></tr>
              <tr><td>r with trends left in</td><td>{corr.rRaw.toFixed(2)}</td></tr>
            </tbody>
          </table>
          <p className="note">
            The headline r is calculated after removing each variable's own long-term trend. Two variables that both trend will
            correlate strongly even if unrelated, so the "trends left in" number is shown only for comparison.
          </p>
        </>
      ) : (
        <p className="note">Fewer than 24 months overlap, so no correlation is reported.</p>
      )}
      <p className="note">
        A relationship here is consistent with a connection but does not prove one variable causes the other. A third factor
        (such as policy, weather patterns or land use) could drive both.
      </p>
    </div>
  );
}
