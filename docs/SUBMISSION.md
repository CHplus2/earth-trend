# Terra Trace: submission kit

Based on the 2026 Project Submission Guide. There is no live pitch. Judges read the project page, watch or read the demo, and open the live app.

**Deadline:** Sunday, November 15, 11:59 p.m., local time of your Local Event (Universal Event: local time of the Team Owner). Click **Submit for Judging** before then. Saved but unsubmitted work is not judged. You can resubmit until the deadline, and only the last version counts.

## Checklist

- [ ] Demo made: a video of 30 seconds or less, or a slide deck of at most 7 slides. Over the limit means not eligible for global judging.
- [ ] Demo uploaded to YouTube, Google Drive, OneDrive or similar, set to public, and tested in a private browser window.
- [ ] Everything in English. A video may be spoken in another language only with English subtitles.
- [ ] No images, video or audio of anyone under 18.
- [ ] Project page: all required fields filled in (text below).
- [ ] "Link to Final Project": https://earth-trend.heroch94.workers.dev/ (open it in a private window first).
- [ ] Optional but recommended: request a FortiGuard Web Filter Classification for the site, so judges' networks do not block it. Category: "web-based application" or "education". Company name: N/A.
- [ ] All team members confirmed at the same Local Event.
- [ ] Tick "Terms and Conditions" and "Confirm All Work is Original", then **Submit for Judging**.

## Project page text (paste and edit)

**Project name:** Terra Trace: Earth System Trend Detective

**High-level project summary:**
Terra Trace lets anyone investigate whether part of the Earth system is really changing. Pick a place and a NASA satellite measurement, and the app tells you the direction and size of the change, how sure we can be, and whether something like El Niño could explain it. It covers land, ocean and the atmosphere with real NASA data.

**Link to project demo:** (your public video or slide link)

**Link to final project:** https://earth-trend.heroch94.workers.dev/

**Detailed project description:**
The challenge asks us to become Earth system trend detectives: find variables of interest, decide whether they show a trend, and whether that trend is significant. Terra Trace is a web app built for students and curious members of the public.

How it works. Users choose one of nine regions (six on land, three over the ocean) on a NASA GIBS map, then one of seven NASA measurements: near-surface air temperature, precipitation, terrestrial water storage, tropospheric NO2, sea surface temperature, and air temperature at two heights. The app opens a "case file" that leads with the answer: a verdict stamp (significant rise, significant fall or inconclusive), the trend per decade, and a confidence level, followed by a plain-language summary and a chart. Every variable has a simple definition.

How we decide a trend is real. We remove the seasonal cycle, estimate the slope with the Theil-Sen method, and test it with the Mann-Kendall test, adjusted for the fact that neighbouring months are alike. An ordinary least-squares line is shown as a cross-check, and the app explains when the two disagree. A Scanner tests all 33 region and variable combinations at once and applies a false-discovery correction: 19 are significant and 18 still hold after the correction. We also check whether the Niño 3.4 El Niño signal explains a trend, and we search for a turning point, because some changes bend. For example, NO2 over the North China Plain rose until about 2012 and then fell, by about 2.1 ×10¹⁵ molecules/cm² per decade overall (very strong evidence, and it is not explained by El Niño).

Helping new users. A one-minute guided demo, a "Help me choose" flow that asks two questions and opens a matching case, six sourced examples, a keyboard-friendly Place menu, and a read-aloud option.

Honest limits. We test straight-line trends over monthly regional averages, and we say what a trend is "consistent with", never that it proves a cause. The data are bundled files, not live feeds, so the demo is reliable.

Benefit. People can check claims such as "pollution is falling" or "the Arctic is warming" against NASA records and learn how scientists decide whether a change is real.

Tools: React, TypeScript, Vite, Leaflet, Recharts; hosted on Cloudflare. Statistics run in the browser.

**Use of Super Intelligence (SI):** (edit to match what your team actually did)
An AI coding assistant (Kiro) helped our team write the code, the statistical routines and the interface text, and helped us review the design. Our team chose the challenge, the NASA datasets and regions, downloaded the data from Giovanni, and checked the results. Every number in the app is computed from the NASA data files by standard, published statistical methods, and the example texts quote those computed results and cite published studies. The app does not use AI at run time: the "Help me choose" flow follows fixed rules.

**NASA data:**
All data came from NASA Giovanni (GES DISC), monthly or daily area averages over our region boxes:
- MERRA-2 monthly single-level diagnostics (M2TMNXSLV): near-surface air temperature, 1980 to 2026
- GPM IMERG Final Run monthly (GPM_3IMERGM v07): precipitation
- GLDAS Catchment Land Surface Model DA1 v2.2: terrestrial water storage
- Aura OMI NO2 (OMNO2d v004): tropospheric NO2 column
- MODIS-Aqua L3 monthly 9 km: sea surface temperature
- AIRS monthly (AIRS3STM v7.0): air temperature at 850 and 300 hPa
- NASA GIBS Blue Marble imagery for the map.

**Space agency partner data and other references:**
No partner-agency data were used. References:
- Scientific Reports (2016), satellite NO2 and China's NOx goals: https://www.nature.com/articles/srep35912
- Remote Sensing (2023), NO2, SO2 and AOD trends over South and East Asia: https://www.mdpi.com/2072-4292/15/20/5069
- Methods: Theil-Sen estimator, Mann-Kendall test, Benjamini-Hochberg procedure.
- Source code: https://github.com/CHplus2/earth-trend

## 30-second video script (about 70 words)

Show the live app the whole time. Keep the pace steady and the text on screen readable.

| Time | Say | Show |
|---|---|---|
| 0:00 | "Hi, I'm [name] from team [team name]." | Title card or you on camera (adults only) |
| 0:03 | "Our challenge: be an Earth system trend detective." | Challenge name |
| 0:06 | "Meet Terra Trace: find what's really changing on Earth, and how sure we are." | App header |
| 0:10 | "Pick a place and a NASA measurement. Here, NO2 over China: a significant fall, very strong evidence, turned around in 2012." | Case file with SIGNIFICANT FALL stamp, then the chart |
| 0:20 | "It tests the trend, checks El Niño, and scans every combination of NASA data." | Evidence panel, then the Discover table |
| 0:26 | "Anyone can check claims about our planet. Terra Trace." | Map, then the web address |

## 7-slide deck outline (if you choose slides)

Large text, few words, strong visuals.

1. **Title and team.** Terra Trace, tagline, team name, team member names, challenge name.
2. **The problem.** Satellite data is hard to read. People hear "it's changing" but can't check. Image: the map.
3. **The solution.** Screenshot of the case file (stamp, trend, confidence). One line: "Verdict first, evidence on demand."
4. **How we know.** Seasonal cycle removed, Theil-Sen and Mann-Kendall, El Niño check, turning point, scan with correction. One simple diagram.
5. **A real discovery.** NO2 over the North China Plain: rose, peaked about 2012, then fell. Chart screenshot.
6. **NASA data.** The six products and the 9 regions. Show how NASA data makes it possible.
7. **Impact and future.** Students, teachers and the public can test claims. Next: more regions, live data, more languages. Live link and QR code.

## Before you submit

- Open the live site in a private window on a laptop and a phone.
- Make sure the demo link works without logging in.
- Replace the placeholders: team name, member names, demo link.
