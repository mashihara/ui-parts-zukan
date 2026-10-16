# UIつまみ — 作業の案内

## 必読（作業の条件に当てはまるときだけ読む）

- 部品・つまみ・指示文を足す／直す: `README.md` の「開発」と `src/lib/parts.ts` の先頭コメント
- 見た目を変える: `/Users/mashihara/.codex/guidelines/ui-visual-design.md`
- 公開・告知: `docs/launch.md`（X記事の下書きと公開手順）

## 続けて守ること

- 名前・数値の正本は `src/lib/parts.ts` と `src/lib/tokens.ts`。見本（previews.tsx）は同じ数値表を読む。指示文と見本の数値を別々に書かない
- 部品の名前は、現場で実際に使われる呼び方にする。造語や直訳をしない。似た名前は `CONFUSIONS` に見分け方を足す
- 見本のCSSのリセットは `:where(.kit)` で優先度0にする（`.kit button` と書くと部品の太さ指定が負ける。2026-10-16 に検出）
- 変更後は `npm run build` → `npx playwright test`（全43部品の見本がエラーなく出るかも検査する）

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
