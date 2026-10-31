import { useState } from 'react';
import type { Card } from '../types';
import FlipCard from './FlipCard';
import { shuffled } from './bits';

export default function Flashcards({ cards }: { cards: Card[] }) {
  const [deck, setDeck] = useState(cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (deck.length === 0) return <p className="muted">カードはまだありません。</p>;

  const go = (next: number) => {
    setFlipped(false);
    setI((next + deck.length) % deck.length);
  };

  return (
    <div className="deck">
      <FlipCard card={deck[i]} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      <div className="deck-ctrl">
        <button className="btn" onClick={() => go(i - 1)} aria-label="前のカード">
          ‹ 前
        </button>
        <span className="deck-count">
          {i + 1} / {deck.length}
        </span>
        <button className="btn" onClick={() => go(i + 1)} aria-label="次のカード">
          次 ›
        </button>
      </div>
      <div className="deck-sub">
        <button
          className="btn-text"
          onClick={() => {
            setDeck(shuffled(cards));
            setI(0);
            setFlipped(false);
          }}
        >
          並べ替える
        </button>
      </div>
    </div>
  );
}
