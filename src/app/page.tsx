import Studio from "@/components/Studio";
import { CONFUSIONS, PARTS, PART_MAP } from "@/lib/parts";

export default function Page() {
  return (
    <div className="site">
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-name">UIつまみ</span>
          <span className="brand-en">UI Knobs</span>
        </div>
        <nav className="top-links">
          <a href="#names">見分け方</a>
          <a href="#ai">AIへの渡し方</a>
          <a href="llms.txt">llms.txt</a>
        </nav>
      </header>

      <section className="intro">
        <h1>
          <span>部品の名前が分かれば、</span>
          <span>AIのデザインは</span>
          <span>見違える。</span>
        </h1>
        <p>
          「上の帯」「出てくる窓」ではAIに伝わりません。画面の部品を押せば正式な名前が分かり、角の丸さや余白は言葉のつまみで決められます。
          決めた見た目は、名前と数値の入った指示文になって、そのままAIに渡せます。
        </p>
      </section>

      <Studio />

      <section className="info" id="names">
        <h2>まぎらわしい名前の見分け方</h2>
        <p className="info-lead">AIへの指示でよく取り違えられる名前です。名前を正しく書くだけで、出てくる物がぐっと狙いに近づきます。</p>
        <div className="confuse-grid">
          {CONFUSIONS.map((c) => (
            <article key={c.title} className="confuse">
              <h3>{c.title}</h3>
              <p>{c.rule}</p>
              <p className="confuse-names">{c.parts.map((id) => `${PART_MAP[id].ja}（${PART_MAP[id].en.replace(/ \(.+\)$/, "")}）`).join(" ／ ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info" id="ai">
        <h2>AIへの渡し方</h2>
        <div className="how">
          <article>
            <h3>1. 指示文をコピーして貼る</h3>
            <p>画面下の「AIへの指示文を見る」からコピーし、Claude・ChatGPT・Codex・Cursor などに貼ります。作りたい物を一言添えてください。</p>
            <pre>（コピーした指示文）{"\n"}このデザインで、カフェの予約画面を作ってください。</pre>
          </article>
          <article>
            <h3>2. リンクを渡す</h3>
            <p>調整した状態はURLに入っています。ページを読めるAIなら、リンクを渡すだけで同じ指定を読み取れます。チームでの共有にも使えます。</p>
            <pre>この見た目で作って：{"\n"}https://…/?accent=db2777&radius=999&pick=button,modal</pre>
          </article>
          <article>
            <h3>3. 名前の一覧ごと読ませる</h3>
            <p>
              <a href="llms.txt">llms.txt</a> と <a href="api/v1/catalog.json">catalog.json</a> に、{PARTS.length}個の部品の名前・意味・つまみ・URLの書き方をまとめています。AIに「このサイトを読んで」と渡せば、名前で話せるようになります。
            </p>
            <pre>https://…/llms.txt を読んで、{"\n"}この画面の部品を正しい名前で説明して。</pre>
          </article>
        </div>
      </section>

      <footer className="credit">
        <p>
          「名前を知っていれば、AIに頼める」という考え方は、大滝昇平さんの
          <a href="https://showheyohtaki.github.io/motion-prompt/" target="_blank" rel="noreferrer"> Motion Prompt </a>
          から学びました。動きの名前はそちらで調べられます。UIつまみは、その考え方をUI部品の見た目の調整に広げた別のサイトです。
        </p>
      </footer>
    </div>
  );
}
