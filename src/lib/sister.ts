// 姉妹サイト。UI部品図鑑（Webの画面の部品）とアプリ部品図鑑（スマホアプリの部品）は、同じ形の図鑑として互いにリンクする。
// アプリ部品図鑑のリポジトリは ~/work/app-parts-zukan（mashihara/app-parts-zukan）。部品の id と名前はそちらの src/lib/parts.ts が正本
export const SISTER = {
  name: "アプリ部品図鑑",
  url: "https://mashiharalab.dev/app-parts-zukan/",
  what: "スマホアプリの部品",
  examples: "タブバー・ボトムシート・スナックバー・スワイプアクションなど",
};

export const sisterPart = (id: string) => `${SISTER.url}parts/${id}/`;

// この図鑑の部品 id → アプリ部品図鑑で同じ・近い部品（アプリでの呼び名）。
// 名前が同じでも意味が違う物（Webのステップ表示とアプリのステッパー）は入れない
export const SISTER_PARTS: Record<string, { id: string; ja: string }> = {
  header: { id: "nav-bar", ja: "ナビゲーションバー" },
  "bottom-nav": { id: "tab-bar", ja: "タブバー" },
  modal: { id: "modal-present", ja: "モーダル遷移" },
  dialog: { id: "alert", ja: "アラート" },
  drawer: { id: "nav-drawer", ja: "ナビゲーションドロワー" },
  "bottom-sheet": { id: "bottom-sheet", ja: "ボトムシート" },
  toast: { id: "toast", ja: "トースト" },
  "dropdown-menu": { id: "context-menu", ja: "コンテキストメニュー" },
  button: { id: "button", ja: "ボタン" },
  fab: { id: "fab", ja: "FAB" },
  "text-field": { id: "text-field", ja: "テキストフィールド" },
  select: { id: "picker", ja: "ピッカー" },
  search: { id: "search-bar", ja: "検索バー" },
  toggle: { id: "switch", ja: "スイッチ" },
  slider: { id: "slider", ja: "スライダー" },
  segmented: { id: "segmented", ja: "セグメンテッドコントロール" },
  "date-picker": { id: "date-picker", ja: "日付ピッカー" },
  card: { id: "card", ja: "カード" },
  list: { id: "list-cell", ja: "リストのセル" },
  avatar: { id: "avatar", ja: "アバター" },
  carousel: { id: "carousel", ja: "カルーセル" },
  badge: { id: "badge", ja: "バッジ" },
  chip: { id: "chip", ja: "チップ" },
  progress: { id: "progress-bar", ja: "プログレスバー" },
  spinner: { id: "spinner", ja: "インジケーター" },
  skeleton: { id: "skeleton", ja: "スケルトン" },
  empty: { id: "empty-state", ja: "エンプティステート" },
};
