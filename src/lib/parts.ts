// 部品の名前帳。名前・ひとこと・使いどころ・AIへの頼み方の例を1か所で持つ。
// 見本（src/components/previews.tsx）は demo の見せ方と、ここの数値表（BTN_SIZE など）で描く。
// React に依存しない（scripts/build-api.ts からも読むため）。

export type CatId = "layout" | "arrange" | "overlay" | "input" | "display" | "status";

export const CATEGORIES: { id: CatId; label: string; desc: string }[] = [
  { id: "layout", label: "画面の骨組み", desc: "画面の上下左右にいつもある場所" },
  { id: "arrange", label: "画面の組み方", desc: "部品の並べ方・画面の分け方のことば" },
  { id: "overlay", label: "重なって出る窓", desc: "画面の上に一時的に重なる物" },
  { id: "input", label: "押す・入れる・選ぶ", desc: "利用者が操作する部品" },
  { id: "display", label: "並べて見せる", desc: "情報をまとめて見せる入れ物" },
  { id: "status", label: "状態を伝える", desc: "読み込み中・件数・お知らせ" },
];

export type Part = {
  id: string;
  cat: CatId;
  ja: string;
  en: string;
  aka?: string[]; // 別名・よく混ざる呼び方
  meaning: string; // ひとこと（20字前後）
  when: string; // 使いどころ
  ask: string; // AIへの頼み方の例（名前を入れた一文）
  demo?: Record<string, string>; // 見本の見せ方
};

// ---- 見本で使う数値表 ----
export const BTN_SIZE: Record<string, { h: number; px: number; fs: number }> = {
  sm: { h: 32, px: 12, fs: 14 },
  md: { h: 40, px: 16, fs: 15 },
  lg: { h: 52, px: 24, fs: 17 },
};
export const HEADER_H: Record<string, number> = { low: 52, mid: 64, high: 76 };
export const MODAL_W: Record<string, number> = { sm: 400, md: 560, lg: 720 };
export const BACKDROP: Record<string, number> = { light: 0.3, mid: 0.5, dark: 0.7 };
export const TOAST_SEC: Record<string, number> = { "2": 2, "4": 4, "6": 6 };
export const AVATAR: Record<string, number> = { sm: 32, md: 40, lg: 56 };

export const PARTS: Part[] = [
  // ===== 画面の骨組み =====
  {
    id: "header", cat: "layout", ja: "ヘッダー", en: "Header", aka: ["アプリバー（App bar）", "トップバー"],
    meaning: "画面のいちばん上の帯", when: "ロゴ・主なメニュー・ログインなど、どのページにも出す物を置く。",
    ask: "ヘッダーの左にロゴ、右にログインボタンを置いて。スクロールしても上に残るようにして。",
    demo: { bg: "surface", height: "mid" },
  },
  {
    id: "global-nav", cat: "layout", ja: "グローバルナビ", en: "Navigation menu (Global navigation)", aka: ["ナビゲーションバー", "メニュー"],
    meaning: "サイトの主なページへのリンクの並び", when: "ヘッダーの中に置き、どのページからも主要なページへ移れるようにする。",
    ask: "ヘッダーにグローバルナビを付けて、「お店をさがす・予約・お知らせ」の3つを並べて。今いるページには下線を引いて。",
    demo: { current: "underline" },
  },
  {
    id: "footer", cat: "layout", ja: "フッター", en: "Footer",
    meaning: "画面のいちばん下の帯", when: "会社情報・規約・お問い合わせ・SNSなど、補足のリンクをまとめる。",
    ask: "フッターに利用規約・プライバシーポリシー・お問い合わせのリンクと、コピーライトを入れて。",
    demo: { layout: "columns", bg: "surface" },
  },
  {
    id: "sidebar", cat: "layout", ja: "サイドバー", en: "Sidebar", aka: ["サイドナビ"],
    meaning: "画面の横に縦に並ぶメニュー", when: "管理画面など、ページの種類が多いときに左側へ常に出しておく。",
    ask: "管理画面の左にサイドバーを置いて、ホーム・予約・会員・設定を縦に並べて。今いる項目は色を付けて。",
    demo: { width: "wide" },
  },
  {
    id: "breadcrumb", cat: "layout", ja: "パンくずリスト", en: "Breadcrumbs",
    meaning: "今いる場所を階層で示す", when: "記事や商品の詳細ページの上に置き、上の階層へ戻れるようにする。",
    ask: "記事ページの上にパンくずリストを付けて。「ホーム › カテゴリ › 記事名」の形で、記事名はリンクにしないで。",
    demo: { sep: "chevron" },
  },
  {
    id: "hero", cat: "layout", ja: "ヒーロー", en: "Hero section", aka: ["メインビジュアル", "キービジュアル"],
    meaning: "ページ最上部の大きな見せ場", when: "サイトのトップで、何のサービスかを大きな見出しと写真で一目で伝える。",
    ask: "トップページのヒーローに、大きな見出しと説明1行、「お店をさがす」ボタンを置いて。右には写真を。",
    demo: { align: "left" },
  },
  {
    id: "bottom-nav", cat: "layout", ja: "ボトムナビ", en: "Bottom navigation (Tab bar)", aka: ["タブバー", "ボトムナビゲーション"],
    meaning: "スマホの画面下に並ぶ切り替えボタン", when: "スマホアプリで、主な画面3〜5個を親指で切り替えられるようにする。",
    ask: "スマホでは画面下にボトムナビを置いて、ホーム・さがす・予約・マイページの4つをアイコンと文字で並べて。",
    demo: { labels: "always" },
  },

  // ===== 画面の組み方 =====
  {
    id: "column", cat: "arrange", ja: "カラム", en: "Column layout", aka: ["段組み", "2カラム", "3カラム"],
    meaning: "画面を縦の列に分けた並べ方", when: "PCで本文の横に目次やメニューを置くなど、情報を横に並べたいとき。",
    ask: "PCでは2カラムにして、左に本文、右に幅320pxの目次を置いて。スマホでは1カラムにして。",
  },
  {
    id: "sticky", cat: "arrange", ja: "スティッキー", en: "Sticky (position: sticky)", aka: ["sticky", "追従"],
    meaning: "スクロールしても途中で止まって付いてくる", when: "目次・表の見出し・右の列など、読み進めても見えていてほしい物に。",
    ask: "右の列はstickyにして、スクロールしても画面の上から12pxの位置で付いてくるようにして。",
  },
  {
    id: "fixed", cat: "arrange", ja: "固定表示", en: "Fixed (position: fixed)", aka: ["fixed", "固定"],
    meaning: "画面の決まった位置にずっと貼り付く", when: "スマホの下の購入ボタンやチャットの入力欄など、いつでも押せてほしい物に。",
    ask: "スマホでは「カートに入れる」ボタンを画面の下に固定表示して、スクロールしても常に見えるようにして。",
  },
  {
    id: "grid", cat: "arrange", ja: "グリッド", en: "Grid layout", aka: ["格子", "タイル"],
    meaning: "同じ大きさの枠を縦横にそろえて並べる", when: "商品・写真・カードの一覧を、きれいにそろえて並べたいとき。",
    ask: "商品をグリッドで並べて。PCは4列、タブレットは3列、スマホは2列、間は16px。",
  },
  {
    id: "responsive", cat: "arrange", ja: "レスポンシブ", en: "Responsive design", aka: ["レスポンシブデザイン", "スマホ対応"],
    meaning: "画面幅に合わせて組み方を変える", when: "同じページをPCでもスマホでも見やすくしたいとき（今はほぼ必須）。",
    ask: "レスポンシブにして。PCでは横に3列、スマホでは縦に1列に並べ替えて。",
  },
  {
    id: "breakpoint", cat: "arrange", ja: "ブレークポイント", en: "Breakpoint", aka: ["切り替えの幅"],
    meaning: "組み方を切り替える画面幅の境目", when: "「何px以上なら2カラム」のように、切り替える幅を決めて伝えるとき。",
    ask: "ブレークポイントは768pxと1024pxにして。768px未満は1列、768〜1023pxは2列、1024px以上は3列に。",
  },
  {
    id: "spacing", cat: "arrange", ja: "余白（パディング・マージン）", en: "Padding / Margin", aka: ["パディング", "マージン", "ホワイトスペース"],
    meaning: "枠の内側と外側のすき間", when: "窮屈・スカスカを直すとき。内側（パディング）か外側（マージン）かを言い分けると伝わる。",
    ask: "カードの内側の余白（パディング）を24pxにして、カード同士の外側の余白（マージン）は16pxにして。",
  },
  {
    id: "overlay", cat: "arrange", ja: "オーバーレイ", en: "Overlay (Scrim / Backdrop)", aka: ["スクリム", "バックドロップ", "幕"],
    meaning: "画面の上にかぶせる半透明の幕", when: "モーダルやドロワーの後ろを暗くして、手前に注目させるとき。",
    ask: "メニューを開いたら、後ろに黒の半透明（50%）のオーバーレイをかぶせて、それを押したら閉じるようにして。",
  },
  {
    id: "scroll", cat: "arrange", ja: "横スクロール", en: "Horizontal scroll", aka: ["スクロール", "スワイプ"],
    meaning: "はみ出した分を横に動かして見る", when: "カテゴリやおすすめなど、数が多い物を1列に並べて指で送って見せるとき。",
    ask: "おすすめのお店を横スクロールで並べて。次のカードが少し見えるようにして、スクロールバーは隠して。",
  },
  {
    id: "first-view", cat: "arrange", ja: "ファーストビュー", en: "First view (Above the fold)", aka: ["FV", "アバブ・ザ・フォールド"],
    meaning: "開いて最初に見える範囲", when: "何のサイトか・何をすればよいかを、スクロールせずに伝えたいとき。",
    ask: "スマホのファーストビューに、見出し・説明1行・申し込みボタンまでが収まるようにして。",
  },

  {
    id: "flexbox", cat: "arrange", ja: "フレックスボックス", en: "Flexbox", aka: ["flex", "横並び", "縦並び"],
    meaning: "部品を1列に並べて揃える仕組み", when: "ボタンを横に並べる、アイコンと文字を並べるなど、1列に並べたいとき。",
    ask: "3つのボタンをフレックスボックスで横に並べて、間は12px、上下は中央で揃えて。スマホでは縦に並べて。",
  },
  {
    id: "gap", cat: "arrange", ja: "ギャップ", en: "Gap", aka: ["すき間", "間隔"],
    meaning: "並んだ部品どうしの間のすき間", when: "カードやボタンの間を、全部同じ幅で空けたいとき。",
    ask: "カードの間のギャップを16pxにして。端のカードの外側には余白を付けないで。",
  },
  {
    id: "alignment", cat: "arrange", ja: "揃え（寄せ）", en: "Alignment (justify / align)", aka: ["中央揃え", "左寄せ", "右寄せ", "両端揃え", "均等配置"],
    meaning: "並びをどこに寄せ、どう揃えるか", when: "「真ん中に」「右に寄せて」「均等に並べて」を正確に伝えたいとき。",
    ask: "ヘッダーの中は両端揃えにして、ロゴは左、ボタンは右に。上下は中央で揃えて。",
  },
  {
    id: "z-index", cat: "arrange", ja: "重なり順（z-index）", en: "Z-index (Stacking order)", aka: ["z-index", "重なりの順番", "前面・背面"],
    meaning: "重なったとき、どれを手前に出すかの順番", when: "メニューがモーダルの裏に隠れる、などの重なりの不具合を直すとき。",
    ask: "ドロップダウンメニューがヘッダーの裏に隠れるので、重なり順（z-index）をヘッダーより上にして。",
  },
  {
    id: "aspect-ratio", cat: "arrange", ja: "アスペクト比", en: "Aspect ratio", aka: ["縦横比", "16:9", "1:1"],
    meaning: "枠の縦と横の比率", when: "写真・動画・カードの形を、元の大きさに関係なくそろえたいとき。",
    ask: "カードの写真はアスペクト比4:3にそろえて、はみ出す部分は切り取って（object-fit: cover）。",
  },

  // ===== 重なって出る窓 =====
  {
    id: "modal", cat: "overlay", ja: "モーダル", en: "Modal", aka: ["モーダルウィンドウ"],
    meaning: "背景を暗くして中央に出る窓。閉じるまで後ろは操作できない", when: "入力・詳細表示など、今の作業を止めて1つのことに集中させたいとき。",
    ask: "「予約する」を押したら、予約の内容をモーダルで出して。背景は暗くして、×かEscキーで閉じられるように。",
    demo: { size: "md", backdrop: "mid", motion: "zoom" },
  },
  {
    id: "dialog", cat: "overlay", ja: "ダイアログ", en: "Dialog (Confirmation dialog)", aka: ["確認ダイアログ", "アラートダイアログ"],
    meaning: "「本当に〜しますか？」と聞いて返事を求める小窓", when: "削除・送信など取り消せない操作の前に、はい／いいえを選ばせる。",
    ask: "削除ボタンを押したら確認ダイアログを出して。「削除しますか？」と聞き、「キャンセル」と赤い「削除する」を並べて。",
    demo: { buttons: "right", tone: "danger" },
  },
  {
    id: "drawer", cat: "overlay", ja: "ドロワー", en: "Drawer (Side sheet)", aka: ["オフキャンバスメニュー", "サイドシート", "ナビゲーションドロワー"],
    meaning: "画面の横から引き出される縦長の窓", when: "スマホのメニューや絞り込み条件など、縦に長い中身を一時的に出す。",
    ask: "スマホではメニューボタンを押すと左からドロワーが出るようにして。背景を押すと閉じるように。",
    demo: { side: "left", width: "narrow" },
  },
  {
    id: "bottom-sheet", cat: "overlay", ja: "ボトムシート", en: "Bottom sheet",
    meaning: "画面の下からせり上がる窓", when: "スマホで、並べ替え・共有先・詳細などを親指の届く位置に出す。",
    ask: "並べ替えボタンを押したら、選択肢をボトムシートで下から出して。下に引くと閉じるように。",
    demo: { height: "auto", handle: "on" },
  },
  {
    id: "popover", cat: "overlay", ja: "ポップオーバー", en: "Popover",
    meaning: "押した物のそばに出る、操作もできる小窓", when: "設定の小さな変更や詳しい説明を、画面を移らずにその場で出す。",
    ask: "人数の欄を押したら、すぐ下にポップオーバーを出して、大人と子どもの人数を＋−で選べるようにして。",
    demo: { arrow: "on" },
  },
  {
    id: "tooltip", cat: "overlay", ja: "ツールチップ", en: "Tooltip",
    meaning: "カーソルを乗せると出る、短い説明の札", when: "アイコンだけのボタンに名前を添えるなど、ひとことの補足に使う。",
    ask: "ハートのアイコンボタンにカーソルを乗せたら、「お気に入りに追加」とツールチップを出して。",
    demo: { style: "dark" },
  },
  {
    id: "toast", cat: "overlay", ja: "トースト", en: "Toast (Snackbar)", aka: ["スナックバー"],
    meaning: "画面の端に出て自動で消える短い通知", when: "「保存しました」など、操作の結果を作業を止めずに知らせる。",
    ask: "保存したら画面の下にトーストで「保存しました」と出して、4秒で自動で消して。「元に戻す」も付けて。",
    demo: { pos: "bottom", style: "dark", sec: "4" },
  },
  {
    id: "dropdown-menu", cat: "overlay", ja: "ドロップダウンメニュー", en: "Dropdown menu (Menu)", aka: ["プルダウンメニュー", "コンテキストメニュー", "メニュー"],
    meaning: "押すと下に操作の一覧が開く", when: "「編集・複製・削除」のように、1つの対象に対する操作をまとめる。",
    ask: "一覧の各行の右に「…」ボタンを置いて、押したらドロップダウンメニューで編集・複製・削除を出して。",
    demo: { icons: "on" },
  },

  // ===== 押す・入れる・選ぶ =====
  {
    id: "button", cat: "input", ja: "ボタン", en: "Button", aka: ["プライマリボタン", "セカンダリボタン"],
    meaning: "押すと何かが起きる部品", when: "送信・保存・次へなど、操作のきっかけ。1画面で一番大事な操作だけを色で塗る。",
    ask: "「予約する」は色で塗ったプライマリボタン、「キャンセル」は枠線だけのセカンダリボタンにして。",
    demo: { variant: "filled", size: "md", width: "auto" },
  },
  {
    id: "icon-button", cat: "input", ja: "アイコンボタン", en: "Icon button",
    meaning: "絵だけのボタン", when: "閉じる×・設定の歯車・いいねなど、絵で意味が通じる操作に。",
    ask: "右上の閉じるボタンは×のアイコンボタンにして。読み上げ用に「閉じる」という名前も付けて。",
    demo: { shape: "circle", style: "ghost" },
  },
  {
    id: "fab", cat: "input", ja: "FAB", en: "Floating action button (FAB)", aka: ["フローティングアクションボタン"],
    meaning: "画面の右下に浮かぶ丸い主ボタン", when: "スマホで「新しく作る」など、その画面で一番よく使う操作を1つだけ置く。",
    ask: "メモの一覧の右下にFABを置いて、＋を押すと新しいメモを作れるようにして。",
    demo: { label: "off" },
  },
  {
    id: "text-field", cat: "input", ja: "テキストフィールド", en: "Text field (Input)", aka: ["入力欄", "フォーム", "テキストボックス"],
    meaning: "1行の文字を入れる欄", when: "名前・メール・電話番号など短い文字の入力。",
    ask: "メールアドレスのテキストフィールドを作って。項目名は欄の上に置き、形が違うときは欄の下に赤で直し方を出して。",
    demo: { style: "outline", label: "top", state: "normal" },
  },
  {
    id: "textarea", cat: "input", ja: "テキストエリア", en: "Textarea",
    meaning: "何行も文字を入れられる欄", when: "お問い合わせ内容・感想など、長い文章の入力。",
    ask: "お問い合わせ内容はテキストエリアにして、4行分の高さで、右下に「120 / 500」と文字数を出して。",
    demo: { count: "on" },
  },
  {
    id: "select", cat: "input", ja: "セレクトボックス", en: "Select (Dropdown list)", aka: ["プルダウン", "ドロップダウンリスト"],
    meaning: "押すと選択肢が開き、1つを選ぶ欄", when: "都道府県・並び順など、決まった選択肢が5個以上あるとき。",
    ask: "都道府県はセレクトボックスで選ばせて。最初は「選んでください」と出して。",
    demo: { native: "custom" },
  },
  {
    id: "search", cat: "input", ja: "検索バー", en: "Search bar (Search field)", aka: ["検索ボックス"],
    meaning: "虫めがねの付いた検索の入力欄", when: "ヘッダーや一覧の上に置き、言葉で絞り込ませる。",
    ask: "一覧の上に検索バーを置いて、左に虫めがね、入力したら右に×（消す）を出して。",
    demo: { shape: "pill" },
  },
  {
    id: "checkbox", cat: "input", ja: "チェックボックス", en: "Checkbox",
    meaning: "四角に✓を付ける。いくつでも選べる", when: "「規約に同意する」や、複数の条件を同時に選ばせるとき。",
    ask: "フォームの最後に「利用規約に同意する」のチェックボックスを置いて、✓しないと送信ボタンを押せないようにして。",
    demo: { size: "md" },
  },
  {
    id: "radio", cat: "input", ja: "ラジオボタン", en: "Radio button (Radio group)",
    meaning: "丸を1つだけ選ぶ。選ぶとほかが外れる", when: "配送方法・プランなど、4個以下の選択肢から必ず1つを選ばせるとき。",
    ask: "受け取り方は「店内・持ち帰り・配達」のラジオボタンで1つ選ばせて。最初は「店内」を選んでおいて。",
    demo: { layout: "vertical" },
  },
  {
    id: "toggle", cat: "input", ja: "トグルスイッチ", en: "Switch (Toggle switch)", aka: ["スイッチ"],
    meaning: "オン・オフを押した瞬間に切り替える", when: "通知のオン・オフなど、押してすぐ効く設定。保存ボタンが要る設定にはチェックボックスを使う。",
    ask: "設定画面の「お知らせを受け取る」はトグルスイッチにして、押したらすぐ保存されるようにして。",
    demo: { size: "md", on: "accent" },
  },
  {
    id: "slider", cat: "input", ja: "スライダー", en: "Slider (Range input)", aka: ["シークバー", "レンジスライダー（範囲スライダー）"],
    meaning: "つまみを横に動かして値を決める", when: "音量・明るさ・価格の範囲など、だいたいの値を選ばせるとき。",
    ask: "予算はスライダーで選ばせて、右に今の金額を出して。",
    demo: { value: "side" },
  },
  {
    id: "segmented", cat: "input", ja: "セグメントコントロール", en: "Segmented control", aka: ["セグメントボタン", "ボタングループ"],
    meaning: "くっついたボタンで表示を切り替える", when: "「日・週・月」のように、同じ物の見せ方を2〜4個から切り替える。",
    ask: "グラフの上に「日・週・月」のセグメントコントロールを置いて、押したらグラフの期間を切り替えて。",
  },

  {
    id: "form", cat: "input", ja: "フォーム", en: "Form", aka: ["入力フォーム", "問い合わせフォーム"],
    meaning: "入力欄と送信ボタンをひとまとめにした物", when: "お問い合わせ・会員登録・予約など、いくつかの項目を入れて送ってもらうとき。",
    ask: "お問い合わせフォームを作って。名前・メール・内容の3項目と送信ボタン。未入力の項目は送信時に赤で知らせて。",
  },
  {
    id: "autocomplete", cat: "input", ja: "オートコンプリート", en: "Autocomplete", aka: ["入力候補", "サジェスト", "コンボボックス"],
    meaning: "文字を打つと下に候補が出る入力欄", when: "駅名・住所・商品名など、候補が多くて選ぶより打つ方が早いとき。",
    ask: "駅名の入力欄をオートコンプリートにして。2文字打ったら下に候補を5件まで出し、一致した文字は太字にして。",
  },
  {
    id: "date-picker", cat: "input", ja: "日付ピッカー", en: "Date picker", aka: ["カレンダー入力", "デイトピッカー"],
    meaning: "カレンダーから日付を選ぶ入力", when: "予約日・誕生日・期間など、日付を間違えずに選ばせたいとき。",
    ask: "予約日の入力を日付ピッカーにして。押すとカレンダーが開き、今日より前の日は選べないようにして。",
  },
  {
    id: "file-upload", cat: "input", ja: "ファイルアップロード", en: "File upload (Dropzone)", aka: ["ドロップゾーン", "ファイル選択"],
    meaning: "ファイルを選ぶか、ドラッグして置く欄", when: "写真・書類・履歴書など、手元のファイルを送ってもらうとき。",
    ask: "写真のファイルアップロード欄を作って。点線の枠にドラッグするか押して選べるようにし、送信中はプログレスバーを出して。",
  },
  {
    id: "rating", cat: "input", ja: "レーティング（星評価）", en: "Rating", aka: ["星評価", "評価", "スター"],
    meaning: "星の数で評価を見せる・付ける", when: "口コミ・レビュー・満足度アンケートなど、評価を一目で見せたいとき。",
    ask: "口コミの投稿欄に5段階のレーティングを付けて。星を押して選び、選んだ数を「4.0」のように横に出して。",
  },

  // ===== 並べて見せる =====
  {
    id: "card", cat: "display", ja: "カード", en: "Card",
    meaning: "画像と文字を1枚の札にまとめた入れ物", when: "商品・記事・お店など、同じ形の物を一覧で並べるとき。",
    ask: "お店の一覧をカードで3列に並べて。カードの上に写真、下に店名・説明・評価を入れて。",
    demo: { media: "top", hover: "lift" },
  },
  {
    id: "list", cat: "display", ja: "リスト", en: "List", aka: ["リストアイテム", "一覧"],
    meaning: "同じ形の行を縦に並べた一覧", when: "設定項目・メッセージ・連絡先など、1行ずつ見ていく物。",
    ask: "設定画面はリストにして、各行の左にアイコン、右に矢印を置いて。行の間には細い線を。",
    demo: { divider: "line", density: "comfort" },
  },
  {
    id: "table", cat: "display", ja: "テーブル", en: "Table (Data table)", aka: ["表", "データテーブル"],
    meaning: "行と列で数字や項目を見比べる表", when: "注文履歴・会員一覧など、項目をそろえて見比べたいとき。",
    ask: "注文履歴をテーブルにして、日付・お店・人数・金額の列を作って。金額は右寄せに。",
    demo: { stripe: "off", lines: "row" },
  },
  {
    id: "tabs", cat: "display", ja: "タブ", en: "Tabs",
    meaning: "見出しを押して下の中身を切り替える", when: "同じページの中で、種類の違う中身を切り替えて見せる。",
    ask: "お店のページに「メニュー・お店の情報・口コミ」のタブを付けて、押したら下の中身を切り替えて。",
    demo: { style: "underline" },
  },
  {
    id: "accordion", cat: "display", ja: "アコーディオン", en: "Accordion", aka: ["折りたたみ", "エクスパンダー", "エクスパンションパネル"],
    meaning: "見出しを押すと中身が開いたり閉じたりする", when: "よくある質問など、全部を一度に見せると長すぎるとき。",
    ask: "よくある質問をアコーディオンにして、質問を押したら答えが開くように。開いたら矢印を上向きに。",
    demo: { icon: "chevron", multi: "one" },
  },
  {
    id: "pagination", cat: "display", ja: "ページネーション", en: "Pagination", aka: ["ページ送り"],
    meaning: "番号を押して一覧のページを送る", when: "検索結果など、件数が多い一覧の下に置く。",
    ask: "検索結果は20件ずつにして、下にページネーションを付けて。今のページは色を塗って。",
  },
  {
    id: "avatar", cat: "display", ja: "アバター", en: "Avatar",
    meaning: "人を表す小さな顔写真や頭文字", when: "コメント・メンバー一覧・ログイン中の表示など、誰かを示すとき。",
    ask: "コメントの左に丸いアバターを出して。写真がない人は名前の頭文字を出して。",
    demo: { shape: "circle", size: "md" },
  },
  {
    id: "divider", cat: "display", ja: "区切り線", en: "Divider", aka: ["ディバイダー", "罫線"],
    meaning: "まとまりを分ける細い線", when: "メニューの項目のまとまりや、ページの段落の区切りに。",
    ask: "「店内のようす」と「アクセス」の間に、細い区切り線を入れて。",
  },

  {
    id: "carousel", cat: "display", ja: "カルーセル", en: "Carousel", aka: ["スライドショー", "画像スライダー"],
    meaning: "画像やカードを1枚ずつ横に送って見せる", when: "トップの大きな写真や、おすすめを順番に見せたいとき。",
    ask: "トップの写真をカルーセルにして。左右の矢印と下の点で送れるようにし、5秒ごとに自動で次へ送って。",
  },
  {
    id: "timeline", cat: "display", ja: "タイムライン", en: "Timeline", aka: ["沿革", "履歴"],
    meaning: "出来事を時間の順に線でつないで並べる", when: "会社の沿革・注文の配送状況・更新履歴など、いつ何があったかを見せるとき。",
    ask: "配送状況をタイムラインにして。縦の線に点を打ち、日時と出来事を新しい順に並べて。今の段階の点は色を付けて。",
  },
  {
    id: "icon", cat: "display", ja: "アイコン", en: "Icon", aka: ["ピクトグラム", "マーク"],
    meaning: "意味を表す小さな絵", when: "メニューや項目の頭に付けて、文字を読まなくても意味が分かるようにするとき。",
    ask: "メニューの各項目の左に、線で描いた20pxのアイコンを付けて。色は文字と同じにして。",
  },
  {
    id: "infinite-scroll", cat: "display", ja: "無限スクロール", en: "Infinite scroll", aka: ["もっと読み込む", "自動読み込み"],
    meaning: "下まで見ると続きを自動で読み込む", when: "タイムラインや写真の一覧など、終わりを意識せず見続けてもらいたいとき。",
    ask: "一覧は無限スクロールにして。下から200pxの所まで来たら次の20件を読み込み、読み込み中は一番下にスピナーを出して。",
  },
  {
    id: "chart", cat: "display", ja: "チャート（グラフ）", en: "Chart", aka: ["グラフ", "棒グラフ", "折れ線グラフ", "円グラフ"],
    meaning: "数字を棒・線・円の形で見せる", when: "売上や来店数など、数字の大小や増減を一目で比べたいとき。",
    ask: "月ごとの予約数を棒グラフのチャートにして。横軸は月、縦軸は件数、棒の上に数字も出して。",
  },

  // ===== 状態を伝える =====
  {
    id: "alert", cat: "status", ja: "アラート", en: "Alert (Banner)", aka: ["バナー", "お知らせ", "メッセージ"],
    meaning: "画面の中に残る、色付きのお知らせ枠", when: "入力の誤り・メンテナンス予告など、読んでほしいことを消えずに出しておく。",
    ask: "ページの上にメンテナンス予告のアラートを出して。淡い青の枠に、iのアイコンと見出しを付けて。",
    demo: { kind: "info", style: "soft" },
  },
  {
    id: "badge", cat: "status", ja: "バッジ", en: "Badge",
    meaning: "件数や新着を示す小さな印", when: "ベルのアイコンに未読数を出すなど、別の物の角に重ねて使う。",
    ask: "ヘッダーのベルのアイコンにバッジを付けて、未読の数を赤い丸に白い数字で出して。",
    demo: { style: "count" },
  },
  {
    id: "chip", cat: "status", ja: "チップ", en: "Chip (Tag)", aka: ["タグ", "ラベル", "ピル"],
    meaning: "小さな札。条件や分類を示す", when: "絞り込み条件・記事のカテゴリ・入力したキーワードの表示に。",
    ask: "一覧の上に「電源あり・Wi-Fi・テラス席」の絞り込みのチップを並べて、押したら選んだ色に変えて。",
    demo: { style: "soft", removable: "off" },
  },
  {
    id: "progress", cat: "status", ja: "プログレスバー", en: "Progress bar", aka: ["進捗バー", "線形プログレス"],
    meaning: "どこまで進んだかを横の棒で示す", when: "アップロードや手続きの残りなど、進み具合が分かる待ち時間に。",
    ask: "写真のアップロード中はプログレスバーを出して、右に何％まで進んだかを出して。",
    demo: { thick: "8", label: "on" },
  },
  {
    id: "spinner", cat: "status", ja: "スピナー", en: "Spinner (Loading indicator)", aka: ["ローディング", "くるくる", "円形プログレス"],
    meaning: "くるくる回って待ちを示す", when: "どのくらいかかるか分からない、数秒の待ち時間に。",
    ask: "送信中はボタンの文字の代わりにスピナーを出して、二度押しできないようにして。",
  },
  {
    id: "skeleton", cat: "status", ja: "スケルトン", en: "Skeleton (Skeleton screen)", aka: ["スケルトンスクリーン", "スケルトンローダー"],
    meaning: "読み込み中に中身と同じ形の灰色の枠を出す", when: "一覧やカードを読み込む間、どこに何が出るかを先に見せる。",
    ask: "お店の一覧を読み込んでいる間は、カードと同じ形のスケルトンを出して。",
    demo: { anim: "shimmer" },
  },
  {
    id: "stepper", cat: "status", ja: "ステップ表示", en: "Step indicator (Stepper)", aka: ["ステッパー", "プログレスステップ"],
    meaning: "手続きの何番目にいるかを示す", when: "申し込みや購入など、何画面かに分かれた手続きの上に置く。",
    ask: "予約の手続きの上にステップ表示を付けて、「入力 → 確認 → 完了」のどこにいるかを出して。",
  },
  {
    id: "empty", cat: "status", ja: "エンプティステート", en: "Empty state",
    meaning: "中身がまだないときの案内", when: "お気に入りや検索結果が0件のとき、真っ白にせず次の行動を案内する。",
    ask: "お気に入りが0件のときはエンプティステートを出して、「お店をさがす」ボタンで次の行動を案内して。",
  },
];

export const PART_MAP: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

export const shortEn = (p: Part) => p.en.replace(/ \(.+\)$/, "");

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
  { title: "スティッキーと固定表示", parts: ["sticky", "fixed"], rule: "固定表示は、最初から最後まで画面の同じ位置に貼り付く。スティッキーは、決めた位置に来るまでは普通に流れ、そこで止まって付いてくる（入っている枠の終わりまで来ると一緒に流れる）。" },
  { title: "パディングとマージン", parts: ["spacing"], rule: "パディングは枠の内側（枠線と中身の間）の余白。マージンは枠の外側（隣の物との間）の余白。背景色が付くのはパディングまで。" },
  { title: "カラムとグリッド", parts: ["column", "grid"], rule: "カラムは画面を大きく縦の列に分ける（本文と目次など、中身の種類が違う）。グリッドは同じ大きさの枠を縦横にそろえて並べる（商品一覧など、同じ種類の物）。" },
  { title: "レスポンシブとブレークポイント", parts: ["responsive", "breakpoint"], rule: "レスポンシブは「画面幅に合わせて組み方を変える」という考え方。ブレークポイントは「何pxで変えるか」という境目の数値。" },
  { title: "オーバーレイとモーダル", parts: ["overlay", "modal"], rule: "オーバーレイは後ろにかぶせる半透明の幕。モーダルはその幕の上に出る窓。「モーダルの後ろを暗く」はオーバーレイのこと。" },
  { title: "ヒーローとファーストビュー", parts: ["hero", "first-view"], rule: "ヒーローはページ最上部の大きな見せ場という「部品（区画）」。ファーストビューは開いて最初に見える「範囲」。ヒーローはたいていファーストビューの中に置く。" },
  { title: "カルーセルとスライダー", parts: ["carousel", "slider"], rule: "カルーセルは画像やカードを横に送って見せる「見せる部品」。スライダーはつまみを動かして値を選ぶ「入力の部品」。写真を送る物を「スライダー」と呼ぶこともあるが、AIにはカルーセルと書くと間違えない。" },
  { title: "オートコンプリート・セレクトボックス・検索バー", parts: ["autocomplete", "select", "search"], rule: "セレクトボックスは決まった選択肢から選ぶだけ。オートコンプリートは打った文字に合う候補を出して選ばせる。検索バーは打った言葉で一覧を絞り込む（候補を出すこともある）。" },
  { title: "タイムラインとステップ表示", parts: ["timeline", "stepper"], rule: "タイムラインは「いつ何があったか」を時間の順に並べる。ステップ表示は「手続きの今どこか」を示す。配送状況はどちらでも作れるが、日時を見せたいならタイムライン。" },
  { title: "無限スクロールとページネーション", parts: ["infinite-scroll", "pagination"], rule: "無限スクロールは下まで来ると勝手に続きが出る。ページネーションは番号を押してページを替える。何件目かを覚えて戻りたい一覧（検索結果など）はページネーションが向く。" },
  { title: "フレックスボックスとグリッド", parts: ["flexbox", "grid"], rule: "フレックスボックスは1列（横か縦）に並べる。グリッドは縦横の表のように並べる。ボタンを横に並べるならフレックスボックス、カードを何列にも並べるならグリッド。" },
  { title: "ギャップと余白", parts: ["gap", "spacing"], rule: "ギャップは並んだ部品どうしの「間」だけのすき間（端には付かない）。マージンは1つ1つの部品の外側に付く余白。並べる物の間を空けるならギャップと言うと伝わる。" },
  { title: "アイコンとアイコンボタン", parts: ["icon", "icon-button"], rule: "アイコンは意味を表す絵そのもの。アイコンボタンはアイコンだけでできた押せるボタン。押せない飾りの絵ならアイコン。" },
  { title: "スピナー・スケルトン・プログレスバー", parts: ["spinner", "skeleton", "progress"], rule: "終わりが読めない短い待ちはスピナー、一覧の読み込みはスケルトン、進み具合が分かるならプログレスバー。" },
];
