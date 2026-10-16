import Dictionary from "@/components/Dictionary";
import { CONFUSIONS, PARTS, PART_MAP, shortEn } from "@/lib/parts";

export default function Page() {
  return (
    <div className="site">
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">UI部品図鑑</span>
        </div>
        <nav className="top-links">
          <a href="#names">部品の名前</a>
          <a href="#confuse">見分け方</a>
          <a href="#ai">AIへの渡し方</a>
        </nav>
      </header>

      <section className="intro">
        <h1>
          <span>その部品、</span>
          <em>なんて呼ぶ？</em>
        </h1>
        <p>
          「上の帯」「出てくる窓」では、AIに伝わりません。画面に図面のように名前を書き込みました。
          名前を押すと、意味と使いどころ、そのまま使えるAIへの頼み方が分かります。
        </p>
      </section>

      <Dictionary />

      <section className="info" id="confuse">
        <h2>まぎらわしい名前の見分け方</h2>
        <p className="info-lead">AIへの頼みごとで特に取り違えやすい名前です。名前を正しく書くだけで、出てくる画面がぐっと狙いに近づきます。</p>
        <div className="confuse-grid">
          {CONFUSIONS.map((c) => (
            <article key={c.title} className="confuse">
              <h3>{c.title}</h3>
              <p>{c.rule}</p>
              <p className="confuse-names">{c.parts.map((id) => `${PART_MAP[id].ja}（${shortEn(PART_MAP[id])}）`).join(" ／ ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info" id="ai">
        <h2>AIへの渡し方</h2>
        <div className="how">
          <article>
            <h3>名前を入れて頼む</h3>
            <p>いちばん簡単な使い方です。調べた名前を、いつもの頼みごとに入れるだけで伝わり方が変わります。各部品の「AIへの頼み方の例」をそのまま使えます。</p>
            <pre>上の帯をおしゃれにして{"\n"}↓{"\n"}ヘッダーの左にロゴ、右にログインボタンを置いて。</pre>
          </article>
          <article>
            <h3>選んだ名前をまとめて渡す</h3>
            <p>使いたい部品を「AIに渡す名前に入れる」で選び、下の帯の「AIに渡す文を見る」からコピーします。名前・意味・頼み方の例がまとめて入ります。</p>
            <pre>1. モーダル（Modal）: 背景を暗くして…{"\n"}2. トースト（Toast）: 画面の端に出て…</pre>
          </article>
          <article>
            <h3>名前の一覧ごと読ませる</h3>
            <p>
              <a href="llms.txt">llms.txt</a> と <a href="api/v1/catalog.json">catalog.json</a> に、{PARTS.length}個の名前・意味・頼み方の例をまとめています。AIに読ませれば、名前で話せるようになります。
            </p>
            <pre>（このサイトの）llms.txt を読んで、{"\n"}この画面の部品を正しい名前で説明して。</pre>
          </article>
        </div>
      </section>

      <footer className="credit">
        <p>
          「名前を知っていれば、AIに頼める」という考え方は、大滝昇平さんの
          <a href="https://showheyohtaki.github.io/motion-prompt/" target="_blank" rel="noreferrer"> Motion Prompt </a>
          から学びました。動きの名前はそちらで調べられます。
        </p>
      </footer>
    </div>
  );
}
