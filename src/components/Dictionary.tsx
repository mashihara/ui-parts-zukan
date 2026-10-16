"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Icon from "./Icon";
import ScreenMap from "./ScreenMap";
import { PartPreview } from "./previews";
import { DEFAULT_TOKENS, cssVars } from "@/lib/tokens";
import { CATEGORIES, CONFUSIONS, PARTS, PART_MAP, shortEn } from "@/lib/parts";
import { DEFAULT_PART, fromQuery, toQuery, type AppState } from "@/lib/state";
import { buildPrompt } from "@/lib/prompt";

const VARS = cssVars(DEFAULT_TOKENS) as CSSProperties;

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 権限がない環境向けの予備
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function Dictionary() {
  const [s, setS] = useState<AppState>({ picks: [], part: DEFAULT_PART });
  const [filter, setFilter] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const loaded = useRef(false);

  // URL から状態を読む（共有リンク・AIが作ったリンクを開いたとき）。
  // 静的書き出しのHTMLは既定の状態で作られるため、表示のずれを避けて読み込み後に1回だけ反映する
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS(fromQuery(window.location.search));
    loaded.current = true;
  }, []);

  const query = useMemo(() => toQuery(s), [s]);
  useEffect(() => {
    if (!loaded.current) return;
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [query]);

  const part = PART_MAP[s.part];
  const picked = s.picks.includes(s.part);
  const base = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}`;
  const link = s.picks.length ? `${base}?pick=${s.picks.join(",")}` : base;
  const related = CONFUSIONS.filter((c) => c.parts.includes(s.part));

  const show = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };
  const open = (id: string, scroll = false) => {
    setS((cur) => ({ ...cur, part: id }));
    if (scroll) document.getElementById("entry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const togglePick = (id: string) => setS((cur) => ({ ...cur, picks: cur.picks.includes(id) ? cur.picks.filter((x) => x !== id) : [...cur.picks, id] }));

  const q = filter.trim().toLowerCase();
  const match = (id: string) => {
    if (!q) return true;
    const p = PART_MAP[id];
    return [p.ja, p.en, p.meaning, ...(p.aka ?? [])].join(" ").toLowerCase().includes(q);
  };

  return (
    <>
      <div className="studio">
        <main className="board" aria-label="図面">
          <ScreenMap onPick={(id) => open(id, typeof window !== "undefined" && window.innerWidth < 1180)} selected={s.part} />
          <p className="board-note">
            モーダル・ダイアログ・ドロワーなど、<b>画面に重なって出る窓</b>は図面の外です。下の「部品の名前」から開けます。
          </p>
        </main>

        <aside className="entry" id="entry" aria-label="部品の説明">
          <div className="entry-head">
            <span>{CATEGORIES.find((c) => c.id === part.cat)?.label}</span>
            <span className="entry-en">{part.en}</span>
          </div>
          <div className="entry-body">
            <h2>{part.ja}</h2>
            {part.aka && <p className="entry-aka">別名　{part.aka.join("、")}</p>}
            <p className="entry-meaning">{part.meaning}</p>
            <button type="button" className={`pick ${picked ? "is-on" : ""}`} onClick={() => togglePick(part.id)} aria-pressed={picked}>
              <Icon name={picked ? "check" : "plus"} size={18} />
              {picked ? "AIに渡す名前に入れました" : "AIに渡す名前に入れる"}
            </button>
            <div className="kit entry-preview" style={VARS}>
              <PartPreview key={part.id} id={part.id} o={part.demo ?? {}} />
            </div>
            <dl className="entry-dl">
              <dt>使いどころ</dt>
              <dd>{part.when}</dd>
              <dt>AIへの頼み方の例</dt>
              <dd className="ask">
                「{part.ask}」
                <button type="button" onClick={async () => (await copyText(part.ask)) && show("頼み方の例をコピーしました")}>
                  <Icon name="copy" size={14} />コピー
                </button>
              </dd>
            </dl>
            {related.map((c) => (
              <div key={c.title} className="entry-confuse">
                <b>まぎらわしい名前：{c.title}</b>
                <p>{c.rule}</p>
                <div className="entry-links">
                  {c.parts.filter((id) => id !== part.id).map((id) => (
                    <button type="button" key={id} onClick={() => open(id)}>{PART_MAP[id].ja}を見る</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="catalog" id="names" aria-label="部品の名前">
        <div className="sec-head">
          <h2>部品の名前<span>{PARTS.length}</span></h2>
          <label className="find">
            <Icon name="search" size={16} />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="名前・別名・ことばで探す（例：窓、帯、選ぶ）" aria-label="部品を探す" />
          </label>
        </div>
        {CATEGORIES.map((c) => {
          const items = PARTS.filter((p) => p.cat === c.id && match(p.id));
          if (!items.length) return null;
          return (
            <div key={c.id} className="cat">
              <h3>{c.label}<small>{c.desc}</small></h3>
              <ul>
                {items.map((p) => (
                  <li key={p.id}>
                    <button type="button" className={`name-card ${s.part === p.id ? "is-on" : ""}`} onClick={() => open(p.id, true)}>
                      <span className="nc-ja">{p.ja}{s.picks.includes(p.id) && <i aria-label="AIに渡す名前に入れた">●</i>}</span>
                      <span className="nc-en">{shortEn(p)}</span>
                      <span className="nc-m">{p.meaning}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {PARTS.every((p) => !match(p.id)) && <p className="none">「{filter}」に当てはまる名前はありません。別のことばで探してください。</p>}
      </section>

      <div className="dock" role="region" aria-label="AIに渡す名前">
        <div className="dock-picks">
          <span className="dock-label">AIに渡す名前</span>
          {s.picks.length === 0 ? (
            <span className="dock-empty">部品の説明で「AIに渡す名前に入れる」を押すと、ここに並びます</span>
          ) : (
            s.picks.map((id) => (
              <span key={id} className="dock-chip">
                <button type="button" onClick={() => open(id, true)}>{PART_MAP[id].ja}</button>
                <button type="button" aria-label={`${PART_MAP[id].ja}を外す`} onClick={() => togglePick(id)}><Icon name="x" size={12} stroke={2.4} /></button>
              </span>
            ))
          )}
        </div>
        <button type="button" className="dock-go" disabled={!s.picks.length} onClick={() => setSheetOpen(true)}>{s.picks.length ? "AIに渡す文を見る" : "名前を選ぶと渡せます"}</button>
      </div>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="prompt-sheet" role="dialog" aria-modal="true" aria-label="AIに渡す文" onClick={(e) => e.stopPropagation()}>
            <div className="ps-head">
              <h2>AIに渡す文</h2>
              <button type="button" className="ps-x" aria-label="閉じる" onClick={() => setSheetOpen(false)}><Icon name="x" size={18} /></button>
            </div>
            <p className="ps-lead">Claude・ChatGPT・Codex・Cursor などに貼り、最後の行に作りたい物や直したい所を書き足してください。</p>
            <pre className="ps-text" tabIndex={0}>{buildPrompt(s.picks, link)}</pre>
            <div className="ps-actions">
              <button type="button" className="ps-ghost" onClick={async () => (await copyText(link)) && show("リンクをコピーしました")}>リンクだけコピー</button>
              <button type="button" className="ps-go" onClick={async () => (await copyText(buildPrompt(s.picks, link))) && show("AIに渡す文をコピーしました")}>文をコピー</button>
            </div>
          </div>
        </div>
      )}

      {flash && <div className="flash" role="status">{flash}</div>}
    </>
  );
}
