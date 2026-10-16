// AIが読むための静的ファイルを public/ に書き出す。
//   public/llms.txt                 サイトの説明・URLの書き方・全部品の名前
//   public/api/v1/catalog.json      同じ内容の機械向けデータ
//   public/api/v1/parts/<id>.txt    部品ごとの説明と、既定の見た目での指示文
// 実行: node scripts/build-api.ts（Node 22.18 以上。型注釈はそのまま読める）
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_TOKENS, GLOBAL_KNOBS, MOODS, resolve } from "../src/lib/tokens.ts";
import { CATEGORIES, CONFUSIONS, PARTS, defaultOpts, partSpec } from "../src/lib/parts.ts";
import { buildPrompt, SITE_NAME } from "../src/lib/prompt.ts";
import { initialState } from "../src/lib/state.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// 公開先のURL（例: https://example.com/ui-knobs）。無ければ相対パスで書く
const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
const url = (path: string) => (site ? `${site}/${path}` : path);
const out = (rel: string, body: string) => {
  const p = join(root, "public", rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
};

const R = resolve(DEFAULT_TOKENS);

// ---- catalog.json ----
const catalog = {
  name: SITE_NAME,
  nameEn: "UI Knobs",
  description: "UI部品の名前の辞書と、見た目を言葉のつまみで調整してAIへの指示文にする道具。",
  version: 1,
  urlFormat: {
    base: site || "/",
    example: "?accent=db2777&radius=999&pick=button,modal&button=variant:outline;size:lg&part=button",
    rules: [
      "全体のつまみはキー=値。既定値なら省略する",
      "pick に指示へ入れる部品の id をカンマ区切りで選んだ順に書く",
      "部品のつまみは「部品id=キー:値;キー:値」",
      "part は最初に開く部品の id",
    ],
  },
  globalKnobs: GLOBAL_KNOBS.map((k) => ({ key: k.key, label: k.label, hint: k.hint, default: DEFAULT_TOKENS[k.key], options: k.options })),
  moods: MOODS.map((m) => ({ id: m.id, label: m.label, desc: m.desc, tokens: m.tokens })),
  categories: CATEGORIES,
  parts: PARTS.map((p) => ({
    id: p.id,
    category: p.cat,
    ja: p.ja,
    en: p.en,
    aka: p.aka ?? [],
    meaning: p.meaning,
    when: p.when,
    knobs: p.knobs.map((k) => ({ key: k.key, label: k.label, default: k.def, options: k.options })),
    defaultSpec: partSpec(p, {}, R).lines,
    text: url(`api/v1/parts/${p.id}.txt`),
    open: url(`?part=${p.id}`),
  })),
  confusions: CONFUSIONS,
};
out("api/v1/catalog.json", JSON.stringify(catalog, null, 2) + "\n");

// ---- 部品ごとの説明 ----
for (const p of PARTS) {
  const st = { ...initialState(), picks: [p.id], opts: { [p.id]: defaultOpts(p) } };
  const lines = [
    `${p.ja}（${p.en}）`,
    `${SITE_NAME} · 部品の名前 · id: ${p.id}`,
    "",
    `ひとこと: ${p.meaning}`,
    `使いどころ: ${p.when}`,
    p.aka?.length ? `別名: ${p.aka.join("、")}` : "",
    "",
    "調整できるつまみ（URLでは 部品id=キー:値）:",
    ...(p.knobs.length ? p.knobs.map((k) => `- ${k.label}（${k.key}）: ${k.options.map((o) => `${o.v}=${o.label}`).join(" / ")}`) : ["- なし（全体の雰囲気だけで決まる）"]),
    "",
    ...CONFUSIONS.filter((c) => c.parts.includes(p.id)).flatMap((c) => [`まぎらわしい名前（${c.title}）: ${c.rule}`, ""]),
    "---- 既定の見た目での指示文 ----",
    buildPrompt(st, url(`?pick=${p.id}&part=${p.id}`), { css: false }),
    "",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));
  out(`api/v1/parts/${p.id}.txt`, lines.join("\n"));
}

// ---- llms.txt ----
const llms = [
  `# ${SITE_NAME}（UI Knobs）`,
  "",
  "> UI部品の名前の辞書と、見た目を言葉のつまみで調整してAIへの指示文にする道具です。",
  "> 利用者は画面の部品を押して正式な名前を知り、角の丸さ・余白・影などを選び、名前と数値の入った指示文やリンクをAIに渡します。",
  "",
  "## AIへのお願い",
  "",
  "- 利用者から「?accent=…&pick=…」の付いたこのサイトのリンクを渡されたら、下の「URLの書き方」で読み解き、その見た目で作ってください。",
  "- 部品は下の一覧の正式な名前で呼んでください。名前があいまいな依頼（「上の帯」「出てくる窓」）は、一覧の名前に置き換えて確かめてください。",
  "- 数値（px・色・秒）はそのまま使い、文言・中身・画像だけを作っている物に合わせてください。既にUIライブラリを使っているなら、その仕組みの中で同じ見た目にしてください。",
  "",
  "## データ",
  "",
  `- [catalog.json](${url("api/v1/catalog.json")}): 全部品・全つまみ・まぎらわしい名前の機械向けデータ`,
  `- 部品ごとの説明と指示文: ${url("api/v1/parts/<id>.txt")}（例: [modal](${url("api/v1/parts/modal.txt")})）`,
  "",
  "## URLの書き方",
  "",
  ...catalog.urlFormat.rules.map((r) => `- ${r}`),
  `- 例: ${url(catalog.urlFormat.example)}`,
  "",
  "全体のつまみ（キー: 値=意味、先頭が既定）:",
  "",
  ...GLOBAL_KNOBS.map((k) => `- ${k.key}（${k.label}）: ${k.kind === "color" ? "6桁の16進カラー（#なし）。" : ""}${[...k.options].sort((a, b) => (a.v === DEFAULT_TOKENS[k.key] ? -1 : b.v === DEFAULT_TOKENS[k.key] ? 1 : 0)).map((o) => `${o.v}=${o.label}${o.note ? `(${o.note})` : ""}`).join(" / ")}`),
  "",
  "## 部品の名前",
  "",
  ...CATEGORIES.flatMap((c) => [
    `### ${c.label}`,
    "",
    ...PARTS.filter((p) => p.cat === c.id).map((p) => `- ${p.ja}（${p.en}, id: ${p.id}）: ${p.meaning}${p.aka?.length ? `。別名 ${p.aka.join("、")}` : ""}`),
    "",
  ]),
  "## まぎらわしい名前",
  "",
  ...CONFUSIONS.map((c) => `- ${c.title}: ${c.rule}`),
  "",
];
out("llms.txt", llms.join("\n"));

console.log(`書き出し: llms.txt・catalog.json・部品 ${PARTS.length} 件`);
