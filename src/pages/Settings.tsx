import { useState } from 'react';
import { minors } from '../data';
import { resetProgress, setTheme, useProgress, useTheme, type Theme } from '../storage';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'system', label: '端末に合わせる' },
  { id: 'light', label: 'ライト' },
  { id: 'dark', label: 'ダーク' },
];

export default function Settings() {
  const theme = useTheme();
  const progress = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const learning = Object.values(progress).filter((s) => s === 'learning').length;
  const mastered = Object.values(progress).filter((s) => s === 'mastered').length;

  return (
    <div className="settings">
      <h1 className="page-title">設定</h1>

      <section className="sec">
        <h2>表示</h2>
        <div className="chips" role="radiogroup" aria-label="テーマ">
          {THEMES.map((t) => (
            <button key={t.id} className="chip" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2>進捗</h2>
        <p>
          覚えた {mastered} ・ 学習中 {learning} ・ 未着手 {minors.length - mastered - learning}
        </p>
        <p className="muted small">進捗はこのブラウザの中だけに保存されます（他の端末とは共有されません）。</p>
        {!confirming ? (
          <button className="btn btn-danger" onClick={() => { setConfirming(true); setDone(false); }} disabled={mastered + learning === 0}>
            進捗をリセット
          </button>
        ) : (
          <div className="confirm">
            <p>すべての小分類を「未着手」に戻します。元に戻せません。</p>
            <div className="confirm-btns">
              <button className="btn" onClick={() => setConfirming(false)}>
                やめる
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  resetProgress();
                  setConfirming(false);
                  setDone(true);
                }}
              >
                リセットする
              </button>
            </div>
          </div>
        )}
        {done && <p className="muted small" role="status">リセットしました。</p>}
      </section>

      <section className="sec">
        <h2>このサイトについて</h2>
        <p className="small">
          IPA 基本情報技術者試験 科目A の出題範囲に沿った個人用の要点まとめです。説明・カード・クイズはすべてオリジナルです。
          <span className="review">要確認</span> の付いた記述は、内容や分類の位置づけを確認中のものです。
        </p>
      </section>
    </div>
  );
}
