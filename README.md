# FE科目A パッと詰め込み

基本情報技術者試験 科目A の出題範囲（大分類→中分類→小分類）に沿った個人用の要点まとめサイト。

```
npm install
npm run dev      # 開発サーバー
npm run check    # content/ の JSON を検査
npm run build    # 検査 → 型チェック → dist/ に静的ファイルを出力
```

## コンテンツの追加

- 出題範囲：`content/syllabus.json`（`scripts/gen-syllabus.mjs` で生成。直接編集してもよい）
- 小分類の中身：`content/topics/<小分類id>.json`。id は「中分類番号2桁-小分類の並び順」（例：入出力デバイス = `03-4`）
- 形式は `src/types.ts` の `Topic` を参照。ファイルを置くだけで一覧・検索・シャッフルに反映される
- 範囲は IPA「基本情報技術者試験 シラバス Ver.9.2」（2026年1月8日掲載）に合わせる。シラバスの用語例に無い頻出語は、`needsReview` と reviewNote でその旨を示す
- 英語の略称の元の言葉は `content/abbr.json` に書く。画面では各文の最初の1回に自動で添える（クイズの選択肢には添えない）。分野で意味が変わる略称は `by` に小分類 id や中分類番号ごとの意味を書く
- 自信のない記述には `"needsReview": true` と `"reviewNote": "何が不確かか"` を付ける（画面に「要確認」と表示）
- 説明・カード・クイズはオリジナルで書く（他サイトや市販教材の文をコピーしない）

## 公開（GitHub Pages）

`main` ブランチに push すると、`.github/workflows/deploy.yml` がビルドして GitHub Pages に公開する。
初回だけ、リポジトリの Settings → Pages で Source を「GitHub Actions」にする。

## 進捗の保存

ブラウザの localStorage（キー `fe-a-cram:progress:v1`）。使えない環境でもエラーにならず、その場合は保存されないだけ。
