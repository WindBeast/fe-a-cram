// content/ 配下の JSON を検査する。npm run check（build の前にも自動で実行）
import { readdirSync, readFileSync } from 'node:fs';

const root = new URL('../content/', import.meta.url);
const errors = [];
const warns = [];

const syllabus = JSON.parse(readFileSync(new URL('syllabus.json', root), 'utf8'));
const minorIds = new Set(
  syllabus.fields.flatMap((f) => f.majors.flatMap((ma) => ma.middles.flatMap((mi) => mi.minors.map((m) => m.id)))),
);

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const reviewCount = { n: 0 };

function checkReview(where, item) {
  if (item.needsReview !== undefined && typeof item.needsReview !== 'boolean') errors.push(`${where}: needsReview は true/false`);
  if (item.needsReview) reviewCount.n++;
  if (item.needsReview && !isStr(item.reviewNote)) warns.push(`${where}: needsReview に reviewNote（何が不確かか）があると親切`);
}

const files = readdirSync(new URL('topics/', root)).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const id = file.replace(/\.json$/, '');
  let t;
  try {
    t = JSON.parse(readFileSync(new URL(`topics/${file}`, root), 'utf8'));
  } catch (e) {
    errors.push(`${file}: JSON として読めません (${e.message})`);
    continue;
  }
  const at = (s) => `${file} ${s}`;

  if (!minorIds.has(id)) errors.push(at(`: 小分類 id "${id}" が syllabus.json にありません`));
  if (t.id !== id) errors.push(at(`: id "${t.id}" がファイル名と一致しません`));
  checkReview(at(''), t);

  if (!Array.isArray(t.summary) || !t.summary.every(isStr)) errors.push(at('summary: 文字列の配列'));
  else if (t.summary.length < 3 || t.summary.length > 5) warns.push(at(`summary: 3〜5行が目安（現在 ${t.summary.length} 行）`));

  const seen = new Set();
  (t.terms ?? []).forEach((x, i) => {
    if (!isStr(x.term) || !isStr(x.desc)) errors.push(at(`terms[${i}]: term と desc が必要`));
    if (seen.has(x.term)) warns.push(at(`terms[${i}]: 用語「${x.term}」が重複`));
    seen.add(x.term);
    checkReview(at(`terms[${i}]`), x);
  });

  (t.points ?? []).forEach((x, i) => {
    if (x.kind !== 'point' && x.kind !== 'trap') errors.push(at(`points[${i}]: kind は "point" か "trap"`));
    if (!isStr(x.text)) errors.push(at(`points[${i}]: text が必要`));
    checkReview(at(`points[${i}]`), x);
  });

  (t.cards ?? []).forEach((x, i) => {
    if (!isStr(x.front) || !isStr(x.back)) errors.push(at(`cards[${i}]: front と back が必要`));
    checkReview(at(`cards[${i}]`), x);
  });

  const quiz = t.quiz ?? [];
  if (quiz.length < 3 || quiz.length > 5) warns.push(at(`quiz: 3〜5問が目安（現在 ${quiz.length} 問）`));
  const answers = [0, 0, 0, 0];
  quiz.forEach((x, i) => {
    if (!isStr(x.q)) errors.push(at(`quiz[${i}]: q が必要`));
    if (!Array.isArray(x.choices) || x.choices.length !== 4 || !x.choices.every(isStr)) errors.push(at(`quiz[${i}]: choices は4つ`));
    else if (new Set(x.choices).size !== 4) errors.push(at(`quiz[${i}]: 同じ選択肢がある`));
    if (![0, 1, 2, 3].includes(x.answer)) errors.push(at(`quiz[${i}]: answer は 0〜3`));
    else answers[x.answer]++;
    if (!isStr(x.explanation)) errors.push(at(`quiz[${i}]: explanation が必要`));
    checkReview(at(`quiz[${i}]`), x);
  });
  if (quiz.length >= 3 && answers.some((n) => n === quiz.length)) warns.push(at('quiz: 正解の位置がすべて同じ'));

  for (const key of ['terms', 'points', 'cards', 'quiz']) {
    if (!Array.isArray(t[key])) errors.push(at(`${key}: 配列が必要`));
  }
}

for (const w of warns) console.warn(`注意  ${w}`);
for (const e of errors) console.error(`エラー ${e}`);
console.log(`小分類 ${files.length} / ${minorIds.size} 件に内容あり、要確認 ${reviewCount.n} 件、エラー ${errors.length} 件、注意 ${warns.length} 件`);
if (errors.length) process.exit(1);
