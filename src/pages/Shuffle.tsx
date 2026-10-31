import { useCallback, useEffect, useState } from 'react';
import { loadAllTopics, minorById, syllabus } from '../data';
import { href } from '../router';
import { getStatus, setStatus, useProgress } from '../storage';
import type { Card, Field, QuizItem, Topic } from '../types';
import FlipCard from '../components/FlipCard';
import QuizQuestion from '../components/QuizQuestion';
import { StatusBadge, shuffled } from '../components/bits';

type Mode = 'mix' | 'cards' | 'quiz';
type Item = { topicId: string } & ({ kind: 'card'; card: Card } | { kind: 'quiz'; quiz: QuizItem });

const MODES: { id: Mode; label: string }[] = [
  { id: 'mix', label: 'ミックス' },
  { id: 'cards', label: 'カードだけ' },
  { id: 'quiz', label: 'クイズだけ' },
];

/** 「覚えた」以外の小分類から出題候補を集めて混ぜる */
function buildQueue(topics: Topic[], mode: Mode, fields: Set<Field['id']>): Item[] {
  const items: Item[] = [];
  for (const t of topics) {
    const minor = minorById.get(t.id);
    if (!minor || !fields.has(minor.field.id)) continue;
    if (getStatus(t.id) === 'mastered') continue;
    if (mode !== 'quiz') t.cards.forEach((card) => items.push({ topicId: t.id, kind: 'card', card }));
    if (mode !== 'cards') t.quiz.forEach((quiz) => items.push({ topicId: t.id, kind: 'quiz', quiz }));
  }
  return shuffled(items);
}

export default function Shuffle() {
  const progress = useProgress();
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [mode, setMode] = useState<Mode>('mix');
  const [fields, setFields] = useState(() => new Set(syllabus.fields.map((f) => f.id)));
  const [queue, setQueue] = useState<Item[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    loadAllTopics().then(setTopics);
  }, []);

  const restart = useCallback(() => {
    if (!topics) return;
    setQueue(buildQueue(topics, mode, fields));
    setI(0);
    setFlipped(false);
    setAnswered(false);
  }, [topics, mode, fields]);

  useEffect(restart, [restart]);

  const toggleField = (id: Field['id']) => {
    const next = new Set(fields);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size > 0) setFields(next);
  };

  const next = () => {
    setI((n) => n + 1);
    setFlipped(false);
    setAnswered(false);
  };

  const item = queue[i];
  const minor = item && minorById.get(item.topicId);

  return (
    <div className="shuffle">
      <h1 className="page-title">シャッフル</h1>
      <p className="muted small">「覚えた」にしていない小分類のカードとクイズを、ランダムに出します。</p>

      <div className="chips" role="group" aria-label="出題の種類">
        {MODES.map((m) => (
          <button key={m.id} className="chip" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="対象の系">
        {syllabus.fields.map((f) => (
          <button key={f.id} className="chip" aria-pressed={fields.has(f.id)} onClick={() => toggleField(f.id)}>
            {f.name}
          </button>
        ))}
      </div>

      {!topics && <p className="muted">読み込み中…</p>}

      {topics && queue.length === 0 && (
        <div className="empty-topic">
          <p>出題できる問題がありません。</p>
          <p className="muted small">対象の小分類がすべて「覚えた」になっているか、まだ内容がありません。</p>
        </div>
      )}

      {topics && queue.length > 0 && !item && (
        <div className="empty-topic">
          <p>
            <b>{queue.length}問</b> ひととおり終わりました。
          </p>
          <button className="btn btn-primary" onClick={restart}>
            もう一周
          </button>
        </div>
      )}

      {item && minor && (
        <div className="shuffle-stage">
          <div className="shuffle-head">
            <span className="small muted">
              {i + 1} / {queue.length}
            </span>
            <a className="small" href={href.topic(minor.id)}>
              {minor.name}
            </a>
            <StatusBadge status={progress[minor.id] ?? 'new'} />
          </div>

          {item.kind === 'card' ? (
            <FlipCard card={item.card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          ) : (
            <QuizQuestion key={i} item={item.quiz} onAnswer={() => setAnswered(true)} />
          )}

          <div className="shuffle-ctrl">
            <button
              className="btn-text"
              onClick={() => setStatus(minor.id, 'mastered')}
              disabled={progress[minor.id] === 'mastered'}
            >
              この小分類を「覚えた」に
            </button>
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={item.kind === 'quiz' && !answered}
            >
              次へ ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
