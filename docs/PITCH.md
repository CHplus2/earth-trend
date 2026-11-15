# Terra Trace: pitch notes

Live app: https://earth-trend.heroch94.workers.dev/

## One-line pitch
Terra Trace lets anyone play data detective with NASA satellite records: pick a place, see whether something is really changing, and learn how sure we can be.

## 2-minute script

**Problem (15 s).** Satellites have recorded the Earth for decades, but the data sits in tables only specialists can read. Students and the public hear "pollution is falling" or "the Arctic is warming" and have no way to check it.

**Solution (15 s).** Terra Trace turns NASA data into a plain-language answer. Nine regions on land and ocean, seven NASA variables: air temperature, rainfall, ground water, NO2 pollution, sea surface temperature and air temperature at two heights.

**Demo (60 s).** Click "Watch a 1-minute demo", or do it live:
1. North China Plain, NO2. "Falling by about 2 units every 10 years, very strong evidence." The sentence is plain language, and the p-value is explained.
2. The chart. "NO2 rose until about 2012, then fell." A straight line alone would hide this, so the app finds the turning point.
3. "Is it just El Nino?" We remove El Nino swings and test again. The trend survives, so El Nino is not driving it.
4. Scan tab. Every region and variable is tested at once. 19 of 33 combinations are significant, 18 survive a correction for running many tests.
5. Contrast: Amazon ground water falling, India air temperature not significant. "Not significant" is a result too.

**Why it is trustworthy (15 s).** Seasonal cycle removed. Theil-Sen slope and Mann-Kendall test, adjusted for neighbouring months being alike. Multiple-test correction. We say "consistent with", never "caused by".

**Close (15 s).** Static site, no backend, runs on a phone, has a guided tour, read-aloud and keyboard access. Add more NASA regions by dropping in a CSV.

## Impact statement
Audience: high school and college students, teachers and curious members of the public. Terra Trace shows how scientists decide whether a change is real, using real NASA measurements.

## Honest limitations (say these before a judge asks)
- Monthly averages over fixed boxes. Not pixel-level maps.
- Linear trends plus one exploratory turning point. Real climate signals can be non-linear.
- Records differ in length (1980 to 2026 for air temperature, 2002 to 2026 for sea surface temperature).
- Data is bundled, not live.
- Trends are consistent with causes, not proof of them.
- "Help me choose" is rule-based, not an AI model.

## Likely judge questions
- *Why not live data?* Giovanni requests are slow and need login. Static files make the demo reliable. Reproduction steps are on the How it works tab.
- *How is this different from Giovanni?* Giovanni plots data. We answer "is the change real, and how sure are we", with tests, El Nino check and scan.
- *Is the El Nino check causal?* No. It shows whether El Nino swings explain the trend.
