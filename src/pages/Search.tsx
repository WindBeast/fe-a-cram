import { useEffect, useMemo, useState } from 'react';
import { loadAllTopics, minorById, minors } from '../data';
import { href } from '../router';
import type { Term, Topic } from '../types';
import { ReviewMark } from '../components/bits';

/** 全角半角・大小文字・カタカナひらがなの違いを吸収する */
function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/\s+/g, '');
}

interface Hit {
  topicId: string;
  term: Term;
  rank: number;
}

export default function Search({ q: initial }: { q: string }) {
  const [q, setQ] = useState(initial);
  const [topics, setTopics] = useState<Topic[] | null>(null);

  useEffect(() => {
    loadAllTopics().then(setTopics);
  }, []);

  // 入力内容を URL に残す（戻る・再読込で消えないように）。履歴は増やさない
  useEffect(() => {
    history.replaceState(null, '', href.search(q));
  }, [q]);

  const nq = norm(q);

  const termHits = useMemo<Hit[]>(() => {
    if (!topics || !nq) return [];
    const hits: Hit[] = [];
    for (const t of topics) {
      for (const term of t.terms) {
        const name = norm(term.term);
        const reading = term.reading ? norm(term.reading) : '';
        let rank = -1;
        if (name === nq || reading === nq) rank = 0;
        else if (name.startsWith(nq) || reading.startsWith(nq)) rank = 1;
        else if (name.includes(nq) || reading.includes(nq)) rank = 2;
        else if (norm(term.desc).includes(nq)) rank = 3;
        if (rank >= 0) hits.push({ topicId: t.id, term, rank });
      }
    }
    return hits.sort((a, b) => a.rank - b.rank);
  }, [topics, nq]);

  const minorHits = useMemo(
    () => (nq ? minors.filter((m) => norm(m.name).includes(nq) || norm(m.middle.name).includes(nq)) : []),
    [nq],
  );

  return (
    <div className="search">
      <h1 className="page-title">用語検索</h1>
      <input
        className="search-input"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="例：2の補数、DMA、ゼロトラスト"
        autoFocus
        enterKeyHint="search"
      />
      {!topics && <p className="muted">読み込み中…</p>}

      {topics && nq && (
        <>
          {minorHits.length > 0 && (
            <section className="sec">
              <h2 className="small muted">分類名</h2>
              <ul className="minor-list">
                {minorHits.map((m) => (
                  <li key={m.id}>
                    <a className="minor" href={href.topic(m.id)}>
                      <span className="minor-name">{m.name}</span>
                      <span className="small muted">{m.middle.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="sec">
            <h2 className="small muted">用語 {termHits.length}件</h2>
            {termHits.length === 0 && <p className="muted">見つかりませんでした。</p>}
            <dl className="terms">
              {termHits.map((h) => (
                <div key={h.topicId + h.term.term} className="term">
                  <dt>
                    {h.term.term} <ReviewMark item={h.term} />
                  </dt>
                  <dd>
                    {h.term.desc}
                    <a className="term-src small" href={href.topic(h.topicId)}>
                      {minorById.get(h.topicId)?.name ?? h.topicId} ›
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}
      {topics && !nq && (
        <p className="muted small">
          内容が入っている小分類（{topics.length}件）の用語・説明と、全小分類の名前から探します。
        </p>
      )}
    </div>
  );
}
