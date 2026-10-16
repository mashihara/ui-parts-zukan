// 部品の名前帳。名前・ひとこと・つまみ・指示文の仕様を1か所で持つ。
// 見本（src/components/previews.tsx）は、ここの数値表（BTN_SIZE など）を読んで同じ寸法で描く。
// React に依存しない（scripts/build-api.ts からも読むため）。
import type { Opt, Resolved } from "./tokens.ts";

export type CatId = "layout" | "overlay" | "input" | "display" | "status";

export const CATEGORIES: { id: CatId; label: string; desc: string }[] = [
  { id: "layout", label: "画面の骨組み", desc: "画面の上下左右にいつもある場所" },
  { id: "overlay", label: "重なって出る窓", desc: "画面の上に一時的に重なる物" },
  { id: "input", label: "押す・入れる・選ぶ", desc: "利用者が操作する部品" },
  { id: "display", label: "並べて見せる", desc: "情報をまとめて見せる入れ物" },
  { id: "status", label: "状態を伝える", desc: "読み込み中・件数・お知らせ" },
];

export type PartKnob = { key: string; label: string; options: Opt[]; def: string };

export type Part = {
  id: string;
  cat: CatId;
  ja: string;
  en: string;
  aka?: string[]; // 別名・よく混ざる呼び方
  meaning: string; // ひとこと（20字前後）
  when: string; // 使いどころ
  knobs: PartKnob[];
  spec: (o: Record<string, string>, R: Resolved) => string[];
};

// def を省くと先頭の選択肢が既定になる
const k = (key: string, label: string, options: [string, string][], def?: string): PartKnob => ({
  key,
  label,
  options: options.map(([v, l]) => ({ v, label: l })),
  def: def ?? options[0][0],
});

const lab = (p: PartKnob[], key: string, v: string) => p.find((x) => x.key === key)?.options.find((o) => o.v === v)?.label ?? v;
const hx = (s: string) => `#${s.toUpperCase()}`;
const rr = (R: Resolved, kind: "ctl" | "lg" | "sm") => {
  const n = kind === "ctl" ? R.rCtl : kind === "lg" ? R.rLg : R.rSm;
  return n >= 999 ? "高さの半分（ピル型）" : `${n}px`;
};
const motion = (R: Resolved, what: string) => (R.speed === 0 ? `${what}（動きは付けずに切り替える）` : `${what}（${R.sec}・${R.ease.name}・${R.ease.css}）`);

// ---- 見本と指示文で共有する数値表 ----
export const BTN_SIZE: Record<string, { h: number; px: number; fs: number }> = {
  sm: { h: 32, px: 12, fs: 14 },
  md: { h: 40, px: 16, fs: 15 },
  lg: { h: 52, px: 24, fs: 17 },
};
export const HEADER_H: Record<string, number> = { low: 52, mid: 64, high: 76 };
export const MODAL_W: Record<string, number> = { sm: 400, md: 560, lg: 720 };
export const BACKDROP: Record<string, number> = { light: 0.3, mid: 0.5, dark: 0.7 };
export const TOAST_SEC: Record<string, number> = { "2": 2, "4": 4, "6": 6 };
export const FIELD_H = 44;
export const AVATAR: Record<string, number> = { sm: 32, md: 40, lg: 56 };

export const PARTS: Part[] = [
  // ===== 画面の骨組み =====
  {
    id: "header", cat: "layout", ja: "ヘッダー", en: "Header", aka: ["アプリバー（App bar）", "トップバー"],
    meaning: "画面のいちばん上の帯", when: "ロゴ・主なメニュー・ログインなど、どのページにも出す物を置く。",
    knobs: [
      k("bg", "背景", [["surface", "地の色"], ["accent", "基本の色"], ["blur", "透けてぼかす"]]),
      k("height", "高さ", [["low", "低い"], ["mid", "ふつう"], ["high", "高い"]], "mid"),
      k("sticky", "スクロールしたとき", [["on", "上に残る"], ["off", "一緒に流れる"]]),
    ],
    spec: (o, R) => [
      `高さ ${HEADER_H[o.height]}px。左にロゴ、中央〜右にグローバルナビ、右端にボタン`,
      o.bg === "accent" ? `背景は基本の色 ${hx(R.accent)}、文字とアイコンは ${hx(R.onAccent)}`
        : o.bg === "blur" ? `背景は面の色を不透明度0.75で敷き、backdrop-filter: blur(12px) で下の内容をぼかして透かす。下に1pxの区切り線 ${hx(R.line)}`
        : `背景は面の色 ${hx(R.surface)}、下に1pxの区切り線 ${hx(R.line)}`,
      o.sticky === "on" ? "スクロールしても画面の上に固定する（position: sticky; top: 0）" : "固定せず、スクロールと一緒に流れる",
    ],
  },
  {
    id: "global-nav", cat: "layout", ja: "グローバルナビ", en: "Navigation menu (Global navigation)", aka: ["ナビゲーションバー", "メニュー"],
    meaning: "サイトの主なページへのリンクの並び", when: "ヘッダーの中に置き、どのページからも主要なページへ移れるようにする。",
    knobs: [k("current", "今いるページの印", [["underline", "下線"], ["fill", "背景を塗る"], ["bold", "太字だけ"]])],
    spec: (o, R) => [
      `リンクを横に並べ、間は${R.u(6)}px。文字は${R.fs}px`,
      o.current === "underline" ? `今いるページは文字を基本の色 ${hx(R.accent)} にし、下に2pxの線を引く`
        : o.current === "fill" ? `今いるページは淡い背景 ${hx(R.accentSoft)} を敷き、角は${rr(R, "ctl")}`
        : `今いるページは太さ${R.fw}にするだけで、色は変えない`,
      "スマホ幅ではハンバーガーメニュー（三本線のボタン）にまとめる",
    ],
  },
  {
    id: "footer", cat: "layout", ja: "フッター", en: "Footer",
    meaning: "画面のいちばん下の帯", when: "会社情報・規約・お問い合わせ・SNSなど、補足のリンクをまとめる。",
    knobs: [
      k("layout", "並べ方", [["simple", "1行にまとめる"], ["columns", "列で並べる"]]),
      k("bg", "背景", [["surface", "地の色"], ["dark", "濃い色"]]),
    ],
    spec: (o, R) => [
      o.layout === "columns" ? `リンクを見出し付きの3列に分けて並べ、下にコピーライトの行` : `ロゴ・リンク・コピーライトを1行に並べる`,
      o.bg === "dark" ? `背景は濃い色 ${hx(R.theme === "dark" ? "0b0c0f" : "1f2228")}、文字は白の不透明度0.75` : `背景はページ背景 ${hx(R.bg)}、上に1pxの区切り線 ${hx(R.line)}、文字は補足の色 ${hx(R.muted)}`,
      `上下の余白 ${R.u(10)}px・文字 ${R.fs - 2}px`,
    ],
  },
  {
    id: "sidebar", cat: "layout", ja: "サイドバー", en: "Sidebar", aka: ["サイドナビ"],
    meaning: "画面の横に縦に並ぶメニュー", when: "管理画面など、ページの種類が多いときに左側へ常に出しておく。",
    knobs: [k("width", "幅", [["wide", "文字も出す（240px）"], ["narrow", "アイコンだけ（64px）"]])],
    spec: (o, R) => [
      o.width === "wide" ? "幅240px。アイコンと文字を1行ずつ縦に並べる" : "幅64px。アイコンだけを並べ、乗せると名前をツールチップで出す",
      `今いる項目は淡い背景 ${hx(R.accentSoft)} と基本の色の文字で示す。角は${rr(R, "ctl")}`,
      `背景は面の色 ${hx(R.surface)}、右に1pxの区切り線 ${hx(R.line)}`,
    ],
  },
  {
    id: "breadcrumb", cat: "layout", ja: "パンくずリスト", en: "Breadcrumbs",
    meaning: "今いる場所を階層で示す", when: "記事や商品の詳細ページの上に置き、上の階層へ戻れるようにする。",
    knobs: [k("sep", "区切りの記号", [["chevron", "›"], ["slash", "/"]])],
    spec: (o, R) => [
      `「ホーム ${o.sep === "slash" ? "/" : "›"} 一覧 ${o.sep === "slash" ? "/" : "›"} 今のページ」の形で横に並べる`,
      `上の階層はリンク（色 ${hx(R.accent)}）、今のページは文字色 ${hx(R.text)} でリンクにしない`,
      `文字 ${R.fs - 2}px`,
    ],
  },
  {
    id: "hero", cat: "layout", ja: "ヒーロー", en: "Hero section", aka: ["メインビジュアル", "ファーストビュー"],
    meaning: "ページ最上部の大きな見せ場", when: "サイトのトップで、何のサービスかを大きな見出しと写真で一目で伝える。",
    knobs: [k("align", "文字の位置", [["left", "左寄せ"], ["center", "中央"]])],
    spec: (o, R) => [
      `大きな見出し（本文の2.2倍・太さ${R.fw}）・説明1〜2行・主なボタン1つ`,
      o.align === "center" ? "文字とボタンを中央にそろえる" : "文字とボタンを左にそろえ、右に写真を置く",
      `上下の余白 ${R.u(16)}px`,
    ],
  },
  {
    id: "bottom-nav", cat: "layout", ja: "ボトムナビ", en: "Bottom navigation (Tab bar)", aka: ["タブバー"],
    meaning: "スマホの画面下に並ぶ切り替えボタン", when: "スマホアプリで、主な画面3〜5個を親指で切り替えられるようにする。",
    knobs: [k("labels", "文字", [["always", "いつも出す"], ["active", "選択中だけ"]])],
    spec: (o, R) => [
      "画面下に固定。3〜5個のアイコンを等間隔に並べ、高さ64px（端末の下の余白 env(safe-area-inset-bottom) を足す）",
      o.labels === "always" ? "アイコンの下に名前を11pxで出す" : "名前は選択中の項目だけに出す",
      `選択中は基本の色 ${hx(R.accent)}、ほかは補足の色 ${hx(R.muted)}`,
    ],
  },

  // ===== 重なって出る窓 =====
  {
    id: "modal", cat: "overlay", ja: "モーダル", en: "Modal", aka: ["モーダルウィンドウ"],
    meaning: "背景を暗くして中央に出る窓。閉じるまで後ろは操作できない", when: "入力・詳細表示など、今の作業を止めて1つのことに集中させたいとき。",
    knobs: [
      k("size", "幅", [["sm", "小（400px）"], ["md", "中（560px）"], ["lg", "大（720px）"]], "md"),
      k("backdrop", "背景の暗さ", [["light", "薄い"], ["mid", "ふつう"], ["dark", "濃い"]], "mid"),
      k("motion", "出方", [["fade", "ふわっと"], ["zoom", "少し拡大"], ["up", "下から"]], "zoom"),
    ],
    spec: (o, R) => [
      `幅 ${MODAL_W[o.size]}px（スマホでは左右${R.u(4)}pxを残した幅）。中央に置き、角は${rr(R, "lg")}、影は ${R.shadowPop}`,
      `後ろ全体に黒の不透明度${BACKDROP[o.backdrop]}の幕を敷き、後ろの画面は操作できなくする。幕を押すか Esc キーで閉じる`,
      `中身: 見出し・本文・右下に主ボタンと「キャンセル」。右上に×ボタン。内側の余白 ${R.u(6)}px`,
      motion(R, o.motion === "zoom" ? "開くとき: 0.96倍から1倍へ拡大しながら現れる" : o.motion === "up" ? `開くとき: ${R.u(6)}px下から上がりながら現れる` : "開くとき: 不透明度0から1へ現れる"),
      "開いたら窓の中の最初の操作部品へフォーカスを移し、閉じたら開いたボタンへ戻す",
    ],
  },
  {
    id: "dialog", cat: "overlay", ja: "ダイアログ", en: "Dialog (Confirmation dialog)", aka: ["確認ダイアログ", "アラートダイアログ"],
    meaning: "「本当に〜しますか？」と聞いて返事を求める小窓", when: "削除・送信など取り消せない操作の前に、はい／いいえを選ばせる。",
    knobs: [
      k("buttons", "ボタンの並び", [["right", "右に寄せる"], ["full", "横いっぱいに2つ"], ["stack", "縦に積む"]]),
      k("tone", "内容", [["normal", "ふつうの確認"], ["danger", "削除など危ない操作"]]),
    ],
    spec: (o, R) => [
      `幅 400px のモーダルとして出す（後ろは黒の不透明度0.5で暗くし、操作できなくする）。角は${rr(R, "lg")}`,
      "中身は短い問いかけの見出し1行・結果を説明する本文1〜2行・ボタン2つだけ",
      o.buttons === "full" ? "ボタンは「キャンセル」「実行する」を横いっぱいに等幅で並べる" : o.buttons === "stack" ? "ボタンは縦に積み、上が実行・下がキャンセル（スマホ向き）" : "ボタンは右下に「キャンセル」「実行する」の順で並べる",
      o.tone === "danger" ? `実行ボタンは赤 ${hx(R.danger)} の塗り、文言は「削除する」のように動詞で書く` : `実行ボタンは基本の色の塗り、文言は「送信する」のように動詞で書く`,
      "背景の幕を押しても閉じない（返事を選ばせる）。Esc キーはキャンセル扱い",
    ],
  },
  {
    id: "drawer", cat: "overlay", ja: "ドロワー", en: "Drawer (Side sheet)", aka: ["オフキャンバスメニュー", "サイドシート"],
    meaning: "画面の横から引き出される縦長の窓", when: "スマホのメニューや絞り込み条件など、縦に長い中身を一時的に出す。",
    knobs: [
      k("side", "出てくる向き", [["left", "左から"], ["right", "右から"]]),
      k("width", "幅", [["narrow", "細い（280px）"], ["wide", "広い（400px）"]]),
    ],
    spec: (o, R) => [
      `${o.side === "left" ? "左" : "右"}端に、幅 ${o.width === "wide" ? 400 : 280}px・高さは画面いっぱいで出す`,
      "後ろに黒の不透明度0.4の幕を敷き、幕を押すか Esc キーで閉じる",
      motion(R, `開くとき: 画面の外から横へ滑り込む`),
      `背景は面の色 ${hx(R.surface)}、影は ${R.shadowPop}`,
    ],
  },
  {
    id: "bottom-sheet", cat: "overlay", ja: "ボトムシート", en: "Bottom sheet",
    meaning: "画面の下からせり上がる窓", when: "スマホで、並べ替え・共有先・詳細などを親指の届く位置に出す。",
    knobs: [k("height", "高さ", [["auto", "中身に合わせる"], ["half", "画面の半分"]]), k("handle", "上のつまみ", [["on", "あり"], ["off", "なし"]])],
    spec: (o, R) => [
      `画面の下に横いっぱいで出す。高さは${o.height === "half" ? "画面の50%" : "中身に合わせる（最大で画面の90%）"}`,
      `上の2つの角だけ${rr(R, "lg")}で丸める`,
      o.handle === "on" ? "上の中央に幅36px・高さ4pxの灰色のつまみを置き、下へ引くと閉じる" : "右上に×ボタンを置いて閉じる",
      motion(R, "開くとき: 下からせり上がる"),
    ],
  },
  {
    id: "popover", cat: "overlay", ja: "ポップオーバー", en: "Popover",
    meaning: "押した物のそばに出る、操作もできる小窓", when: "設定の小さな変更や詳しい説明を、画面を移らずにその場で出す。",
    knobs: [k("arrow", "吹き出しの三角", [["on", "あり"], ["off", "なし"]])],
    spec: (o, R) => [
      `押したボタンの下に${R.u(2)}px離して出す。幅は中身に合わせて最大320px`,
      `中にボタンやリンクを置いてよい。外側を押すか Esc キーで閉じる`,
      o.arrow === "on" ? "上に押した物を指す小さな三角を付ける" : "三角は付けない",
      `面の色 ${hx(R.surface)}・角${rr(R, "lg")}・影 ${R.shadowPop}`,
    ],
  },
  {
    id: "tooltip", cat: "overlay", ja: "ツールチップ", en: "Tooltip",
    meaning: "カーソルを乗せると出る、短い説明の札", when: "アイコンだけのボタンに名前を添えるなど、ひとことの補足に使う。",
    knobs: [k("style", "色", [["dark", "濃い"], ["light", "白"]])],
    spec: (o, R) => [
      `カーソルを乗せて0.3秒後、またはキーボードでフォーカスしたときに、上に出す。離れたら消す`,
      o.style === "dark" ? `背景 ${hx(R.theme === "dark" ? "e5e7eb" : "1f2937")}・文字 ${hx(R.theme === "dark" ? "111827" : "ffffff")}` : `背景は面の色・1pxの線 ${hx(R.line)}・影 ${R.shadow === "none" ? "なし" : R.shadow}`,
      `文字 13px・1行だけ。中にボタンやリンクは置かない`,
    ],
  },
  {
    id: "toast", cat: "overlay", ja: "トースト", en: "Toast (Snackbar)", aka: ["スナックバー"],
    meaning: "画面の端に出て自動で消える短い通知", when: "「保存しました」など、操作の結果を作業を止めずに知らせる。",
    knobs: [
      k("pos", "出る場所", [["bottom", "下の中央"], ["corner", "右下"], ["top", "上の中央"]]),
      k("style", "色", [["dark", "濃い"], ["light", "白"]]),
      k("sec", "消えるまで", [["2", "2秒"], ["4", "4秒"], ["6", "6秒"]], "4"),
    ],
    spec: (o, R) => [
      `${o.pos === "corner" ? "右下" : o.pos === "top" ? "上の中央" : "下の中央"}に、画面の端から${R.u(6)}px離して出す`,
      o.style === "dark" ? `背景 ${hx(R.theme === "dark" ? "e5e7eb" : "1f2937")}・文字 ${hx(R.theme === "dark" ? "111827" : "ffffff")}` : `背景は面の色・1pxの線 ${hx(R.line)}・影 ${R.shadowPop}`,
      `${TOAST_SEC[o.sec]}秒後に自動で消える。右端に「元に戻す」などの操作を1つまで置ける`,
      motion(R, "出るとき: 端の方から少し滑りながら現れる"),
      `読み上げソフトに伝わるよう role="status" を付ける`,
    ],
  },
  {
    id: "dropdown-menu", cat: "overlay", ja: "ドロップダウンメニュー", en: "Dropdown menu (Menu)", aka: ["プルダウンメニュー", "コンテキストメニュー"],
    meaning: "押すと下に操作の一覧が開く", when: "「編集・複製・削除」のように、1つの対象に対する操作をまとめる。",
    knobs: [k("icons", "アイコン", [["on", "付ける"], ["off", "付けない"]])],
    spec: (o, R) => [
      `「…」などのボタンの下に、操作を縦に並べた一覧を開く。1行の高さ${Math.round(36 * R.sp)}px`,
      o.icons === "on" ? "各行の左に16pxのアイコンを付ける" : "文字だけを並べる",
      `乗せた行は淡い背景 ${hx(R.accentSoft)}。削除のような危ない操作は最後に区切り線を挟み赤 ${hx(R.danger)} の文字`,
      "選ぶか外側を押すと閉じる。矢印キーで行を移れる",
    ],
  },

  // ===== 押す・入れる・選ぶ =====
  {
    id: "button", cat: "input", ja: "ボタン", en: "Button",
    meaning: "押すと何かが起きる部品", when: "送信・保存・次へなど、操作のきっかけ。1画面で一番大事な操作だけを塗りにする。",
    knobs: [
      k("variant", "種類", [["filled", "塗り"], ["outline", "枠線"], ["tonal", "淡い塗り"], ["text", "文字だけ"]]),
      k("size", "大きさ", [["sm", "小"], ["md", "中"], ["lg", "大"]], "md"),
      k("width", "幅", [["auto", "文字に合わせる"], ["full", "横いっぱい"]]),
    ],
    spec: (o, R) => {
      const s = BTN_SIZE[o.size];
      const v = {
        filled: `塗りボタン（Filled / Primary button）。背景は基本の色 ${hx(R.accent)}、文字 ${hx(R.onAccent)}`,
        outline: `枠線ボタン（Outlined / Secondary button）。背景は透明、1.5pxの線と文字は基本の色 ${hx(R.accent)}`,
        tonal: `淡い塗りボタン（Tonal button）。背景 ${hx(R.accentSoft)}、文字は基本の色 ${hx(R.accent)}`,
        text: `文字だけのボタン（Text button）。背景も線もなく、文字は基本の色 ${hx(R.accent)}`,
      }[o.variant];
      return [
        `種類: ${v}`,
        `高さ ${s.h}px・左右の余白 ${s.px}px・文字 ${s.fs}px・太さ ${R.fw}・角 ${rr(R, "ctl")}${o.width === "full" ? "・幅は横いっぱい（100%）" : "・幅は文字に合わせる"}`,
        `乗せたとき: 背景を${o.variant === "filled" ? `${hx(R.accentHover)} に` : "淡い基本の色に"}変える。押した瞬間は0.98倍に縮める（${R.sec}）`,
        "使えないとき: 不透明度0.45にし、押しても反応しない。フォーカス時は基本の色の2pxの輪郭線を2px外側に出す",
      ];
    },
  },
  {
    id: "icon-button", cat: "input", ja: "アイコンボタン", en: "Icon button",
    meaning: "絵だけのボタン", when: "閉じる×・設定の歯車・いいねなど、絵で意味が通じる操作に。",
    knobs: [k("shape", "形", [["circle", "丸"], ["rounded", "角丸の四角"]]), k("style", "見た目", [["ghost", "背景なし"], ["tonal", "淡い塗り"], ["filled", "塗り"]])],
    spec: (o, R) => [
      `40×40pxの${o.shape === "circle" ? "円" : `角${rr(R, "ctl")}の四角`}の中に20pxのアイコン`,
      o.style === "filled" ? `背景は基本の色 ${hx(R.accent)}・アイコン ${hx(R.onAccent)}` : o.style === "tonal" ? `背景 ${hx(R.accentSoft)}・アイコンは基本の色` : `背景なし・アイコンは文字色。乗せると淡い灰色の背景`,
      "絵だけでは名前が伝わらないので aria-label を必ず付け、乗せたらツールチップで名前を出す",
    ],
  },
  {
    id: "fab", cat: "input", ja: "FAB", en: "Floating action button (FAB)", aka: ["フローティングアクションボタン"],
    meaning: "画面の右下に浮かぶ丸い主ボタン", when: "スマホで「新しく作る」など、その画面で一番よく使う操作を1つだけ置く。",
    knobs: [k("label", "文字", [["off", "アイコンだけ"], ["on", "文字も付ける"]])],
    spec: (o, R) => [
      o.label === "on" ? "高さ56px、＋アイコンと「新規作成」の文字を横に並べた横長の形" : "56×56pxの円の中に＋アイコン24px",
      `画面の右下から${R.u(4)}px離して固定。背景は基本の色 ${hx(R.accent)}・アイコン ${hx(R.onAccent)}`,
      `影 ${R.shadowPop}。1画面に1つだけ`,
    ],
  },
  {
    id: "text-field", cat: "input", ja: "テキストフィールド", en: "Text field (Input)", aka: ["入力欄", "フォーム", "テキストボックス"],
    meaning: "1行の文字を入れる欄", when: "名前・メール・電話番号など短い文字の入力。",
    knobs: [
      k("style", "見た目", [["outline", "枠で囲む"], ["filled", "灰色で塗る"], ["underline", "下線だけ"]]),
      k("label", "項目名の位置", [["top", "欄の上"], ["float", "欄の中に浮かぶ"]]),
      k("state", "見本の状態", [["normal", "ふつう"], ["error", "エラー"]]),
    ],
    spec: (o, R) => [
      `高さ ${FIELD_H}px・左右の余白 ${R.u(3)}px・文字 ${R.fs}px`,
      o.style === "filled" ? `背景は淡い灰色、下だけに線。角は上だけ ${rr(R, "ctl")}` : o.style === "underline" ? "背景も囲みもなく、下に1pxの線だけ" : `面の色の背景を ${Math.max(1, R.bw)}px の線 ${hx(R.line)} で囲む。角 ${rr(R, "ctl")}`,
      o.label === "float" ? "項目名は空のとき欄の中に置き、入力を始めたら上へ小さく（12px）移す（フローティングラベル）" : `項目名は欄の上に${R.fs - 2}px・太さ${R.fw}で置き、${R.u(1.5)}px空ける`,
      `入力中（フォーカス）は線を基本の色 ${hx(R.accent)} の2pxにする`,
      `エラーのときは線と下の説明文を赤 ${hx(R.danger)} にし、「メールアドレスの形で入れてください」のように直し方を書く${o.state === "error" ? "（見本はエラー表示）" : ""}`,
    ],
  },
  {
    id: "textarea", cat: "input", ja: "テキストエリア", en: "Textarea",
    meaning: "何行も文字を入れられる欄", when: "お問い合わせ内容・感想など、長い文章の入力。",
    knobs: [k("count", "文字数の表示", [["on", "右下に出す"], ["off", "出さない"]])],
    spec: (o, R) => [
      `テキストフィールドと同じ線・角（${rr(R, "ctl")}）で、高さは4行分（約120px）。縦にだけ広げられる`,
      o.count === "on" ? "右下に「120 / 500」のように今の文字数と上限を出す" : "文字数は出さない",
    ],
  },
  {
    id: "select", cat: "input", ja: "セレクトボックス", en: "Select (Dropdown list)", aka: ["プルダウン", "ドロップダウンリスト"],
    meaning: "押すと選択肢が開き、1つを選ぶ欄", when: "都道府県・並び順など、決まった選択肢が5個以上あるとき。",
    knobs: [k("native", "開いた一覧", [["custom", "サイトの見た目で作る"], ["native", "端末の標準を使う"]])],
    spec: (o, R) => [
      `見た目はテキストフィールドと同じ高さ${FIELD_H}px・角${rr(R, "ctl")}で、右端に下向きの矢印`,
      o.native === "native" ? "一覧は端末標準の <select> を使う（スマホで選びやすい）" : `一覧は欄のすぐ下に開き、選択中の行に✓と淡い背景 ${hx(R.accentSoft)}`,
      "選択肢が4個以下ならラジオボタンを使う方が一目で分かる",
    ],
  },
  {
    id: "search", cat: "input", ja: "検索バー", en: "Search bar (Search field)", aka: ["検索ボックス"],
    meaning: "虫めがねの付いた検索の入力欄", when: "ヘッダーや一覧の上に置き、言葉で絞り込ませる。",
    knobs: [k("shape", "形", [["field", "入力欄と同じ"], ["pill", "まんまる"]])],
    spec: (o, R) => [
      `高さ ${FIELD_H}px、左に18pxの虫めがね、右に入力があるときだけ×（消す）ボタン`,
      o.shape === "pill" ? "角は高さの半分（ピル型）、背景は淡い灰色で線なし" : `角 ${rr(R, "ctl")}、テキストフィールドと同じ線`,
      "Enter で検索。入力中に候補を出すなら欄の下に一覧で出す",
    ],
  },
  {
    id: "checkbox", cat: "input", ja: "チェックボックス", en: "Checkbox",
    meaning: "四角に✓を付ける。いくつでも選べる", when: "「規約に同意する」や、複数の条件を同時に選ばせるとき。",
    knobs: [k("size", "大きさ", [["md", "ふつう（20px）"], ["lg", "大きい（24px）"]])],
    spec: (o, R) => [
      `${o.size === "lg" ? 24 : 20}pxの四角・角 ${R.rSm >= 999 ? "6px" : `${Math.min(R.rSm, 6)}px`}。右に${R.u(2)}px空けて項目名`,
      `選んだら基本の色 ${hx(R.accent)} で塗り、白い✓を出す。選んでいないときは2pxの線 ${hx(R.muted)}`,
      "項目名を押しても切り替わるよう <label> で包む",
    ],
  },
  {
    id: "radio", cat: "input", ja: "ラジオボタン", en: "Radio button (Radio group)",
    meaning: "丸を1つだけ選ぶ。選ぶとほかが外れる", when: "配送方法・プランなど、4個以下の選択肢から必ず1つを選ばせるとき。",
    knobs: [k("layout", "並べ方", [["vertical", "縦に並べる"], ["horizontal", "横に並べる"], ["card", "カードで並べる"]])],
    spec: (o, R) => [
      `20pxの円。選んだものは基本の色 ${hx(R.accent)} の線と中心の8pxの点`,
      o.layout === "card" ? `選択肢ごとに角${rr(R, "lg")}の枠で囲み、選んだ枠は2pxの基本の色の線と淡い背景 ${hx(R.accentSoft)}` : o.layout === "horizontal" ? `選択肢を横に並べ、間は${R.u(6)}px` : `選択肢を縦に並べ、間は${R.u(3)}px`,
      "グループ全体に見出しを付け（<fieldset> と <legend>）、矢印キーで選び直せるようにする",
    ],
  },
  {
    id: "toggle", cat: "input", ja: "トグルスイッチ", en: "Switch (Toggle switch)", aka: ["スイッチ"],
    meaning: "オン・オフを押した瞬間に切り替える", when: "通知のオン・オフなど、押してすぐ効く設定。保存ボタンが要る設定にはチェックボックスを使う。",
    knobs: [k("size", "大きさ", [["md", "ふつう"], ["lg", "大きい"]]), k("on", "オンの色", [["accent", "基本の色"], ["green", "緑"]])],
    spec: (o, R) => [
      o.size === "lg" ? "幅52px・高さ32px・つまみ26px" : "幅44px・高さ26px・つまみ20px",
      `オンは${o.on === "green" ? `緑 ${hx(R.success)}` : `基本の色 ${hx(R.accent)}`}、オフは灰色。つまみは白の円`,
      motion(R, "切り替え: つまみが横に滑る"),
      `role="switch" と aria-checked を付ける`,
    ],
  },
  {
    id: "slider", cat: "input", ja: "スライダー", en: "Slider (Range input)", aka: ["シークバー"],
    meaning: "つまみを横に動かして値を決める", when: "音量・明るさ・価格の範囲など、だいたいの値を選ばせるとき。",
    knobs: [k("value", "値の表示", [["side", "右に数字"], ["bubble", "つまみの上に吹き出し"]])],
    spec: (o, R) => [
      `線の太さ4px、選んだ範囲は基本の色 ${hx(R.accent)}、残りは灰色。つまみは20pxの白い円に影`,
      o.value === "bubble" ? "動かしている間だけ、つまみの上に値の吹き出しを出す" : "右に今の値を数字で出す",
      "矢印キーで1目盛りずつ動かせるようにする",
    ],
  },
  {
    id: "segmented", cat: "input", ja: "セグメントコントロール", en: "Segmented control", aka: ["セグメントボタン"],
    meaning: "くっついたボタンで表示を切り替える", when: "「日・週・月」のように、同じ物の見せ方を2〜4個から切り替える。",
    knobs: [],
    spec: (_o, R) => [
      `高さ36px・灰色の地の中に2〜4個の選択肢を等幅で並べる。外の角 ${rr(R, "ctl")}`,
      `選択中は面の色の板と影 ${R.shadow === "none" ? "なし" : R.shadow} を敷き、文字を太さ${R.fw}に`,
      motion(R, "切り替え: 白い板が横に滑る"),
    ],
  },

  // ===== 並べて見せる =====
  {
    id: "card", cat: "display", ja: "カード", en: "Card",
    meaning: "画像と文字を1枚の札にまとめた入れ物", when: "商品・記事・お店など、同じ形の物を一覧で並べるとき。",
    knobs: [
      k("media", "画像", [["top", "上に置く"], ["left", "左に置く"], ["none", "なし"]]),
      k("hover", "乗せたとき", [["lift", "少し浮く"], ["none", "変えない"]]),
    ],
    spec: (o, R) => [
      `面の色 ${hx(R.surface)}・角 ${rr(R, "lg")}・${R.bw ? `${R.bw}pxの線 ${hx(R.line)}` : "線なし"}・影 ${R.shadow === "none" ? "なし" : R.shadow}`,
      o.media === "top" ? "上に16:9の画像、下に見出し・説明2行・小さな情報（価格など）" : o.media === "left" ? "左に正方形の画像（幅96px）、右に見出し・説明・小さな情報" : "画像なし。見出し・説明・小さな情報だけ",
      `内側の余白 ${R.u(4)}px、見出しは${R.fs + 1}px・太さ${R.fw}`,
      o.hover === "lift" ? motion(R, `乗せたとき: 上へ${R.u(1)}px浮かせ、影を一段強く`) : "乗せても見た目を変えない（押せないカード）",
      "カード全体を押せるときは、見出しのリンクを全体に広げる（カードの中にボタンを入れ子にしない）",
    ],
  },
  {
    id: "list", cat: "display", ja: "リスト", en: "List", aka: ["リストアイテム", "一覧"],
    meaning: "同じ形の行を縦に並べた一覧", when: "設定項目・メッセージ・連絡先など、1行ずつ見ていく物。",
    knobs: [k("divider", "行の区切り", [["line", "線"], ["gap", "すき間"], ["none", "なし"]]), k("density", "1行の高さ", [["compact", "低い（48px）"], ["comfort", "高い（64px）"]])],
    spec: (o, R) => [
      `1行の高さ ${o.density === "compact" ? 48 : 64}px。左にアイコンかアバター、中央に名前と補足、右に矢印か値`,
      o.divider === "line" ? `行の間に1pxの線 ${hx(R.line)}（左はアイコンの右から引く）` : o.divider === "gap" ? `行を角${rr(R, "ctl")}の板にし、${R.u(2)}pxずつ離す` : "区切りなし",
      `押せる行は乗せると淡い背景 ${hx(R.accentSoft)}`,
    ],
  },
  {
    id: "table", cat: "display", ja: "テーブル", en: "Table (Data table)", aka: ["表"],
    meaning: "行と列で数字や項目を見比べる表", when: "注文履歴・会員一覧など、項目をそろえて見比べたいとき。",
    knobs: [k("stripe", "行の色", [["off", "そろえる"], ["on", "1行おきに色"]]), k("lines", "罫線", [["row", "横線だけ"], ["grid", "格子"]])],
    spec: (o, R) => [
      `見出しの行は太さ${R.fw}・文字${R.fs - 2}px・補足の色 ${hx(R.muted)}。行の高さ ${Math.round(44 * R.sp)}px`,
      o.lines === "grid" ? `縦横とも1pxの線 ${hx(R.line)}` : `行の間にだけ1pxの線 ${hx(R.line)}`,
      o.stripe === "on" ? "偶数行に淡い灰色を敷く（ゼブラ）" : "行の背景は変えない",
      "数字の列は右寄せ、文字の列は左寄せ。スマホでは横にスクロールさせる",
    ],
  },
  {
    id: "tabs", cat: "display", ja: "タブ", en: "Tabs",
    meaning: "見出しを押して下の中身を切り替える", when: "同じページの中で、種類の違う中身を切り替えて見せる。",
    knobs: [k("style", "見た目", [["underline", "下線"], ["boxed", "囲み"], ["pill", "丸い札"]])],
    spec: (o, R) => [
      o.style === "underline" ? `見出しを横に並べ、選択中の下に2pxの線（基本の色 ${hx(R.accent)}）。全体の下に1pxの線` : o.style === "boxed" ? `選択中の見出しだけ上と左右を線で囲み、下の中身とつなげる（フォルダのつまみ型）。角は上だけ ${rr(R, "ctl")}` : `選択中の見出しを角${rr(R, "ctl")}の淡い背景 ${hx(R.accentSoft)} の札にする`,
      `選択中の文字は基本の色・太さ${R.fw}、ほかは補足の色`,
      motion(R, "切り替え: 印が横に滑り、中身はクロスフェード"),
      `role="tablist"・"tab"・"tabpanel" を付け、左右の矢印キーで移れるようにする`,
    ],
  },
  {
    id: "accordion", cat: "display", ja: "アコーディオン", en: "Accordion", aka: ["折りたたみ", "エクスパンダー"],
    meaning: "見出しを押すと中身が開いたり閉じたりする", when: "よくある質問など、全部を一度に見せると長すぎるとき。",
    knobs: [k("icon", "開閉の印", [["chevron", "矢印"], ["plus", "＋／−"]]), k("multi", "開き方", [["one", "1つだけ開く"], ["many", "いくつも開く"]])],
    spec: (o, R) => [
      `見出しの行は高さ${Math.round(56 * R.sp)}px、右端に${o.icon === "plus" ? "＋（開くと−）" : "下向きの矢印（開くと180度回る）"}`,
      o.multi === "one" ? "1つ開くとほかは閉じる" : "いくつでも同時に開ける",
      motion(R, "開くとき: 中身の高さが伸びる"),
      `項目の間に1pxの線 ${hx(R.line)}`,
    ],
  },
  {
    id: "pagination", cat: "display", ja: "ページネーション", en: "Pagination", aka: ["ページ送り"],
    meaning: "番号を押して一覧のページを送る", when: "検索結果など、件数が多い一覧の下に置く。",
    knobs: [],
    spec: (_o, R) => [
      `「‹ 1 2 3 … 10 ›」の形。1つ36×36px・角 ${rr(R, "ctl")}`,
      `今のページは基本の色 ${hx(R.accent)} の塗り・文字 ${hx(R.onAccent)}、ほかは文字だけ`,
      "最初と最後のページでは ‹ › を使えない見た目にする",
    ],
  },
  {
    id: "avatar", cat: "display", ja: "アバター", en: "Avatar",
    meaning: "人を表す小さな顔写真や頭文字", when: "コメント・メンバー一覧・ログイン中の表示など、誰かを示すとき。",
    knobs: [k("shape", "形", [["circle", "丸"], ["rounded", "角丸"]]), k("size", "大きさ", [["sm", "小（32px）"], ["md", "中（40px）"], ["lg", "大（56px）"]], "md")],
    spec: (o, R) => [
      `${AVATAR[o.size]}pxの${o.shape === "circle" ? "円" : `角${Math.min(R.rCtl, 12)}pxの四角`}に写真を切り抜いて入れる`,
      `写真がないときは淡い背景 ${hx(R.accentSoft)} に名前の頭文字1字（基本の色）`,
      "何人も並べるときは少し重ね、それぞれに面の色の2pxの縁を付ける",
    ],
  },
  {
    id: "divider", cat: "display", ja: "区切り線", en: "Divider", aka: ["ディバイダー", "罫線"],
    meaning: "まとまりを分ける細い線", when: "メニューの項目のまとまりや、ページの段落の区切りに。",
    knobs: [],
    spec: (_o, R) => [`1pxの線・色 ${hx(R.line)}・上下に${R.u(4)}pxの余白`, "多用せず、余白だけで分けられるなら線は引かない"],
  },

  // ===== 状態を伝える =====
  {
    id: "alert", cat: "status", ja: "アラート", en: "Alert (Banner)", aka: ["バナー", "お知らせ", "メッセージ"],
    meaning: "画面の中に残る、色付きのお知らせ枠", when: "入力の誤り・メンテナンス予告など、読んでほしいことを消えずに出しておく。",
    knobs: [
      k("kind", "種類", [["info", "情報"], ["success", "成功"], ["warning", "注意"], ["error", "エラー"]]),
      k("style", "強さ", [["soft", "淡い"], ["outline", "枠線"], ["solid", "塗り"]]),
    ],
    spec: (o, R) => {
      const c = { info: R.accent, success: R.success, warning: R.warning, error: R.danger }[o.kind] as string;
      return [
        `左にアイコン、右に見出し1行と説明。内側の余白 ${R.u(4)}px・角 ${rr(R, "lg")}`,
        o.style === "solid" ? `背景 ${hx(c)} の塗り・文字は白` : o.style === "outline" ? `1pxの線 ${hx(c)}・背景は面の色` : `背景は ${hx(c)} を1割ほど混ぜた淡い色・文字とアイコンは ${hx(c)}`,
        "色だけで種類を伝えず、アイコンと見出し（「エラー」「注意」など）でも分かるようにする。エラーは role=\"alert\"",
      ];
    },
  },
  {
    id: "badge", cat: "status", ja: "バッジ", en: "Badge",
    meaning: "件数や新着を示す小さな印", when: "ベルのアイコンに未読数を出すなど、別の物の角に重ねて使う。",
    knobs: [k("style", "見た目", [["count", "数字"], ["dot", "点だけ"]])],
    spec: (o, R) => [
      o.style === "dot" ? `アイコンの右上に直径8pxの点（赤 ${hx(R.danger)}）` : `アイコンの右上に高さ18px・最小幅18pxの丸（赤 ${hx(R.danger)}）・白い数字11px。100以上は「99+」`,
      "周りに面の色の2pxの縁を付けて、下の絵から浮かせる",
    ],
  },
  {
    id: "chip", cat: "status", ja: "チップ", en: "Chip (Tag)", aka: ["タグ", "ラベル", "ピル"],
    meaning: "小さな札。条件や分類を示す", when: "絞り込み条件・記事のカテゴリ・入力したキーワードの表示に。",
    knobs: [k("style", "見た目", [["soft", "淡い塗り"], ["outline", "枠線"]]), k("removable", "消すボタン", [["off", "なし"], ["on", "×を付ける"]])],
    spec: (o, R) => [
      `高さ28px・左右の余白${R.u(3)}px・文字13px・角 ${rr(R, "sm")}`,
      o.style === "outline" ? `1pxの線 ${hx(R.line)}・選択中は線と文字を基本の色に` : `背景 ${hx(R.accentSoft)}・文字は基本の色`,
      o.removable === "on" ? "右端に14pxの×を付け、押すとその札を消す" : "×は付けない",
    ],
  },
  {
    id: "progress", cat: "status", ja: "プログレスバー", en: "Progress bar", aka: ["進捗バー"],
    meaning: "どこまで進んだかを横の棒で示す", when: "アップロードや手続きの残りなど、進み具合が分かる待ち時間に。",
    knobs: [k("thick", "太さ", [["4", "細い（4px）"], ["8", "太い（8px）"]]), k("label", "数字", [["on", "％を出す"], ["off", "出さない"]])],
    spec: (o, R) => [
      `太さ${o.thick}px・角は太さの半分。済んだ所は基本の色 ${hx(R.accent)}、残りは淡い灰色`,
      o.label === "on" ? "右に「64%」のように数字を出す" : "数字は出さない",
      motion(R, "値が変わるとき: 棒が伸びる"),
      `role="progressbar" と aria-valuenow を付ける`,
    ],
  },
  {
    id: "spinner", cat: "status", ja: "スピナー", en: "Spinner (Loading indicator)", aka: ["ローディング", "くるくる"],
    meaning: "くるくる回って待ちを示す", when: "どのくらいかかるか分からない、数秒の待ち時間に。",
    knobs: [],
    spec: (_o, R) => [`24pxの円の4分の1だけ基本の色 ${hx(R.accent)}、残りは淡い灰色の線（太さ3px）`, "0.8秒で1回転を一定の速さでくり返す", "ボタンの中に出すときは文字の代わりに置き、ボタンの幅を変えない"],
  },
  {
    id: "skeleton", cat: "status", ja: "スケルトン", en: "Skeleton (Skeleton screen)", aka: ["スケルトンスクリーン"],
    meaning: "読み込み中に中身と同じ形の灰色の枠を出す", when: "一覧やカードを読み込む間、どこに何が出るかを先に見せる。",
    knobs: [k("anim", "動き", [["shimmer", "光が流れる"], ["pulse", "明滅する"]])],
    spec: (o, R) => [
      `本物の中身と同じ位置・大きさの灰色の板（角 ${rr(R, "sm")}）を並べる`,
      o.anim === "shimmer" ? "左から右へ白っぽい光が1.4秒で流れるのをくり返す" : "不透明度を1→0.5→1と1.6秒でくり返す",
      "読み込みが終わったら本物に差し替える",
    ],
  },
  {
    id: "stepper", cat: "status", ja: "ステップ表示", en: "Step indicator (Stepper)", aka: ["ステッパー", "プログレスステップ"],
    meaning: "手続きの何番目にいるかを示す", when: "申し込みや購入など、何画面かに分かれた手続きの上に置く。",
    knobs: [],
    spec: (_o, R) => [
      "「入力 → 確認 → 完了」のように、番号の丸と名前を横に並べて線でつなぐ",
      `済んだ段階は基本の色 ${hx(R.accent)} の丸に✓、今の段階は基本の色の丸に番号、先の段階は灰色`,
      "※「ステッパー」は＋／−で数を増減する部品の意味でも使われる。そちらなら「数量のステッパー（＋−ボタン）」と書く",
    ],
  },
  {
    id: "empty", cat: "status", ja: "エンプティステート", en: "Empty state",
    meaning: "中身がまだないときの案内", when: "お気に入りや検索結果が0件のとき、真っ白にせず次の行動を案内する。",
    knobs: [],
    spec: (_o, R) => [
      `線画のアイコン（48px・補足の色）・見出し「まだありません」・説明1行・主ボタン1つを中央にそろえる`,
      `上下の余白 ${R.u(12)}px`,
    ],
  },
];

export const PART_MAP: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

export const defaultOpts = (p: Part): Record<string, string> => Object.fromEntries(p.knobs.map((x) => [x.key, x.def]));

export const partSpec = (p: Part, opts: Record<string, string>, R: Resolved) => {
  const o = { ...defaultOpts(p), ...opts };
  const lines = p.spec(o, R);
  const chosen = p.knobs.map((x) => `${x.label}=${lab(p.knobs, x.key, o[x.key])}`);
  return { lines, chosen };
};

// まぎらわしい名前の見分け方
export const CONFUSIONS: { title: string; parts: string[]; rule: string }[] = [
  { title: "モーダルとダイアログ", parts: ["modal", "dialog"], rule: "モーダルは「後ろを操作できなくする出し方」、ダイアログは「返事を求める中身」。確認ダイアログはたいていモーダルとして出す。入力フォームを出す窓はモーダル、「削除しますか？」はダイアログと呼ぶと伝わる。" },
  { title: "モーダル・ドロワー・ボトムシート", parts: ["modal", "drawer", "bottom-sheet"], rule: "出てくる場所で呼び分ける。中央ならモーダル、横からならドロワー、下からならボトムシート。" },
  { title: "ツールチップとポップオーバー", parts: ["tooltip", "popover"], rule: "乗せるだけで出て、読むだけ（中を押せない）のがツールチップ。押して開き、中のボタンも押せるのがポップオーバー。" },
  { title: "トーストとアラート", parts: ["toast", "alert"], rule: "トーストは端に出て数秒で勝手に消える。アラートは画面の中に残り、読むまで消えない。" },
  { title: "チェックボックス・ラジオボタン・トグルスイッチ", parts: ["checkbox", "radio", "toggle"], rule: "いくつでも選べるのがチェックボックス（四角）。1つだけ選ぶのがラジオボタン（丸）。押した瞬間に効くオン・オフがトグルスイッチ。" },
  { title: "セレクトボックスとドロップダウンメニュー", parts: ["select", "dropdown-menu"], rule: "セレクトボックスは値を1つ選んで欄に入れる「入力欄」。ドロップダウンメニューは「編集・削除」のような操作を選ぶ「ボタンの集まり」。" },
  { title: "タブとセグメントコントロール", parts: ["tabs", "segmented"], rule: "タブは中身そのものを入れ替える。セグメントコントロールは同じ中身の見せ方（日・週・月など）を切り替える。" },
  { title: "ヘッダーとグローバルナビ", parts: ["header", "global-nav"], rule: "ヘッダーは画面上の帯という「場所」。グローバルナビはその中に並ぶ主要ページへの「リンクの並び」。" },
  { title: "バッジとチップ", parts: ["badge", "chip"], rule: "バッジは別の物の角に重ねる件数や点。チップは単独で並ぶ札で、押したり消したりできる。" },
  { title: "スピナー・スケルトン・プログレスバー", parts: ["spinner", "skeleton", "progress"], rule: "終わりが読めない短い待ちはスピナー、一覧の読み込みはスケルトン、進み具合が分かるならプログレスバー。" },
];
