import { useState } from 'react';
import type { QuizItem } from '../types';
import { ReviewMark, ReviewNote } from './bits';
import Txt from './Txt';

const KANA = ['ア', 'イ', 'ウ', 'エ'];

interface Props {
  item: QuizItem;
  label?: string;
  topicId?: string;
  onAnswer?: (correct: boolean) => void;
}

export default function QuizQuestion({ item, label, onAnswer, topicId }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswer?.(i === item.answer);
  };

  return (
    <div className="qq">
      <p className="qq-q">
        {label && <span className="qq-no">{label}</span>}
        <Txt text={item.q} topicId={topicId} /> <ReviewMark item={item} />
      </p>
      <ol className="qq-choices">
        {item.choices.map((c, i) => {
          const state = !answered ? '' : i === item.answer ? 'is-correct' : i === picked ? 'is-wrong' : 'is-dim';
          return (
            <li key={i}>
              <button className={`qq-choice ${state}`} onClick={() => pick(i)} disabled={answered && state === 'is-dim'}>
                <span className="qq-kana">{KANA[i]}</span>
                <span>{c}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {answered && (
        <div className={`qq-exp ${picked === item.answer ? 'ok' : 'ng'}`} role="status">
          <b>{picked === item.answer ? '正解' : `不正解（正解は ${KANA[item.answer]}）`}</b>
          <p>
            <Txt text={item.explanation} topicId={topicId} />
          </p>
          <ReviewNote item={item} />
        </div>
      )}
    </div>
  );
}
