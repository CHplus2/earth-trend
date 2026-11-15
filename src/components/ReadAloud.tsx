import { useEffect, useState } from 'react';

/** Reads the text of the element matching `selector` using the browser's built-in speech. */
export default function ReadAloud({ selector }: { selector: string }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  if (!supported) return null;

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
    u.lang = 'en';
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <button className="read" onClick={toggle} aria-pressed={speaking}>
      {speaking ? 'Stop reading' : 'Read result aloud'}
    </button>
  );
}
