// ---- 出題範囲（content/syllabus.json） ----

export interface Minor {
  /** 「中分類番号2桁-小分類の並び順」例: "03-4" */
  id: string;
  name: string;
}

export interface Middle {
  no: number;
  name: string;
  minors: Minor[];
}

export interface Major {
  no: number;
  name: string;
  middles: Middle[];
}

export interface Field {
  id: 'tech' | 'mgmt' | 'strategy';
  name: string;
  majors: Major[];
}

export interface Syllabus {
  note: string;
  fields: Field[];
}

// ---- 小分類ごとの学習コンテンツ（content/topics/<id>.json） ----

/** 自信のない記述に付ける目印。どの項目にも付けられる */
export interface Reviewable {
  needsReview?: boolean;
  /** 何が不確かなのか（画面にも表示する） */
  reviewNote?: string;
}

export interface Term extends Reviewable {
  term: string;
  /** 検索用のよみ（任意） */
  reading?: string;
  desc: string;
}

export interface Point extends Reviewable {
  /** point = 頻出ポイント / trap = ひっかけ注意 */
  kind: 'point' | 'trap';
  text: string;
}

export interface Card extends Reviewable {
  front: string;
  back: string;
}

export interface QuizItem extends Reviewable {
  q: string;
  /** 4択（ア・イ・ウ・エ の順） */
  choices: [string, string, string, string];
  /** 正解の添字 0〜3 */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Topic extends Reviewable {
  id: string;
  /** 30秒まとめ（3〜5行） */
  summary: string[];
  terms: Term[];
  points: Point[];
  cards: Card[];
  quiz: QuizItem[];
  /** 最終更新日 YYYY-MM-DD */
  updated?: string;
}

// ---- 進捗 ----

export type Status = 'new' | 'learning' | 'mastered';

export const STATUS_LABEL: Record<Status, string> = {
  new: '未着手',
  learning: '学習中',
  mastered: '覚えた',
};
