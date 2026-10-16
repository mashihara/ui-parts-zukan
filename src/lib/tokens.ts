// 全体の雰囲気（デザイントークン）の定義。
// 画面のつまみ・見本のCSS変数・AIへの指示文は、すべてこのファイルの値から作る。
// React に依存しない（scripts/build-api.ts からも読むため）。

export type Opt = { v: string; label: string; note?: string };

export type GlobalKnob = {
  key: keyof Tokens;
  label: string;
  hint: string;
  kind: "stops" | "color";
  options: Opt[];
};

export type Tokens = {
  accent: string; // 6桁の16進（# なし）
  theme: string; // light | dark
  tone: string; // neutral | warm | cool
  radius: string;
  space: string;
  shadow: string;
  border: string;
  fs: string;
  fw: string;
  font: string;
  speed: string;
  ease: string;
};

export const DEFAULT_TOKENS: Tokens = {
  accent: "2563eb",
  theme: "light",
  tone: "neutral",
  radius: "8",
  space: "1",
  shadow: "1",
  border: "1",
  fs: "16",
  fw: "700",
  font: "gothic",
  speed: "200",
  ease: "smooth",
};

export const ACCENTS: Opt[] = [
  { v: "2563eb", label: "青" },
  { v: "1e3a8a", label: "紺" },
  { v: "0f766e", label: "青緑" },
  { v: "15803d", label: "緑" },
  { v: "ca8a04", label: "からし" },
  { v: "ea580c", label: "橙" },
  { v: "dc2626", label: "赤" },
  { v: "db2777", label: "桃" },
  { v: "7c3aed", label: "紫" },
  { v: "27272a", label: "墨" },
];

export const FONTS: Record<string, { label: string; css: string; name: string }> = {
  gothic: { label: "ゴシック", css: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif", name: "Zen Kaku Gothic New（角ゴシック）" },
  maru: { label: "丸ゴシック", css: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif", name: "Zen Maru Gothic（丸ゴシック）" },
  mincho: { label: "明朝", css: "'Zen Old Mincho', 'Hiragino Mincho ProN', serif", name: "Zen Old Mincho（明朝）" },
};

export const EASES: Record<string, { label: string; css: string; name: string }> = {
  smooth: { label: "なめらか", css: "cubic-bezier(0.2, 0.8, 0.2, 1)", name: "なめらかに減速（ease-out）" },
  standard: { label: "きっちり", css: "cubic-bezier(0.4, 0, 0.2, 1)", name: "加速して減速（ease-in-out）" },
  bouncy: { label: "弾む", css: "cubic-bezier(0.34, 1.56, 0.64, 1)", name: "少し行き過ぎて戻る（オーバーシュート）" },
};

export const GLOBAL_KNOBS: GlobalKnob[] = [
  { key: "accent", label: "基本の色", hint: "押せる物・選択中の印に使う色", kind: "color", options: ACCENTS },
  {
    key: "theme", label: "明るさ", hint: "画面全体を明るくするか暗くするか", kind: "stops",
    options: [{ v: "light", label: "明るい", note: "ライトモード" }, { v: "dark", label: "暗い", note: "ダークモード" }],
  },
  {
    key: "tone", label: "地の色", hint: "背景の白や黒に混ぜる色み", kind: "stops",
    options: [{ v: "neutral", label: "まっさら" }, { v: "warm", label: "温かい", note: "紙のような黄み" }, { v: "cool", label: "涼しい", note: "少し青み" }],
  },
  {
    key: "radius", label: "角の丸さ", hint: "ボタン・入力欄・カードの角", kind: "stops",
    options: [
      { v: "0", label: "角ばる", note: "0px" },
      { v: "4", label: "少し", note: "4px" },
      { v: "8", label: "やや丸い", note: "8px" },
      { v: "12", label: "丸い", note: "12px" },
      { v: "20", label: "かなり丸い", note: "20px" },
      { v: "999", label: "まんまる", note: "ピル型" },
    ],
  },
  {
    key: "space", label: "ゆとり（余白）", hint: "部品の中と間のすき間", kind: "stops",
    options: [
      { v: "0.75", label: "ぎっしり", note: "×0.75" },
      { v: "1", label: "ふつう", note: "×1" },
      { v: "1.25", label: "ゆったり", note: "×1.25" },
      { v: "1.5", label: "たっぷり", note: "×1.5" },
    ],
  },
  {
    key: "shadow", label: "影（浮き具合）", hint: "カードや窓が背景から浮いて見える度合い", kind: "stops",
    options: [
      { v: "0", label: "平ら", note: "影なし" },
      { v: "1", label: "うっすら" },
      { v: "2", label: "ふんわり" },
      { v: "3", label: "浮いている" },
    ],
  },
  {
    key: "border", label: "枠線", hint: "部品のふちの線", kind: "stops",
    options: [
      { v: "0", label: "なし" },
      { v: "1", label: "細い", note: "1px" },
      { v: "2", label: "太い", note: "2px" },
    ],
  },
  {
    key: "fs", label: "文字の大きさ", hint: "本文の基準の大きさ", kind: "stops",
    options: [
      { v: "14", label: "小さめ", note: "14px" },
      { v: "16", label: "ふつう", note: "16px" },
      { v: "18", label: "大きめ", note: "18px" },
    ],
  },
  {
    key: "fw", label: "見出しの太さ", hint: "見出しとボタンの文字の太さ", kind: "stops",
    options: [
      { v: "500", label: "ふつう", note: "500" },
      { v: "700", label: "太い", note: "700" },
      { v: "900", label: "極太", note: "900" },
    ],
  },
  {
    key: "font", label: "書体", hint: "文字の形", kind: "stops",
    options: Object.entries(FONTS).map(([v, f]) => ({ v, label: f.label })),
  },
  {
    key: "speed", label: "動きの速さ", hint: "開く・切り替わる動きの長さ", kind: "stops",
    options: [
      { v: "0", label: "動かさない" },
      { v: "120", label: "きびきび", note: "0.12秒" },
      { v: "200", label: "ふつう", note: "0.2秒" },
      { v: "350", label: "ゆったり", note: "0.35秒" },
    ],
  },
  {
    key: "ease", label: "動きの性格", hint: "動きの加速・減速のしかた", kind: "stops",
    options: Object.entries(EASES).map(([v, e]) => ({ v, label: e.label })),
  },
];

// ふんいきボタン：言葉1つで全部のつまみをまとめて動かす
export const MOODS: { id: string; label: string; desc: string; tokens: Partial<Tokens> }[] = [
  { id: "standard", label: "標準", desc: "迷ったらこれ", tokens: { ...DEFAULT_TOKENS } },
  { id: "gentle", label: "やさしい", desc: "子育て・暮らし・医療", tokens: { accent: "0f766e", theme: "light", tone: "warm", radius: "20", space: "1.25", shadow: "2", border: "0", fs: "16", fw: "700", font: "maru", speed: "350", ease: "smooth" } },
  { id: "sharp", label: "きりっと", desc: "業務・管理画面・金融", tokens: { accent: "1e3a8a", theme: "light", tone: "cool", radius: "4", space: "0.75", shadow: "0", border: "1", fs: "14", fw: "700", font: "gothic", speed: "120", ease: "standard" } },
  { id: "pop", label: "元気", desc: "イベント・若い人向け・ゲーム", tokens: { accent: "db2777", theme: "light", tone: "neutral", radius: "999", space: "1", shadow: "3", border: "2", fs: "16", fw: "900", font: "maru", speed: "200", ease: "bouncy" } },
  { id: "luxury", label: "高級感", desc: "ホテル・美容・ブランド", tokens: { accent: "27272a", theme: "light", tone: "warm", radius: "0", space: "1.5", shadow: "0", border: "1", fs: "16", fw: "500", font: "mincho", speed: "350", ease: "standard" } },
  { id: "night", label: "夜", desc: "音楽・動画・開発ツール", tokens: { accent: "7c3aed", theme: "dark", tone: "cool", radius: "12", space: "1", shadow: "2", border: "1", fs: "16", fw: "700", font: "gothic", speed: "200", ease: "smooth" } },
];

// ---- 色の計算 ----
type RGB = [number, number, number];
const toRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const toHex = (c: RGB) => c.map((n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a), y = toRgb(b);
  return toHex([0, 1, 2].map((i) => x[i] * (1 - t) + y[i] * t) as RGB);
};
const lum = (hex: string) => {
  const c = toRgb(hex).map((n) => {
    const s = n / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a: string, b: string) => {
  const [l1, l2] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
};
export const isHex = (s: string) => /^[0-9a-fA-F]{6}$/.test(s);

const SURFACES: Record<string, Record<string, { bg: string; surface: string; text: string; muted: string; line: string }>> = {
  light: {
    neutral: { bg: "f4f5f7", surface: "ffffff", text: "1a1c20", muted: "5f6570", line: "e2e4e9" },
    warm: { bg: "f3f0e9", surface: "fffdf9", text: "2a2620", muted: "6e675c", line: "e6e0d4" },
    cool: { bg: "eef2f7", surface: "ffffff", text: "172033", muted: "586379", line: "dce3ec" },
  },
  dark: {
    neutral: { bg: "121317", surface: "1b1d23", text: "ecedef", muted: "9a9ea8", line: "2c2f37" },
    warm: { bg: "17140f", surface: "211d17", text: "f1ece3", muted: "a69e90", line: "352f26" },
    cool: { bg: "0f141c", surface: "172030", text: "e8eef7", muted: "93a0b4", line: "263247" },
  },
};

const SHADOWS = {
  light: ["none", "0 1px 2px rgba(16,24,40,0.08)", "0 4px 12px rgba(16,24,40,0.10), 0 1px 3px rgba(16,24,40,0.06)", "0 12px 32px rgba(16,24,40,0.16), 0 2px 6px rgba(16,24,40,0.08)"],
  dark: ["none", "0 1px 2px rgba(0,0,0,0.40)", "0 4px 14px rgba(0,0,0,0.45)", "0 14px 36px rgba(0,0,0,0.55)"],
};

// 計算済みの値。見本のCSS変数と指示文の両方で使う
export type Resolved = ReturnType<typeof resolve>;

export function resolve(t: Tokens) {
  const theme = t.theme === "dark" ? "dark" : "light";
  const s = SURFACES[theme][t.tone] ?? SURFACES[theme].neutral;
  const accent = isHex(t.accent) ? t.accent.toLowerCase() : DEFAULT_TOKENS.accent;
  // 暗い画面で暗すぎる基本の色は、地の色と見分けられるよう明るくする
  const accentUse = theme === "dark" && contrast(accent, s.surface) < 3 ? mix(accent, "ffffff", 0.35) : accent;
  const onAccent = contrast(accentUse, "ffffff") >= contrast(accentUse, "111111") ? "ffffff" : "111111";
  const r = Number(t.radius);
  const pill = r >= 999;
  const sp = Number(t.space);
  const level = Math.max(0, Math.min(3, Number(t.shadow)));
  const sh = SHADOWS[theme];
  const speed = Number(t.speed);
  return {
    theme,
    accent: accentUse,
    accentHover: mix(accentUse, theme === "dark" ? "ffffff" : "000000", 0.12),
    accentSoft: mix(s.surface, accentUse, theme === "dark" ? 0.2 : 0.1),
    onAccent,
    danger: theme === "dark" ? "f87171" : "dc2626",
    success: theme === "dark" ? "4ade80" : "15803d",
    warning: theme === "dark" ? "facc15" : "b45309",
    ...s,
    radiusRaw: r,
    pill,
    // 操作部品（ボタン・入力欄）の角
    rCtl: pill ? 999 : r,
    // 大きい面（カード・モーダル）の角。ピル型でも面は楕円にしない
    rLg: pill ? 24 : Math.round(r * 1.5),
    // 小物（バッジ・チェックボックス）の角
    rSm: pill ? 999 : Math.round(r / 2),
    sp,
    u: (n: number) => Math.round(n * 4 * sp), // 4pxを基準にした余白
    level,
    shadow: sh[level],
    // 重なる窓（モーダル等）は面より一段強い影にする
    shadowPop: level === 0 ? (theme === "dark" ? sh[2] : "0 0 0 1px rgba(16,24,40,0.10)") : sh[Math.min(3, level + 1)],
    bw: Number(t.border),
    fs: Number(t.fs),
    fw: Number(t.fw),
    font: FONTS[t.font] ?? FONTS.gothic,
    speed,
    dur: `${speed}ms`,
    sec: speed === 0 ? "0秒（動かさない）" : `${speed / 1000}秒`,
    ease: EASES[t.ease] ?? EASES.smooth,
  };
}

// 見本の部品に流すCSS変数
export function cssVars(t: Tokens): Record<string, string> {
  const R = resolve(t);
  return {
    "--k-accent": `#${R.accent}`,
    "--k-accent-hover": `#${R.accentHover}`,
    "--k-accent-soft": `#${R.accentSoft}`,
    "--k-on-accent": `#${R.onAccent}`,
    "--k-danger": `#${R.danger}`,
    "--k-success": `#${R.success}`,
    "--k-warning": `#${R.warning}`,
    "--k-bg": `#${R.bg}`,
    "--k-surface": `#${R.surface}`,
    "--k-text": `#${R.text}`,
    "--k-muted": `#${R.muted}`,
    "--k-line": `#${R.line}`,
    "--k-r": `${R.rCtl}px`,
    "--k-r-lg": `${R.rLg}px`,
    "--k-r-sm": `${R.rSm}px`,
    "--k-sp": `${R.sp}`,
    "--k-shadow": R.shadow,
    "--k-shadow-pop": R.shadowPop,
    "--k-bw": `${R.bw}px`,
    // 枠線なしでも入力欄の形は見えるよう、入力欄だけは最低1pxにする
    "--k-bw-field": `${Math.max(1, R.bw)}px`,
    "--k-fs": `${R.fs}px`,
    "--k-fw": `${R.fw}`,
    "--k-font": R.font.css,
    "--k-dur": R.dur,
    "--k-ease": R.ease.css,
  };
}

const optLabel = (key: keyof Tokens, v: string) => GLOBAL_KNOBS.find((k) => k.key === key)?.options.find((o) => o.v === v)?.label ?? v;

// 指示文の「全体の雰囲気」の行
export function globalSpec(t: Tokens): string[] {
  const R = resolve(t);
  const accentName = ACCENTS.find((a) => a.v === t.accent.toLowerCase())?.label;
  const lines = [
    `基本の色: #${R.accent.toUpperCase()}${accentName ? `（${accentName}）` : ""}。押せる物・選択中の印・リンクに使う。上に載せる文字は #${R.onAccent.toUpperCase()}。淡い背景には #${R.accentSoft.toUpperCase()}`,
    `明るさ: ${R.theme === "dark" ? "暗い画面（ダークモード）" : "明るい画面（ライトモード）"}。地の色は${optLabel("tone", t.tone)}。ページ背景 #${R.bg.toUpperCase()}、カード等の面 #${R.surface.toUpperCase()}、文字 #${R.text.toUpperCase()}、補足の文字 #${R.muted.toUpperCase()}、区切り線 #${R.line.toUpperCase()}`,
    R.pill
      ? `角の丸さ: まんまる。ボタン・入力欄・バッジは高さの半分の丸み（ピル型）、カード・モーダルなど大きい面は24px`
      : `角の丸さ: ${optLabel("radius", t.radius)}。ボタン・入力欄は${R.rCtl}px、カード・モーダルなど大きい面は${R.rLg}px、バッジ・チェックボックスなど小物は${R.rSm}px`,
    `ゆとり（余白）: ${optLabel("space", t.space)}。4pxの×${R.sp}倍を1単位にする（1単位=${R.u(1)}px）。部品の中の余白・部品同士の間をこの倍数でそろえる`,
    R.level === 0
      ? `影: なし（平ら）。面は影でなく背景色の差と区切り線で分ける`
      : `影: ${optLabel("shadow", t.shadow)}。カードは box-shadow: ${R.shadow}。モーダル等の重なる窓は box-shadow: ${R.shadowPop}`,
    R.bw === 0 ? `枠線: なし。ただし入力欄だけは1pxの線 #${R.line.toUpperCase()} で形を見せる` : `枠線: ${R.bw}px・色 #${R.line.toUpperCase()}`,
    `文字: 書体は ${R.font.name}。本文 ${R.fs}px・行の高さ1.6。見出しとボタンの太さ ${R.fw}`,
    R.speed === 0
      ? `動き: 動かさない。開く・切り替わるときもアニメーションを付けない`
      : `動き: 開く・切り替わる動きは ${R.sec}、イージングは${R.ease.name} = ${R.ease.css}。OSの「視差効果を減らす」（prefers-reduced-motion）が有効なら動きを止める`,
  ];
  return lines;
}

export function cssBlock(t: Tokens): string {
  const v = cssVars(t);
  return [":root {", ...Object.entries(v).map(([k, val]) => `  ${k.replace("--k-", "--")}: ${val};`), "}"].join("\n");
}
