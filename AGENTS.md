# UI部品図鑑 — 作業の案内

## 必読（作業の条件に当てはまるときだけ読む）

- 部品・頼み方の例・見分け方を足す／直す: `README.md` の「開発」と `src/lib/parts.ts` の先頭コメント
- 見た目を変える: `/Users/mashihara/.codex/guidelines/ui-visual-design.md`
- 公開・告知: `docs/launch.md`（X記事の下書きと公開手順）

## 続けて守ること

- サイトの目的は「部品の正式な名前を知り、名前でAIに頼めるようにする」こと。見た目の調整機能（つまみ）は「難しそうに見える・目的が違う」として 2026-10-16 に廃止した。戻さない
- デザインは白い方眼紙に青インクで描いた設計図（2026-10-19 に青地から変更。青い引き出し線、黄は蛍光ペンとして地に敷くだけで文字色に使わない）。Motion Prompt（温かいオフホワイト・左に黒の大見出し・淡い角丸カード）に似せない。地は冷たい白（#f7f9fe）のまま、温かい色にしない
- 名前・意味・頼み方の例の正本は `src/lib/parts.ts`。見本の demo と頼み方の例の内容をそろえる（例：ダイアログの例が削除なら見本も削除の確認）
- 部品の名前は、現場で実際に使われる呼び方にする。造語や直訳をしない。似た名前は `CONFUSIONS` に見分け方を足す
- 見本のCSSのリセットは `:where(.kit)` で優先度0にする（`.kit button` と書くと部品の太さ指定が負ける。2026-10-16 に検出）
- 図面の部品の位置を変えるCSSは `.spot.クラス名` の2クラスで書く（1クラスだと後に書いた `.spot { position: relative }` に負けて浮かない。2026-10-17 にトーストがフッターに重なった）。部品どうしの重なりは e2e の overlap で検査する
- 図面では1つの部品に1つの名前を付ける（ツールチップの札とハートのアイコンボタンを1つにまとめて名前を付けたら「これ何？」と聞かれた。2026-10-18）。狭い幅の札どうしの重なりは e2e で検査する
- 1400px以上では左に全部品の目次を出して3列にする（図面に引き出し線を書ける幅780pxが残る幅だけ。狭いと名前の札の表示になり見にくい）。目次は分類のアコーディオンで、開くのは1つだけ（選んだ部品の分類が開く。全部並べたら「ごちゃごちゃして難しそう」と言われた。2026-10-19）。目次・説明の列を広げるときは、図面が `.drawing.is-wide` のままか e2e で確かめる
- 目次で図面にある部品を選んだら、図面のその部品が見えるところまでページを動かす（2026-10-19 本人指示。図面に無い部品・既に見えている部品では動かさない）。説明の開閉・切り替えそのものではページを動かさない
- 部品ごとのページ（`/parts/<id>/`、`src/app/parts/[id]/page.tsx`）は、その部品を選んだ状態で書き出し、部品名を h1、「〇〇とは？…」を題にする（SEO・2026-10-19）。画面で部品を選んだときも URL のパスと h1・題をその部品に変える。canonical・サイトマップは `src/lib/site.ts` の `SITE_URL`（CI の環境変数）で絶対URLにする（相対だとサブパスが落ちる）
- 全体図に無い部品（`ScreenMap.tsx` の `MAP_PARTS` 以外）を選んだら、真ん中を単体の見本に切り替え、「画面の全体図に戻る」を置く。切り替えても全体図と同じ高さを保ち、下の一覧の位置を動かさない
- 部品を選んだら、図面の上の帯（sticky、高さ固定）に名前と意味を出し、図面では選んだ部品を山吹の角の印（L字）と薄い山吹の地で押さえる（周りを暗くする形は「ごちゃごちゃ」と言われ、9案からB-2を選んでもらった。選択は黄を地にし、青のままにしない）（「押したとき上の説明が分からない」「全体図の中で何を指しているか分かりづらい」と言われた。2026-10-19）。部品のページの見出しは、意味を大きな太字、使いどころをその下に置く
- 見た目を変えたら共有画像（`src/app/opengraph-image.png`、1200×630）も今の見た目で撮り直す
- 部品の説明は、PC幅（1100px以上）では右の列に sticky でずっと出す（重ねて開く形は PC では「モーダルにしないで」と言われた。2026-10-18）。狭い幅だけ下から重ねて開く。どちらも開閉・切り替えでページの位置を動かさない。一覧のカードは <button> にしない（中の見本にボタンがあり入れ子になる）
- 図面は文字と線を増やしすぎない。引き出し線の英語名は指した・選んだ名前だけに出し、選んでいない線は淡くする（「ごちゃごちゃして見える」と言われた。2026-10-18）。見方を説明する枠（3つ並べた凡例）を図面の上に足したら「もっとごちゃごちゃ」と言われ外した。見方は導入文の1文と右の欄の空の状態で伝える。右の欄は飾りの種類を増やさない（色の札・左の線・点線の枠を使わず、小見出しは淡い文字、ボタンは線だけ）
- 別の作業ツリーと同時に検査するときは `PW_PORT=4330 npx playwright test` のように番号を変える（4320 を他のセッションが使っていることがある）
- 変更後は `npm run build` → `npx playwright test`（全68語の見本・引き出し線の重なりとはみ出し・スマホ幅も検査する）

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
