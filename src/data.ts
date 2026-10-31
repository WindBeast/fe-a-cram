import syllabusJson from '../content/syllabus.json';
import type { Field, Major, Middle, Minor, Syllabus, Topic } from './types';

export const syllabus = syllabusJson as Syllabus;

/** ツリーをたどらずに使えるよう、小分類に上位の情報を付けて平らにしたもの */
export interface MinorEntry extends Minor {
  field: Field;
  major: Major;
  middle: Middle;
  /** 全小分類の通し番号（前後移動用） */
  index: number;
}

export const minors: MinorEntry[] = syllabus.fields.flatMap((field) =>
  field.majors.flatMap((major) =>
    major.middles.flatMap((middle) => middle.minors.map((m) => ({ ...m, field, major, middle, index: 0 }))),
  ),
);
minors.forEach((m, i) => (m.index = i));

export const minorById = new Map(minors.map((m) => [m.id, m]));

// 小分類ごとの JSON は遅延読み込み（最初の表示を軽くするため）
const topicLoaders = import.meta.glob<Topic>('../content/topics/*.json', { import: 'default' });

const loaderById = new Map<string, () => Promise<Topic>>(
  Object.entries(topicLoaders).map(([path, load]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), load]),
);

export function hasContent(id: string): boolean {
  return loaderById.has(id);
}

const topicCache = new Map<string, Promise<Topic>>();

export function loadTopic(id: string): Promise<Topic> | undefined {
  const load = loaderById.get(id);
  if (!load) return undefined;
  let p = topicCache.get(id);
  if (!p) {
    p = load();
    topicCache.set(id, p);
  }
  return p;
}

/** 検索・シャッフル用に、内容のある小分類をすべて読む */
export function loadAllTopics(): Promise<Topic[]> {
  return Promise.all([...loaderById.keys()].map((id) => loadTopic(id)!));
}

export const contentCount = loaderById.size;
