import { useState } from 'react';
import type { QuizItem } from '../types';
import QuizQuestion from './QuizQuestion';

export default function Quiz({ items }: { items: QuizItem[] }) {
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<Record<number, boolean>>({});

  if (items.length === 0) return <p className="muted">クイズはまだありません。</p>;

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;

  return (
    <div className="quiz">
      {items.map((item, i) => (
        <QuizQuestion
          key={`${round}-${i}`}
          item={item}
          label={`問${i + 1}`}
          onAnswer={(ok) => setResults((r) => ({ ...r, [i]: ok }))}
        />
      ))}
      <div className="quiz-score">
        {answered < items.length ? (
          <span className="muted">
            {answered} / {items.length} 問 回答済み
          </span>
        ) : (
          <>
            <b>
              {correct} / {items.length} 問正解
            </b>
            <button
              className="btn"
              onClick={() => {
                setResults({});
                setRound((r) => r + 1);
              }}
            >
              もう一度
            </button>
          </>
        )}
      </div>
    </div>
  );
}
