# Terra Trace: notes for judges

There is no live pitch. See `SUBMISSION.md` for the project page text, the 30-second video script and the slide outline.

Live app: https://earth-trend.heroch94.workers.dev/

## One-line pitch
Terra Trace lets anyone play data detective with NASA satellite records: pick a place, see whether something is really changing, and learn how sure we can be.

## Impact statement
Audience: high school and college students, teachers and curious members of the public. Terra Trace shows how scientists decide whether a change is real, using real NASA measurements.

## Honest limitations (say these before a judge asks)
- Monthly averages over fixed boxes. Not pixel-level maps.
- Linear trends plus one exploratory turning point. Real climate signals can be non-linear.
- Records differ in length (1980 to 2026 for air temperature, 2002 to 2026 for sea surface temperature).
- Data is bundled, not live.
- Trends are consistent with causes, not proof of them.
- "Help me choose" is rule-based, not an AI model.
- Read-aloud uses the visitor's own device voices, so quality varies.
- Theil-Sen and OLS can disagree when there is no real trend. The app explains this next to the statistics.

## Likely judge questions
- *Why not live data?* Giovanni requests are slow and need login. Static files make the demo reliable. Reproduction steps are on the Understand page.
- *How is this different from Giovanni?* Giovanni plots data. We answer "is the change real, and how sure are we", with tests, El Nino check and scan.
- *Is the El Nino check causal?* No. It shows whether El Nino swings explain the trend.
