import { REGIONS, VARIABLES } from '../lib/catalog';

export default function Method() {
  return (
    <section className="method">
      <h2>How this tool works</h2>

      <h3>The question</h3>
      <p>
        Is a measured part of the Earth system changing in a steady direction, where, by how much, and is that change bigger than
        chance would produce? The tool answers this for {VARIABLES.length} NASA variables in {REGIONS.length} regions on land and
        ocean, and for the atmosphere at two heights.
      </p>

      <h3>Steps</h3>
      <ol>
        <li><strong>Get monthly values.</strong> Each series is the average over a region's box, downloaded from NASA Giovanni. Daily files are averaged to months, and months with fewer than 20 days of data are dropped.</li>
        <li><strong>Remove the seasonal cycle</strong> (optional, on by default). For each calendar month, the long-term average of that month is subtracted. What is left is "higher or lower than usual for this time of year", which makes slow change visible.</li>
        <li><strong>Fit a trend.</strong> The slope is the <em>Theil-Sen</em> estimate: the median of the slopes between every pair of months. It is not thrown off by a few unusual months. An ordinary least-squares (OLS) line with its 95% range is shown as a cross-check. The two can disagree, especially when there is no real trend (one slightly up, one slightly down). The tool explains this whenever it happens, and the headline always uses Theil-Sen and Mann-Kendall.</li>
        <li><strong>Test it.</strong> The <em>Mann-Kendall</em> test asks how often later months are higher than earlier ones, compared with what random order would give. Neighbouring months resemble each other, which makes a trend look more certain than it is, so when that similarity is positive the test is made more cautious. The result is a p-value: below 0.05, a trend this strong would appear by luck less than 1 time in 20.</li>
        <li><strong>Compare two variables.</strong> Each series has its own trend removed first, then the correlation of the remainder is calculated. Two variables that both drift will look related even if they are not, so this checks whether they rise and fall together from month to month.</li>
        <li><strong>Check for other explanations.</strong> To see whether a trend is just El Niño, the El Niño index (sea surface temperature in the Niño 3.4 box, with its own warming trend removed) is fitted alongside time at lags of 0 to 6 months. Its fitted part is subtracted and the trend is tested again over the same months. A separate search finds the single date that best splits the record into two straight lines (each at least 7 years). A turning point is reported only when both parts are significant and point in opposite directions. Because the best date is picked from the data, this is exploratory.</li>
        <li><strong>Scan everything.</strong> Running many tests means a few pass by luck. The scanner reports how many significant trends survive a standard correction (Benjamini-Hochberg, 5%).</li>
      </ol>

      <h3>Data used</h3>
      <div className="tablewrap">
        <table className="scan">
          <thead>
            <tr><th>Variable</th><th>NASA product and processing</th><th>Record</th></tr>
          </thead>
          <tbody>
            {VARIABLES.map((v) => (
              <tr key={v.id}>
                <td>{v.name} ({v.unit})</td>
                <td>{v.giovanni}</td>
                <td>{v.years}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Regions</h3>
      <div className="tablewrap">
        <table className="scan">
          <thead>
            <tr><th>Region</th><th>Type</th><th>Box (south, west, north, east)</th></tr>
          </thead>
          <tbody>
            {REGIONS.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.bbox.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Limits to keep in mind</h3>
      <ul>
        <li>Only straight-line trends are tested. Real changes can bend, as with NO2 over China, which rose and then fell.</li>
        <li>A trend shows <em>what</em> changed, not <em>why</em>. A link between two variables is "consistent with" a connection and does not prove one causes the other.</li>
        <li>Record lengths differ (about 24 to 46 years). A short record can miss a real trend, and a longer one might make an unclear result clear.</li>
        <li>Each value averages a rectangular box. Boxes can include sea, neighbouring land or both, and values average many places with different trends.</li>
        <li>Terrestrial water storage comes from a land-surface model (GLDAS), and air temperature, rainfall and atmosphere levels come from a mix of satellite and reanalysis products. They are not all direct measurements.</li>
        <li>The p-value for the ordinary least-squares line is approximate and not adjusted for similar neighbouring months. The Mann-Kendall result is the one to rely on.</li>
      </ul>
    </section>
  );
}
