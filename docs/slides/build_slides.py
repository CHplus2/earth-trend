import base64, sys
TEAM = sys.argv[1] if len(sys.argv) > 1 else "[Team name]"
MEMBERS = sys.argv[2] if len(sys.argv) > 2 else "[Team member names]"
def img(n):
    return "data:image/png;base64," + base64.b64encode(open(f"img/{n}.png","rb").read()).decode()
URL = "earth-trend.heroch94.workers.dev"
css = """
@page { size: 1280px 720px; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; color: #e6eefb; }
.s { width: 1280px; height: 720px; padding: 56px 64px; background: #050a14; page-break-after: always; position: relative; overflow: hidden;
  background-image: linear-gradient(rgba(47,227,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(47,227,255,.05) 1px, transparent 1px); background-size: 40px 40px; }
.kick { font-size: 18px; letter-spacing: .22em; color: #2fe3ff; font-weight: 700; margin: 0 0 10px; }
h1 { font-size: 84px; margin: 0; line-height: 1; }
h2 { font-size: 48px; margin: 0 0 24px; line-height: 1.1; }
p, li { font-size: 28px; line-height: 1.4; margin: 0 0 14px; }
ul { margin: 0; padding-left: 28px; }
.accent { color: #ffe14d; }
.cyan { color: #2fe3ff; }
.sub { font-size: 32px; color: #a7b8d3; margin-top: 18px; }
.row { display: flex; gap: 40px; align-items: center; height: 520px; }
.col { flex: 1; }
.shot { border: 2px solid #2c4a7c; border-radius: 12px; box-shadow: 0 0 30px rgba(47,227,255,.18); }
.shot.w { width: 100%; }
.tag { display: inline-block; font-size: 22px; font-weight: 700; padding: 6px 16px; border: 2px solid #ff3d9a; color: #ff3d9a; border-radius: 999px; margin-right: 10px; }
.foot { position: absolute; bottom: 28px; left: 64px; right: 64px; font-size: 18px; color: #8396b5; display: flex; justify-content: space-between; }
.small li { font-size: 24px; margin-bottom: 8px; }
"""
def foot(n): return f'<div class="foot"><span>Terra Trace · NASA Space Apps 2026</span><span>{n} / 7</span></div>'
slides = f"""
<section class="s">
  <p class="kick">EARTH SYSTEM INTELLIGENCE</p>
  <h1>Terra Trace</h1>
  <p class="sub">Earth System Trend Detective. Find what is really changing on Earth, and how sure we are.</p>
  <p style="margin-top:56px"><span class="accent"><b>Challenge:</b></span> Be an Earth System Trend Detective</p>
  <p><span class="accent"><b>Team:</b></span> {TEAM}</p>
  <p><span class="accent"><b>Members:</b></span> {MEMBERS}</p>
  <p class="cyan" style="position:absolute;bottom:48px;left:64px;font-size:30px">{URL}</p>
</section>
<section class="s">
  <p class="kick">THE PROBLEM</p>
  <div class="row">
    <div class="col">
      <h2>Satellites see Earth change. Most people cannot check.</h2>
      <ul><li>"Pollution is falling." "The Arctic is warming."</li><li>The data sits in tables only specialists read.</li><li>Is a change real, or just random variation?</li></ul>
    </div>
    <div class="col"><img class="shot w" src="{img('home')}"></div>
  </div>{foot(2)}
</section>
<section class="s">
  <p class="kick">THE SOLUTION</p>
  <div class="row">
    <div class="col">
      <h2>Verdict first, evidence on demand</h2>
      <ul class="small"><li>Pick a place and a NASA measurement</li><li>See the direction, the size and how sure we are</li><li>Open the statistics only if you want them</li><li>Guided demo and Help me choose for new users</li></ul>
    </div>
    <div class="col" style="flex:1.25"><img class="shot w" src="{img('home')}"></div>
  </div>{foot(3)}
</section>
<section class="s">
  <p class="kick">HOW WE KNOW</p>
  <div class="row">
    <div class="col">
      <h2>Is the trend real?</h2>
      <ul class="small"><li>Remove the seasonal cycle</li><li>Theil-Sen slope, Mann-Kendall test</li><li>Adjust for neighbouring months being alike</li><li>Check El Niño, find turning points</li><li>Scan 33 combinations with false-discovery control</li></ul>
    </div>
    <div class="col"><img class="shot w" src="{img('explain')}"></div>
  </div>{foot(4)}
</section>
<section class="s">
  <p class="kick">A REAL DISCOVERY</p>
  <h2>NO2 over the North China Plain rose, peaked about 2012, then fell</h2>
  <img class="shot w" style="max-height:300px;object-fit:contain" src="{img('chart')}">
  <p style="margin-top:18px"><span class="tag">Turned around in 2012</span><span class="tag" style="border-color:#7be495;color:#7be495">Not explained by El Niño</span></p>
  <p style="font-size:24px;color:#a7b8d3">-2.1 ×10¹⁵ molecules/cm² per decade overall, very strong evidence (p &lt; 0.001).</p>
  {foot(5)}
</section>
<section class="s">
  <p class="kick">NASA DATA MAKES IT POSSIBLE</p>
  <div class="row">
    <div class="col">
      <h2>Six NASA products, nine regions</h2>
      <ul class="small"><li>MERRA-2: air temperature</li><li>GPM IMERG: precipitation</li><li>GLDAS: terrestrial water storage</li><li>Aura OMI: tropospheric NO2</li><li>MODIS-Aqua: sea surface temperature</li><li>AIRS: lower and upper air temperature</li><li>GIBS: map imagery. Data via Giovanni.</li></ul>
    </div>
    <div class="col"><img class="shot w" src="{img('scan')}"></div>
  </div>{foot(6)}
</section>
<section class="s">
  <p class="kick">IMPACT AND NEXT STEPS</p>
  <h2>Anyone can test a claim about our planet</h2>
  <ul><li>For students, teachers and curious people: a guided demo, plain-language answers, sourced examples</li><li>Honest about limits: "consistent with", never "proves"</li><li>Next: more regions, live NASA data, more languages</li></ul>
  <p class="cyan" style="margin-top:48px;font-size:36px"><b>{URL}</b></p>
  <p style="font-size:22px;color:#8396b5">Source code: github.com/CHplus2/earth-trend</p>
  <p style="font-size:20px;color:#8396b5">Built with AI assistance (Kiro): code, text and slides. All numbers computed from NASA data.</p>
  {foot(7)}
</section>
"""
open("slides.html","w").write(f"<!doctype html><html><head><meta charset='utf-8'><title>Terra Trace</title><style>{css}</style></head><body>{slides}</body></html>")
print("ok", len(slides))
