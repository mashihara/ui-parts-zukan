# UIつまみ（UI Knobs）

UI部品の**名前が分かり**、**つまみで見た目を決め**、それが**そのままAIへの指示文になる**サイトです。

- 「上の帯」「出てくる窓」ではAIに伝わりません。画面の地図で部品を押すと、ヘッダー・モーダル・ダイアログ・ラジオボタンなど43個の正式な名前と使いどころが分かります。
- 角の丸さ・余白・影・枠線・文字・動きを「角ばる〜まんまる」のような言葉のつまみで選べます。「やさしい」「きりっと」などの言葉1つでまとめて変えることもできます。
- 決めた見た目は、部品の名前と数値（px・色・秒・CSS変数）の入った指示文と、同じ状態を開くリンクになります。

考え方は大滝昇平さんの [Motion Prompt](https://showheyohtaki.github.io/motion-prompt/)（動きの名前のライブラリ）から学びました。UIつまみはそれをUI部品の見た目の調整に広げた別のサイトです。

## AIに読ませる

| 物 | 中身 |
|---|---|
| `/llms.txt` | サイトの説明・URLの書き方・全部品の名前・まぎらわしい名前 |
| `/api/v1/catalog.json` | 同じ内容の機械向けデータ |
| `/api/v1/parts/<id>.txt` | 部品ごとの説明と、既定の見た目での指示文 |
| `skills/ui-knobs/SKILL.md` | Claude Code・Codex 用のスキル |

リンクの形: `?accent=db2777&radius=999&pick=button,modal&button=variant:outline;size:lg&part=button`

## 開発

Node 22.18 以上（`.node-version` は 24.20.0）。

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # out/ に静的書き出し（llms.txt と api/ も生成）
npx playwright test
```

- 名前・つまみ・指示文の正本は `src/lib/parts.ts`（部品）と `src/lib/tokens.ts`（全体の雰囲気）。見本は `src/components/previews.tsx` と `kit.css`。
- サブパスで公開するときは `NEXT_PUBLIC_BASE_PATH=/ui-knobs`、`llms.txt` に絶対URLを書くときは `SITE_URL=https://…` を付けてビルドする。

## ライセンス

MIT
