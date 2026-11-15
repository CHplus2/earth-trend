# Earth System Trend Detective

React + Vite app. No backend: statistics run in the browser, data are static CSVs. Deploys to Cloudflare Pages.

## Run

    npm install
    npm run dev        # local
    npm test           # sanity check of the statistics
    npm run build      # output in dist/

## Replace placeholder data with real NASA data

`public/data` currently holds **synthetic** series (made by `npm run gen-sample`) so the app works immediately. The UI shows a warning banner while `public/data/manifest.json` has `"synthetic": true`.

For each variable x region (4 x 6 = 24 files):

1. Open Giovanni and choose **Time Series, Area-Averaged**.
2. Select the monthly product listed in `src/lib/catalog.ts` (`giovanni` field). Filter Temporal Resolution to monthly.
3. Enter the region's bounding box. `bbox` in catalog.ts is south, west, north, east. Giovanni wants west, south, east, north.
4. Choose the full date range, click Plot Data, then download the CSV.
5. Save as `public/data/<variableId>__<regionId>.csv`, e.g. `no2__china.csv`. The parser ignores Giovanni's metadata header lines.
6. Fix units: MERRA-2 temperature is in K, so subtract 273.15 (or change the catalog unit to K). GLDAS and GPM rates may be in kg m-2 s-1; multiply by 86400 for mm/day. NO2 is in molecules/cm2; divide by 1e15.
7. Set `"synthetic": false` in `public/data/manifest.json`.

If a product has no monthly version (OMI NO2 may only be daily), download daily and average to monthly first.

Variable ids: `t2m`, `precip`, `tws`, `no2`. Region ids: `amazon`, `iberia`, `california`, `india`, `china`, `useast`.

The demo texts in `src/lib/catalog.ts` describe expected stories. Check them against your real results and edit them.

## Deploy to Cloudflare Pages

Build command `npm run build`, output directory `dist`.

## Method

Monthly values, optional removal of the mean seasonal cycle, Theil-Sen slope, Mann-Kendall test (tie-corrected, variance widened when lag-1 autocorrelation is positive), and an OLS slope with 95% CI.
