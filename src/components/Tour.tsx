import { useEffect, useRef, useState } from 'react';

interface Step {
  title: string;
  text: string;
  /** data-tour value of the element to highlight */
  target?: string;
  /** Put the app into the tour's example state */
  setup?: boolean;
}

const STEPS: Step[] = [
  {
    title: 'The case',
    text: 'You are a data detective. The case: has air pollution over the North China Plain changed since 2004? We will use NASA satellite data to find out, step by step.',
  },
  {
    title: '1. Choose where',
    text: 'Each dot is a region we have NASA data for. Colours show whether temperature there is rising (orange), falling (blue) or not clearly changing (grey). Here we have picked the North China Plain.',
    target: 'map',
    setup: true,
  },
  {
    title: '2. Choose what to measure',
    text: 'Place and Variable pick what to look at. We chose NO2, a pollutant from traffic, power plants and industry, measured by NASA\'s Ozone Monitoring Instrument. The line below the menus explains it in plain words.',
    target: 'controls',
  },
  {
    title: '3. Read the answer',
    text: 'This summary says the direction and size of the change in plain language. NO2 is falling here, by about 2 units every 10 years.',
    target: 'summary',
  },
  {
    title: '4. Look at the data',
    text: 'Each dot is one month. The seasonal cycle is removed so slow change is visible. The straight line is the trend. Notice the rise and then the fall: the line is only part of the story.',
    target: 'chart',
  },
  {
    title: '5. How sure are we?',
    text: 'A p-value below 0.05 means a trend this strong would show up by luck less than 1 time in 20. Here it is far below that, so the trend is significant.',
    target: 'stats',
  },
  {
    title: '6. Is something else behind it?',
    text: 'We remove El Niño swings and test again, and we search for a turning point. Here the trend survives El Niño, and the record turned around 2012: NO2 rose, peaked, then fell. These checks show what the trend is consistent with. They do not prove a cause.',
    target: 'explain',
  },
  {
    title: 'Your turn',
    text: 'Use "Help me choose" to pick your own place, try an example, or open the Scan tab to test every combination at once.',
  },
];

interface Props {
  onClose: () => void;
  /** Called when a step needs the app in the tour's example state */
  onSetup: () => void;
}

export default function Tour({ onClose, onSetup }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[i];
  const setupDone = useRef(false);
  const setup = useRef(onSetup);
  setup.current = onSetup;

  // Highlight the target element and scroll it into view.
  useEffect(() => {
    if (step.setup && !setupDone.current) {
      setup.current();
      setupDone.current = true;
    }
    // Step 1 onward needs the example loaded, even if the user jumped ahead.
    if (i >= 1 && !setupDone.current) {
      setup.current();
      setupDone.current = true;
    }
    let el: Element | null = null;
    const t = window.setTimeout(() => {
      if (!step.target) return;
      el = document.querySelector(`[data-tour="${step.target}"]`);
      // Open a collapsed evidence panel so the highlighted part is visible.
      if (el instanceof HTMLDetailsElement) el.open = true;
      el?.classList.add('tour-hl');
      el?.scrollIntoView({ block: window.innerWidth <= 900 ? 'start' : 'center' });
    }, 350);
    return () => {
      window.clearTimeout(t);
      el?.classList.remove('tour-hl');
      document.querySelectorAll('.tour-hl').forEach((n) => n.classList.remove('tour-hl'));
    };
  }, [i, step]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (i >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setI((n) => n + 1), 9000);
    return () => window.clearTimeout(id);
  }, [playing, i]);

  // Escape closes the tour
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <aside className={`tour${step.target && step.target !== 'map' ? ' tour-left' : ''}`} role="dialog" aria-label="Guided tour" aria-live="polite">
      <p className="tour-count">Step {i + 1} of {STEPS.length}</p>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <div className="tour-actions">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
        {i < STEPS.length - 1 ? (
          <button className="active" onClick={() => setI(i + 1)}>Next</button>
        ) : (
          <button className="active" onClick={onClose}>Finish</button>
        )}
        <button onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>{playing ? 'Pause' : 'Auto-play'}</button>
        <button onClick={onClose}>Close</button>
      </div>
    </aside>
  );
}
