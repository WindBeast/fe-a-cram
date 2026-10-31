import { contentCount, hasContent, minors, syllabus } from '../data';
import { href } from '../router';
import { setOpen, useOpenState, useProgress } from '../storage';
import type { Minor } from '../types';
import { ProgressBar, StatusBadge } from '../components/bits';

function tally(list: Minor[], progress: Record<string, string>) {
  let done = 0;
  let learning = 0;
  for (const m of list) {
    if (progress[m.id] === 'mastered') done++;
    else if (progress[m.id] === 'learning') learning++;
  }
  return { done, learning, total: list.length };
}

export default function Home() {
  const progress = useProgress();
  const openState = useOpenState();
  const all = tally(minors, progress);

  return (
    <div className="home">
      <section className="overview">
        <div className="overview-num">
          <b>{all.done}</b>
          <span>/ {all.total} 小分類を覚えた</span>
        </div>
        <ProgressBar {...all} />
        <p className="muted small">
          学習中 {all.learning} ・ 内容あり {contentCount} / {all.total}
        </p>
        <nav className="jump" aria-label="系へ移動">
          {syllabus.fields.map((f) => (
            <a key={f.id} href={`#${f.id}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth' });
            }}>
              {f.name}
            </a>
          ))}
        </nav>
      </section>

      {syllabus.fields.map((field) => {
        const fieldMinors = field.majors.flatMap((ma) => ma.middles.flatMap((mi) => mi.minors));
        const ft = tally(fieldMinors, progress);
        return (
          <section key={field.id} id={field.id} className={`field field-${field.id}`}>
            <h2 className="field-title">
              {field.name}
              <span className="field-count">
                {ft.done} / {ft.total}
              </span>
            </h2>
            {field.majors.map((major) => (
              <div key={major.no} className="major">
                <h3 className="major-title">
                  <span className="num">大分類 {major.no}</span>
                  {major.name}
                </h3>
                {major.middles.map((middle) => {
                  const key = `m${middle.no}`;
                  const mt = tally(middle.minors, progress);
                  const anyContent = middle.minors.some((m) => hasContent(m.id));
                  const open = openState[key] ?? anyContent;
                  return (
                    <details
                      key={middle.no}
                      className="middle"
                      open={open}
                      onToggle={(e) => {
                        const now = (e.currentTarget as HTMLDetailsElement).open;
                        if (now !== open) setOpen(key, now);
                      }}
                    >
                      <summary>
                        <span className="middle-name">
                          <span className="num">{middle.no}</span>
                          {middle.name}
                        </span>
                        <span className="middle-meta">
                          <ProgressBar {...mt} />
                          <span className="small muted">
                            {mt.done}/{mt.total}
                          </span>
                        </span>
                      </summary>
                      <ul className="minor-list">
                        {middle.minors.map((m) => {
                          const filled = hasContent(m.id);
                          return (
                            <li key={m.id}>
                              <a className={`minor ${filled ? '' : 'is-empty'}`} href={href.topic(m.id)}>
                                <span className="minor-name">{m.name}</span>
                                {filled ? (
                                  <StatusBadge status={progress[m.id] ?? 'new'} />
                                ) : (
                                  <span className="badge badge-empty">準備中</span>
                                )}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  );
                })}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
