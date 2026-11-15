import { useState } from 'react';
import { REGIONS, VARIABLES } from '../lib/catalog';

interface Props {
  onOpen: (regionId: string, variableId: string) => void;
}

interface Topic {
  id: string;
  label: string;
  /** Variable to use for land places, and for ocean places */
  land?: string;
  ocean?: string;
}

const TOPICS: Topic[] = [
  { id: 'heat', label: 'Is it getting hotter?', land: 't2m', ocean: 'sst' },
  { id: 'air', label: 'Is the air getting cleaner or dirtier?', land: 'no2' },
  { id: 'rain', label: 'Is it getting wetter or drier?', land: 'precip' },
  { id: 'water', label: 'Is the ground losing water?', land: 'tws' },
  { id: 'sea', label: 'What is happening in the ocean?', ocean: 'sst' },
];

/** What makes each place interesting, in plain words. */
const PLACE_TAGS: Record<string, string> = {
  amazon: 'a rain forest',
  iberia: 'a dry Mediterranean land',
  california: 'irrigated farmland in a dry climate',
  india: 'a crowded plain with heavy farming and industry',
  china: 'a heavily industrial region and megacities',
  useast: 'a busy industrial and urban corridor',
  nino34: 'the tropical Pacific where El Niño starts',
  natlantic: 'the open North Atlantic',
  barents: 'a fast-changing Arctic sea',
};

export default function Guide({ onOpen }: Props) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const topic = TOPICS.find((t) => t.id === topicId) ?? null;

  const places = topic
    ? REGIONS.filter((r) => (r.type === 'land' ? !!topic.land : !!topic.ocean))
    : [];

  return (
    <section className="guide" aria-labelledby="guide-h">
      <h2 id="guide-h">Help me choose</h2>
      <p className="muted">Answer two quick questions and we will pick a place and a measurement to investigate.</p>

      <p className="q"><strong>1. What do you want to find out?</strong></p>
      <div className="demo-buttons" role="group" aria-label="What do you want to find out?">
        {TOPICS.map((t) => (
          <button key={t.id} aria-pressed={topicId === t.id} className={topicId === t.id ? 'active' : ''} onClick={() => setTopicId(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {topic && (
        <>
          <p className="q"><strong>2. Which kind of place?</strong></p>
          <div className="demo-buttons" role="group" aria-label="Which kind of place?">
            {places.map((r) => {
              const vid = r.type === 'land' ? topic.land! : topic.ocean!;
              const v = VARIABLES.find((x) => x.id === vid)!;
              return (
                <button key={r.id} onClick={() => onOpen(r.id, vid)} title={`${v.name} in ${r.name}`}>
                  {r.name}: {PLACE_TAGS[r.id]}
                </button>
              );
            })}
          </div>
          <p className="muted">Choosing a place opens it with the matching NASA measurement.</p>
        </>
      )}
    </section>
  );
}
