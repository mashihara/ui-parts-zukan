import { BASE_PATH } from "@/lib/site";
import { SISTER } from "@/lib/sister";

// サイト共通の上の帯。部品の名前はトップの一覧へ、見分け方（/confusions/）と AI への渡し方（/how-to/）は別ページへ飛ぶ。
// 名前の横の切り替えで、姉妹サイトのアプリ部品図鑑（スマホアプリの部品）へ移れる（アプリ部品図鑑にも同じ形の切り替えがある）
export default function SiteHeader({ current }: { current?: "confusions" | "how-to" }) {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <a className="brand-name" href={`${BASE_PATH}/`}>UI部品図鑑</a>
        <nav className="zukan-switch" aria-label="図鑑の切り替え">
          <span aria-current="page">Web</span>
          <a href={SISTER.url} title={`${SISTER.name}（${SISTER.what}）`}>アプリ</a>
        </nav>
      </div>
      <nav className="top-links">
        <a href={`${BASE_PATH}/#names`}>部品の名前</a>
        <a className="top-confuse" href={`${BASE_PATH}/confusions/`} aria-current={current === "confusions" ? "page" : undefined}>見分け方</a>
        <a href={`${BASE_PATH}/how-to/`} aria-current={current === "how-to" ? "page" : undefined}>AIへの渡し方</a>
      </nav>
    </header>
  );
}
