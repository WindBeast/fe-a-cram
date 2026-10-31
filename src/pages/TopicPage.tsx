import { useEffect, useState } from 'react';
import { loadTopic, minorById, minors } from '../data';
import { href } from '../router';
import { getStatus, setStatus } from '../storage';
import type { Topic } from '../types';
import { ReviewMark, ReviewNote, StatusPicker } from '../components/bits';
import Flashcards from '../components/Flashcards';
import Quiz from '../components/Quiz';

const SECTIONS = [
  { id: 'summary', label: 'まとめ' },
  { id: 'terms', label: '用語' },
  { id: 'points', label: 'ポイント' },
  { id: 'cards', label: 'カード' },
  { id: 'quiz', label: 'クイズ' },
];

export default function TopicPage({ id }: { id: string }) {
  const minor = minorById.get(id);
  const [topic, setTopic] = useState<Topic | null | undefined>(undefined);

  useEffect(() => {
    const p = loadTopic(id);
    if (!p) {
      setTopic(null);
      return;
    }
    let alive = true;
    p.then((t) => {
      if (!alive) return;
      setTopic(t);
      // 開いた時点で「学習中」にする（覚えた・学習中はそのまま）
      if (getStatus(id) === 'new') setStatus(id, 'learning');
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!minor) {
    return (
      <div className="topic">
        <p>小分類「{id}」は見つかりませんでした。</p>
        <a href={href.home()}>一覧へ戻る</a>
      </div>
    );
  }

  const prev = minors[minor.index - 1];
  const next = minors[minor.index + 1];

  return (
    <article className="topic">
      <nav className="crumbs" aria-label="現在位置">
        <a href={href.home()}>{minor.field.name}</a>
        <span>›</span>
        <span>{minor.major.name}</span>
        <span>›</span>
        <span>
          {minor.middle.no} {minor.middle.name}
        </span>
      </nav>
      <h1 className="topic-title">
        {minor.name}
        {topic && <ReviewMark item={topic} />}
      </h1>
      <StatusPicker id={id} />

      {topic === undefined && <p className="muted">読み込み中…</p>}

      {topic === null && (
        <div className="empty-topic">
          <p>この小分類はまだ内容がありません。</p>
          <p className="muted small">
            <code>content/topics/{id}.json</code> を追加すると、ここにまとめ・用語・カード・クイズが表示されます。
          </p>
        </div>
      )}

      {topic && (
        <>
          {topic.needsReview && <ReviewNote item={{ ...topic, reviewNote: topic.reviewNote ?? 'この小分類の内容は確認待ちです。' }} />}
          <nav className="sec-nav" aria-label="この小分類の中">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <section id="summary" className="sec sec-summary">
            <h2>30秒まとめ</h2>
            <ul>
              {topic.summary.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>

          <section id="terms" className="sec">
            <h2>
              重要用語 <span className="muted small">{topic.terms.length}</span>
            </h2>
            <dl className="terms">
              {topic.terms.map((t) => (
                <div key={t.term} className="term">
                  <dt>
                    {t.term} <ReviewMark item={t} />
                  </dt>
                  <dd>
                    {t.desc}
                    <ReviewNote item={t} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="points" className="sec">
            <h2>頻出ポイント・ひっかけ注意</h2>
            <ul className="points">
              {topic.points.map((p, i) => (
                <li key={i} className={`point point-${p.kind}`}>
                  <span className="point-tag">{p.kind === 'trap' ? 'ひっかけ' : '頻出'}</span>
                  <span>
                    {p.text} <ReviewMark item={p} />
                    <ReviewNote item={p} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="cards" className="sec">
            <h2>
              フラッシュカード <span className="muted small">{topic.cards.length}</span>
            </h2>
            <Flashcards cards={topic.cards} />
          </section>

          <section id="quiz" className="sec">
            <h2>
              ミニ確認クイズ <span className="muted small">{topic.quiz.length}問</span>
            </h2>
            <Quiz items={topic.quiz} />
          </section>

          {topic.updated && <p className="muted small updated">最終更新 {topic.updated}</p>}
        </>
      )}

      <nav className="pager">
        {prev ? (
          <a href={href.topic(prev.id)}>
            <span className="small muted">‹ 前</span>
            {prev.name}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={href.topic(next.id)} className="pager-next">
            <span className="small muted">次 ›</span>
            {next.name}
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
