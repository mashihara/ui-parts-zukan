// AIが読むための静的ファイルを public/ に書き出す。
//   public/llms.txt                 サイトの説明・全部品の名前・まぎらわしい名前
//   public/api/v1/catalog.json      同じ内容の機械向けデータ
//   public/api/v1/parts/<id>.txt    部品ごとの説明と頼み方の例
// 実行: node scripts/build-api.ts（Node 22.18 以上。型注釈はそのまま読める）
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, CONFUSIONS, PARTS, shortEn } from "../src/lib/parts.ts";
import { SITE_NAME } from "../src/lib/prompt.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// 公開先のURL（例: https://example.com/ui-parts-zukan）。無ければ相対パスで書く
const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
const url = (path: string) => (site ? `${site}/${path}` : path);
const out = (rel: string, body: string) => {
  const p = join(root, "public", rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
};

// ---- catalog.json ----
const catalog = {
  name: SITE_NAME,
  description: "UI部品の正式な名前の辞書。画面のどこを何と呼ぶか、意味・使いどころ・AIへの頼み方の例をまとめたもの。",
  version: 2,
  link: { example: "?pick=modal,toast&part=modal", rules: ["pick に部品の id をカンマ区切りで選んだ順に書く", "part は最初に開く部品の id"] },
  categories: CATEGORIES,
  parts: PARTS.map((p) => ({
    id: p.id,
    category: p.cat,
    ja: p.ja,
    en: p.en,
    aka: p.aka ?? [],
    meaning: p.meaning,
    when: p.when,
    ask: p.ask,
    text: url(`api/v1/parts/${p.id}.txt`),
    open: url(`?part=${p.id}`),
  })),
  confusions: CONFUSIONS,
};
out("api/v1/catalog.json", JSON.stringify(catalog, null, 2) + "\n");

// ---- 部品ごとの説明 ----
for (const p of PARTS) {
  const lines = [
    `${p.ja}（${p.en}）`,
    `${SITE_NAME} · UI部品の名前 · id: ${p.id}`,
    "",
    `ひとこと: ${p.meaning}`,
    `使いどころ: ${p.when}`,
    ...(p.aka?.length ? [`別名: ${p.aka.join("、")}`] : []),
    `AIへの頼み方の例: ${p.ask}`,
    ...CONFUSIONS.filter((c) => c.parts.includes(p.id)).flatMap((c) => ["", `まぎらわしい名前（${c.title}）: ${c.rule}`]),
    "",
    `見本: ${url(`?part=${p.id}`)}`,
    "",
  ];
  out(`api/v1/parts/${p.id}.txt`, lines.join("\n"));
}

// ---- llms.txt ----
const llms = [
  `# ${SITE_NAME}`,
  "",
  "> UI部品の正式な名前の辞書です。見本の画面に図面のように名前を書き込み、部品ごとに意味・使いどころ・AIへの頼み方の例を載せています。",
  "> 「上の帯」「出てくる窓」のようなあいまいな言い方を、正しい名前に置き換えるために使います。",
  "",
  "## AIへのお願い",
  "",
  "- 利用者の言う部品があいまいなとき（「上の帯」「出てくる窓」など）は、下の一覧の名前に置き換えて確かめてください。",
  "- 「?pick=modal,toast」の付いたこのサイトのリンクを渡されたら、pick の id が利用者の使いたい部品です（選んだ順）。",
  "- 部品は、一覧の意味どおりに作ってください。まぎらわしい名前（モーダルとダイアログなど）は下の見分け方に従ってください。",
  "",
  "## データ",
  "",
  `- [catalog.json](${url("api/v1/catalog.json")}): 全部品・まぎらわしい名前の機械向けデータ`,
  `- 部品ごとの説明: ${url("api/v1/parts/<id>.txt")}（例: [modal](${url("api/v1/parts/modal.txt")})）`,
  "",
  "## 部品の名前",
  "",
  ...CATEGORIES.flatMap((c) => [
    `### ${c.label}`,
    "",
    ...PARTS.filter((p) => p.cat === c.id).map((p) => `- ${p.ja}（${shortEn(p)}, id: ${p.id}）: ${p.meaning}${p.aka?.length ? `。別名 ${p.aka.join("、")}` : ""}`),
    "",
  ]),
  "## まぎらわしい名前",
  "",
  ...CONFUSIONS.map((c) => `- ${c.title}: ${c.rule}`),
  "",
];
out("llms.txt", llms.join("\n"));

console.log(`書き出し: llms.txt・catalog.json・部品 ${PARTS.length} 件`);
