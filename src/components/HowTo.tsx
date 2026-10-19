// AIへの渡し方（/how-to/）。調べた名前を AI に渡す3つの方法を、例と一緒に並べる
import SiteHeader from "./SiteHeader";
import { PARTS } from "@/lib/parts";
import { BASE_PATH, SITE_URL } from "@/lib/site";
import LabCredit from "./LabCredit";

export default function HowTo() {
  return (
    <div className="site">
      <SiteHeader current="how-to" />
      <section className="intro is-part confuse-intro">
        <nav className="crumbs" aria-label="現在地">
          <a href={`${BASE_PATH}/`}>UI部品図鑑</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">AIへの渡し方</span>
        </nav>
        <h1>AIへの渡し方</h1>
        <p className="intro-meaning">調べた部品の名前を、AIに渡す3つの方法</p>
        <p className="intro-when">Claude・ChatGPT・Codex・Cursor など、どのAIでも使えます。上から順に手軽です。</p>
      </section>

      <ol className="how-list">
        <li className="how-row">
          <div className="confuse-text">
            <h2>名前を入れて頼む</h2>
            <p>いちばん簡単な使い方です。調べた名前を、いつもの頼みごとに入れるだけで伝わり方が変わります。各部品のページにある「AIへの頼み方の例」をそのまま使えます。</p>
            <a className="how-go" href={`${BASE_PATH}/#names`}>部品の名前を調べる →</a>
          </div>
          <pre>上の帯をおしゃれにして{"\n"}↓{"\n"}ヘッダーの左にロゴ、右にログインボタンを置いて。</pre>
        </li>
        <li className="how-row">
          <div className="confuse-text">
            <h2>選んだ名前をまとめて渡す</h2>
            <p>使いたい部品を、説明の「AIに渡す名前に入れる」で選び、下の帯の「AIに渡す文を見る」からコピーします。名前・意味・頼み方の例がまとめて入るので、そのまま貼れます。</p>
            <a className="how-go" href={`${BASE_PATH}/`}>図面から部品を選ぶ →</a>
          </div>
          <pre>1. モーダル（Modal）: 背景を暗くして…{"\n"}2. トースト（Toast）: 画面の端に出て…{"\n"}{"\n"}（ここに、作りたい物や直したい所を書いてください）</pre>
        </li>
        <li className="how-row">
          <div className="confuse-text">
            <h2>名前の一覧ごと読ませる</h2>
            <p>
              <a href={`${BASE_PATH}/llms.txt`}>llms.txt</a> と <a href={`${BASE_PATH}/api/v1/catalog.json`}>catalog.json</a> に、{PARTS.length}個の名前・意味・頼み方の例をまとめています。AIに読ませれば、名前で話せるようになります。Claude Code・Codex には、スキルとして入れることもできます。
            </p>
          </div>
          <div className="how-pres">
            <pre>{SITE_URL}/llms.txt{"\n"}を読んで、この画面の部品を正しい名前で説明して。</pre>
            <pre>npx skills add mashihara/ui-parts-zukan</pre>
          </div>
        </li>
      </ol>
      <footer className="credit">
        <p><a href={`${BASE_PATH}/`}>UI部品図鑑のトップへ戻る</a></p>
        <LabCredit />
      </footer>
    </div>
  );
}
