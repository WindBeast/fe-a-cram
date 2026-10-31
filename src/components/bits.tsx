import { STATUS_LABEL, type Reviewable, type Status } from '../types';
import { setStatus, useProgress } from '../storage';

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

const ORDER: Status[] = ['new', 'learning', 'mastered'];

export function StatusPicker({ id }: { id: string }) {
  const status = useProgress()[id] ?? 'new';
  return (
    <div className="seg" role="radiogroup" aria-label="進捗">
      {ORDER.map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={status === s}
          className={`seg-btn seg-${s}`}
          onClick={() => setStatus(id, s)}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

/** needsReview が付いた項目の目印 */
export function ReviewMark({ item }: { item: Reviewable }) {
  if (!item.needsReview) return null;
  return (
    <span className="review" title={item.reviewNote ?? '内容の確認が必要'}>
      要確認
    </span>
  );
}

export function ReviewNote({ item }: { item: Reviewable }) {
  if (!item.needsReview || !item.reviewNote) return null;
  return <p className="review-note">⚠ {item.reviewNote}</p>;
}

export function ProgressBar({ done, learning, total }: { done: number; learning: number; total: number }) {
  const pct = (n: number) => (total ? (n / total) * 100 : 0);
  return (
    <span className="pbar" aria-hidden="true">
      <span className="pbar-done" style={{ width: `${pct(done)}%` }} />
      <span className="pbar-learning" style={{ width: `${pct(learning)}%` }} />
    </span>
  );
}

export function shuffled<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
