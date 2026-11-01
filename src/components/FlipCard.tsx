import type { Card } from '../types';
import { ReviewMark } from './bits';
import Txt from './Txt';

interface Props {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  topicId?: string;
}

export default function FlipCard({ card, flipped, onFlip, topicId }: Props) {
  return (
    <button className={`flip ${flipped ? 'is-flipped' : ''}`} onClick={onFlip} aria-label={flipped ? '表に戻す' : '答えを見る'}>
      <span className="flip-inner">
        <span className="flip-face flip-front">
          <span className="flip-label">
            問い <ReviewMark item={card} />
          </span>
          <span className="flip-text">
            <span>
              <Txt text={card.front} topicId={topicId} />
            </span>
          </span>
          <span className="flip-hint">タップで答え</span>
        </span>
        <span className="flip-face flip-back">
          <span className="flip-label">答え</span>
          <span className="flip-text">
            <span>
              <Txt text={card.back} topicId={topicId} />
            </span>
          </span>
          {card.needsReview && card.reviewNote && <span className="flip-hint">⚠ {card.reviewNote}</span>}
        </span>
      </span>
    </button>
  );
}
