# UI部品図鑑 — 作業の案内

## 必読（作業の条件に当てはまるときだけ読む）

- 部品・頼み方の例・見分け方を足す／直す: `README.md` の「開発」と `src/lib/parts.ts` の先頭コメント
- 見た目を変える: `/Users/mashihara/.codex/guidelines/ui-visual-design.md`
- 公開・告知: `docs/launch.md`（X記事の下書きと公開手順）

## 続けて守ること

- サイトの目的は「部品の正式な名前を知り、名前でAIに頼めるようにする」こと。見た目の調整機能（つまみ）は「難しそうに見える・目的が違う」として 2026-10-16 に廃止した。戻さない
- デザインは設計図（青い方眼・白い引き出し線・黄の書き込み）。Motion Prompt（温かいオフホワイト・左に黒の大見出し・淡い角丸カード）に似せない
- 名前・意味・頼み方の例の正本は `src/lib/parts.ts`。見本の demo と頼み方の例の内容をそろえる（例：ダイアログの例が削除なら見本も削除の確認）
- 部品の名前は、現場で実際に使われる呼び方にする。造語や直訳をしない。似た名前は `CONFUSIONS` に見分け方を足す
- 見本のCSSのリセットは `:where(.kit)` で優先度0にする（`.kit button` と書くと部品の太さ指定が負ける。2026-10-16 に検出）
- 図面の部品の位置を変えるCSSは `.spot.クラス名` の2クラスで書く（1クラスだと後に書いた `.spot { position: relative }` に負けて浮かない。2026-10-17 にトーストがフッターに重なった）。部品どうしの重なりは e2e の overlap で検査する
- 図面では1つの部品に1つの名前を付ける（ツールチップの札とハートのアイコンボタンを1つにまとめて名前を付けたら「これ何？」と聞かれた。2026-10-18）。狭い幅の札どうしの重なりは e2e で検査する
- 変更後は `npm run build` → `npx playwright test`（全43部品の見本・引き出し線の重なりとはみ出し・スマホ幅も検査する）

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
