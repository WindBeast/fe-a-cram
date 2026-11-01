import abbrJson from '../../content/abbr.json';

// 英語の略称に、元の言葉を小さく添えて表示する。
// 各テキストの中で最初に出てきたときだけ添え、すでに元の言葉が書かれていれば添えない。

type Entry = string | { default?: string; by: Record<string, string> };

const dict: Record<string, Entry> = Object.fromEntries(
  Object.entries(abbrJson as Record<string, Entry>).filter(([k]) => !k.startsWith('_')),
);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
const pattern = new RegExp(`(?<![A-Za-z0-9])(${keys.map(escape).join('|')})(?![A-Za-z0-9])`, 'g');

/** 小分類 id（例 08-1）または中分類番号（例 08）で意味を選ぶ */
function expansion(key: string, topicId?: string): string | undefined {
  const e = dict[key];
  if (typeof e === 'string') return e;
  if (topicId) {
    const hit = e.by[topicId] ?? e.by[topicId.slice(0, 2)];
    if (hit) return hit;
  }
  return e.default;
}

/** テキストに含まれる略称（辞書にあるもの）の一覧 */
export function abbrsIn(text: string): string[] {
  return [...text.matchAll(pattern)].map((m) => m[1]);
}

interface Props {
  text: string;
  topicId?: string;
  /** 元の言葉を添えない略称（すぐ上で添えたものなど） */
  skip?: string[];
}

export default function Txt({ text, topicId, skip }: Props) {
  const lower = text.toLowerCase();
  const done = new Set(skip);
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const key = m[1];
    if (done.has(key)) continue;
    done.add(key);
    const full = expansion(key, topicId);
    if (!full || lower.includes(full.toLowerCase())) continue;
    const end = m.index + key.length;
    out.push(
      text.slice(last, end),
      <span className="abbr-full" key={m.index}>
        {' '}({full})
      </span>,
    );
    last = end;
  }
  if (out.length === 0) return <>{text}</>;
  out.push(text.slice(last));
  return <>{out}</>;
}
