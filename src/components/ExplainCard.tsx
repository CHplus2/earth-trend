import type { EnsoResult, TurningPoint } from '../lib/explain';

interface Props {
  unit: string;
  variableName: string;
  enso: EnsoResult | null;
  /** True when the region is the El Nino box itself, so the adjustment does not apply */
  isNinoBox: boolean;
  turning: TurningPoint | null;
}

const fmt = (v: number) => {
  const a = Math.abs(v);
  return (v < 0 ? '-' : '+') + (a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 1 ? a.toFixed(2) : a.toFixed(3));
};

function ensoSentence(e: EnsoResult): string {
  switch (e.verdict) {
    case 'unchanged':
      return 'The trend is about the same, so El Niño is not what is driving it.';
    case 'weakened':
      return 'The trend gets weaker, so part of it was due to El Niño and La Niña swings.';
    case 'strengthened':
      return 'The trend gets stronger once El Niño swings are taken out.';
    case 'lost':
      return 'The trend is no longer significant, so it may have been caused by El Niño and La Niña swings in this period.';
    case 'gained':
      return 'A significant trend appears once El Niño swings are taken out; they were hiding it.';
  }
}

export default function ExplainCard({ unit, variableName, enso, isNinoBox, turning }: Props) {
  const startYear = enso?.adjusted[0]?.date.slice(0, 4);
  return (
    <div className="card">
      <h4>Is it just El Niño?</h4>
      {isNinoBox ? (
        <p className="muted">This box is the El Niño index itself, so the adjustment does not apply here.</p>
      ) : !enso ? (
        <p className="muted">Not enough overlap with the El Niño record to test this.</p>
      ) : (
        <>
          <p>
            El Niño and La Niña (warm and cool swings in the tropical Pacific) change weather worldwide. We removed their
            effect from {variableName} (best fit: Pacific leads by {enso.lagMonths} month{enso.lagMonths === 1 ? '' : 's'};
            it explains {Math.round(enso.varianceShare * 100)}% of the month-to-month variation) and tested again.
          </p>
          <table>
            <tbody>
              <tr><td>Trend since {startYear}, before</td><td>{fmt(enso.before.sensSlopePerDecade)} {unit}/decade {enso.before.significant ? '(significant)' : '(not significant)'}</td></tr>
              <tr><td>Trend since {startYear}, El Niño removed</td><td>{fmt(enso.after.sensSlopePerDecade)} {unit}/decade {enso.after.significant ? '(significant)' : '(not significant)'}</td></tr>
            </tbody>
          </table>
          <p><strong>{ensoSentence(enso)}</strong> This check covers only the months where both records exist (since {startYear}).</p>
        </>
      )}

      <h4>Did the trend change direction?</h4>
      {!turning ? (
        <p className="muted">The record is too short to look for a turning point (we need at least 7 years on each side).</p>
      ) : turning.reversal ? (
        <p>
          <strong>Yes, around {turning.year}.</strong> Before that it was {turning.first.direction} ({fmt(turning.first.sensSlopePerDecade)} {unit}/decade).
          After it, the trend was {turning.second.direction} ({fmt(turning.second.sensSlopePerDecade)} {unit}/decade). Both parts are significant, so one straight
          line would hide this change. This is an exploratory finding, because the best split date is chosen from the data.
        </p>
      ) : (
        <p>No clear change of direction found: no split of the record gives two significant trends pointing opposite ways.</p>
      )}

      <p className="muted">These checks show what a trend is <em>consistent with</em>. They do not prove a cause.</p>
    </div>
  );
}
