# Terra Trace

*Earth System Trend Detective*

NASA Space Apps 2026 challenge: *Be an Earth System Trend Detective.*

A web app that finds what is changing in the Earth system, where, by how much, and whether the change is statistically significant. It covers land, ocean and the atmosphere (at two heights), using NASA Giovanni data.

Built with React, TypeScript and Vite. There is no backend: the statistics run in the browser and the data are static CSV files in `public/data`.

## What it does

- **Explore a place.** Click a region on the map (NASA GIBS imagery), choose a variable, and get a monthly chart with a trend line, a plain-language summary and the statistics behind it.
- **Compare two variables** in the same region, with a correlation that ignores each variable's own long-term trend.
- **Scan everything.** Tests every region and variable that has data, ranks them, and reports how many significant trends survive a correction for running many tests.
- **Examples.** Six one-click examples written from the real results, with sources where available.
- **How it works.** An in-app page with the method, data products and limits.

## Run it

    npm install
    npm run dev       # local development, usually http://localhost:5173
    npm run build     # production build in dist/
    npm test          # sanity check of the trend statistics

## Data

Files live in `public/data` and are named `<variable>__<region>.csv`, with two underscores. The parser accepts Giovanni's own CSV download (it skips the metadata lines). Daily files are averaged to months, and months with fewer than 20 days are dropped. Fill values are ignored.

| File prefix | Variable | NASA product | Unit conversion in app |
|---|---|---|---|
| `t2m` | Near-surface air temperature | MERRA-2 M2TMNXSLV, monthly | K to °C |
| `precip` | Precipitation | GPM IMERG Final, monthly | mm/hr to mm/day |
| `tws` | Terrestrial water storage | GLDAS Catchment DA1 v2.2, daily | none (mm) |
| `no2` | Tropospheric NO2 column | OMI OMNO2d v004, daily | molecules/cm² to 1e15 |
| `sst` | Sea surface temperature | MODIS-Aqua 9 km, monthly (Day) | none (°C) |
| `air850`, `air300` | Air temperature at 850 and 300 hPa | AIRS3STM v7.0, monthly (Daytime) | K to °C |

Regions: Southern Amazon (`amazon`), Iberian Peninsula (`iberia`), California Central Valley (`california`), Indo-Gangetic Plain (`india`), North China Plain (`china`), Eastern US (`useast`), Tropical Pacific Nino 3.4 (`nino34`), North Atlantic (`natlantic`), Barents Sea (`barents`). Boxes are listed in `src/lib/catalog.ts`.

### Adding a variable or region

1. In Giovanni choose **Time Series, Area-Averaged**, enter the box as west, south, east, north, and download the CSV.
2. Save it as `public/data/<variable>__<region>.csv`.
3. For a new variable or region, add an entry in `src/lib/catalog.ts`. Use `scale` and `offset` there for unit conversion, and `regionTypes` to say whether it has land, ocean or both.

The Explore dropdowns, the scanner and the method page all read from the catalog.

## Method

1. Monthly series per region box.
2. Optional removal of the seasonal cycle (each calendar month's average subtracted).
3. Theil-Sen slope for the rate of change, with an ordinary least-squares slope and 95% range as a cross-check.
4. Mann-Kendall test (with tie correction) for significance. When neighbouring months are positively correlated, the variance is widened by (1+r)/(1-r), a simplified allowance for autocorrelation.
5. Comparison of two variables: Pearson correlation after removing each one's own trend, with an effective sample size reduced for autocorrelation.
6. Scanner: Benjamini-Hochberg false-discovery control at 5% across all combinations.

`scripts/` has small checks used during development (`stats-check.mts`, `corr-check.mts`, `data-check.mts`, `scan-check.mts`). They run with `node --experimental-strip-types scripts/<file>`.

## Limits

- Only straight-line trends are tested. Some changes bend (NO2 over China rose, then fell).
- A trend shows what changed, not why. Linked variables are "consistent with" a connection, not proof of cause.
- Record lengths differ (about 24 to 46 years).
- Boxes average many places, and some include both land and sea.
- Water storage comes from a land model, and several products are reanalyses rather than direct measurements.
- The least-squares p-value is approximate and not adjusted for autocorrelation. Rely on Mann-Kendall.
- Examples quote numbers computed from the files in `public/data`. If you replace a file, re-check the example text in `src/lib/catalog.ts`.

## Deploy to Cloudflare Pages

Connect the GitHub repository in Cloudflare Pages, then set:

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: none, or Vite

No environment variables are needed.

## Credits

Data: NASA Giovanni (GES DISC) products listed above. Imagery: NASA GIBS (Blue Marble). Map: Leaflet. Charts: Recharts.
