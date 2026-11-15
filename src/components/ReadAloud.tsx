import { useEffect, useState } from 'react';

const STORE = 'terra-trace-voice';

/** Higher score = more natural-sounding voice (neural and premium voices first). */
function score(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (/natural|neural/.test(n)) s += 50;
  if (/premium|enhanced/.test(n)) s += 40;
  if (/online/.test(n)) s += 30;
  if (/google/.test(n)) s += 20;
  if (/^en[-_]us/i.test(v.lang)) s += 5;
  if (v.localService) s -= 5; // local voices are usually the most robotic ones
  return s;
}

/** Reads the text of the elements matching `selector` using the browser's built-in speech. */
export default function ReadAloud({ selector }: { selector: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>(() => localStorage.getItem(STORE) ?? '');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const en = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith('en'))
        .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
      setVoices(en);
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const chosen = voices.find((v) => v.name === voiceName) ?? voices[0];

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = Array.from(document.querySelectorAll(selector)).map((n) => n.textContent ?? '').join('. ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    if (chosen) {
      u.voice = chosen;
      u.lang = chosen.lang;
    } else {
      u.lang = 'en';
    }
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="read-row">
      <button className="read" onClick={toggle} aria-pressed={speaking}>
        {speaking ? 'Stop reading' : 'Read result aloud'}
      </button>
      {voices.length > 1 && (
        <label className="voice">
          <span>Voice</span>
          <select
            value={chosen?.name ?? ''}
            onChange={(e) => {
              setVoiceName(e.target.value);
              localStorage.setItem(STORE, e.target.value);
              window.speechSynthesis.cancel();
              setSpeaking(false);
            }}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>{v.name.replace(/^(Microsoft|Google)\s+/, '')}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
