# UI部品図鑑

https://mashiharalab.dev/ui-parts-zukan/

**その部品、なんて呼ぶ？** UI部品の正式な名前が分かる、図面の形をした辞書です。

- 「上の帯」「出てくる窓」ではAIに伝わりません。見本の画面に図面の引き出し線で名前を書き込みました。ヘッダー・モーダル・ダイアログ・ラジオボタン・日付ピッカー・カルーセルなどの部品53個と、カラム・sticky・グリッド・フレックスボックスなど画面の組み方のことば15個、合わせて68個の名前が分かります。
- 名前を押すと、意味・使いどころ・動く見本・そのまま使える「AIへの頼み方の例」が出ます。
- モーダルとダイアログ、トーストとアラートなど、取り違えやすい名前の見分け方も載せています。
- 選んだ名前は、意味と頼み方の例が入った文にしてAIへ渡せます。

考え方は大滝昇平さんの [Motion Prompt](https://showheyohtaki.github.io/motion-prompt/)（動きの名前のライブラリ）から学びました。

スマホアプリの部品（タブバー・ボトムシート・スナックバーなど）は、姉妹サイトの [アプリ部品図鑑](https://mashiharalab.dev/app-parts-zukan/)（リポジトリ mashihara/app-parts-zukan）で調べられます。2つの図鑑は同じ形で、上の帯の「Web／アプリ」の切り替えで行き来できます。

## AIに読ませる

| 物 | 中身 |
|---|---|
| `/llms.txt` | サイトの説明・全部品の名前・まぎらわしい名前 |
| `/api/v1/catalog.json` | 同じ内容の機械向けデータ |
| `/api/v1/parts/<id>.txt` | 部品ごとの説明と頼み方の例 |
| `skills/ui-parts-zukan/SKILL.md` | Claude Code・Codex 用のスキル（`npx skills add mashihara/ui-parts-zukan`） |

リンクの形: `?pick=modal,toast&part=modal`（pick＝選んだ部品、part＝開く部品）

## 開発

Node 22.18 以上（`.node-version` は 24.20.0）。

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # out/ に静的書き出し（llms.txt と api/ も生成）
npx playwright test
```

- 名前・意味・頼み方の例の正本は `src/lib/parts.ts`。見本は `src/components/previews.tsx` と `kit.css`、図面は `ScreenMap.tsx`。
- サブパスで公開するときは `NEXT_PUBLIC_BASE_PATH=/ui-parts-zukan`、`llms.txt` に絶対URLを書くときは `SITE_URL=https://…` を付けてビルドする。

## ライセンス

MIT
