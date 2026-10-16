"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Icon from "./Icon";
import ScreenMap from "./ScreenMap";
import { PartPreview } from "./previews";
import { ACCENTS, GLOBAL_KNOBS, MOODS, cssVars, type Tokens } from "@/lib/tokens";
import { CATEGORIES, CONFUSIONS, PARTS, PART_MAP, defaultOpts } from "@/lib/parts";
import { fromQuery, initialState, toQuery, type AppState } from "@/lib/state";
import { buildPrompt } from "@/lib/prompt";

type View = "map" | "part";

function Stops({ value, options, onChange, name }: { value: string; options: { v: string; label: string; note?: string }[]; onChange: (v: string) => void; name: string }) {
  return (
    <div className="stops" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={value === o.v ? "is-on" : ""} onClick={() => onChange(o.v)}>
          <span className="led" aria-hidden="true" />
          <span className="stop-label">{o.label}</span>
          {o.note && <span className="stop-note">{o.note}</span>}
        </button>
      ))}
    </div>
  );
}

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

export default function Studio() {
  const [s, setS] = useState<AppState>(initialState);
  const [sel, setSel] = useState<string>("modal");
  const [view, setView] = useState<View>("map");
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [withCss, setWithCss] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const loaded = useRef(false);

  // URL から状態を読む（共有リンク・AIが作ったリンクを開いたとき）。
  // 静的書き出しのHTMLは既定の状態で作られるため、表示のずれを避けて読み込み後に1回だけ反映する
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const st = fromQuery(window.location.search);
    const q = new URLSearchParams(window.location.search);
    const part = q.get("part") ?? st.picks[0];
    setS(st);
    if (part && PART_MAP[part]) {
      setSel(part);
      setView("part");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    loaded.current = true;
  }, []);

  const query = useMemo(() => toQuery(s), [s]);
  useEffect(() => {
    if (!loaded.current) return;
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [query]);

  const link = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
  const prompt = useMemo(() => buildPrompt(s, link, { css: withCss }), [s, link, withCss]);
  const vars = cssVars(s.tokens) as CSSProperties;
  const part = PART_MAP[sel];
  const opts = { ...defaultOpts(part), ...(s.opts[sel] ?? {}) };
  const picked = s.picks.includes(sel);

  const setToken = (key: keyof Tokens, v: string) => setS((cur) => ({ ...cur, tokens: { ...cur.tokens, [key]: v } }));
  const setOpt = (key: string, v: string) => setS((cur) => ({ ...cur, opts: { ...cur.opts, [sel]: { ...(cur.opts[sel] ?? {}), [key]: v } } }));
  const togglePick = (id: string) => setS((cur) => ({ ...cur, picks: cur.picks.includes(id) ? cur.picks.filter((x) => x !== id) : [...cur.picks, id] }));
  const openPart = (id: string) => {
    setSel(id);
    setView("part");
    document.getElementById("stage")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const flash = (msg: string) => {
    setCopied(msg);
    setTimeout(() => setCopied(null), 1800);
  };

  const q = filter.trim().toLowerCase();
  const match = (id: string) => {
    if (!q) return true;
    const p = PART_MAP[id];
    return [p.ja, p.en, p.meaning, ...(p.aka ?? [])].join(" ").toLowerCase().includes(q);
  };
  const related = CONFUSIONS.filter((c) => c.parts.includes(sel));
  const moodOn = MOODS.find((m) => GLOBAL_KNOBS.every((kn) => (m.tokens[kn.key] ?? "") === s.tokens[kn.key]))?.id;

  return (
    <>
      <div className="studio">
        {/* ---- 左：名前の一覧 ---- */}
        <aside className="panel index" aria-label="部品の名前の一覧">
          <div className="panel-head">
            <h2>部品の名前</h2>
            <span className="count">{PARTS.length}</span>
          </div>
          <label className="find">
            <Icon name="search" size={16} />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="名前・別名・ことばで探す" aria-label="部品を探す" />
          </label>
          <div className="index-scroll">
            {CATEGORIES.map((c) => {
              const items = PARTS.filter((p) => p.cat === c.id && match(p.id));
              if (!items.length) return null;
              return (
                <section key={c.id}>
                  <h3 title={c.desc}>{c.label}</h3>
                  <ul>
                    {items.map((p) => (
                      <li key={p.id}>
                        <button type="button" className={`index-item ${sel === p.id && view === "part" ? "is-on" : ""}`} onClick={() => openPart(p.id)}>
                          <span className="ii-name">{p.ja}</span>
                          <span className="ii-en">{p.en.replace(/ \(.+\)$/, "")}</span>
                          {s.picks.includes(p.id) && <span className="ii-pick" aria-label="指示に入れた">●</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </aside>

        {/* ---- 中央：見本 ---- */}
        <main className="stage" id="stage">
          <div className="stage-tabs" role="tablist" aria-label="見方">
            <button type="button" role="tab" aria-selected={view === "map"} className={view === "map" ? "is-on" : ""} onClick={() => setView("map")}>
              画面の地図<small>名前を調べる</small>
            </button>
            <button type="button" role="tab" aria-selected={view === "part"} className={view === "part" ? "is-on" : ""} onClick={() => setView("part")}>
              {part.ja}<small>見た目を調整する</small>
            </button>
            {view === "map" && (
              <label className="showall">
                <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
                名前を全部出す
              </label>
            )}
          </div>

          {view === "map" ? (
            <div className="map-wrap">
              <p className="lead">画面の部品にカーソルを乗せると名前が出ます。押すと、その部品の説明と調整に進みます。</p>
              <div className="kit map-kit" style={vars}>
                <ScreenMap onPick={openPart} selected={null} showAll={showAll} />
              </div>
              <p className="map-note">
                モーダル・ダイアログ・ドロワーなど<strong>重なって出る窓</strong>は、左の一覧の「重なって出る窓」から開けます。
              </p>
            </div>
          ) : (
            <div className="part-view">
              <div className="part-head">
                <div>
                  <p className="part-cat">{CATEGORIES.find((c) => c.id === part.cat)?.label}</p>
                  <h2>{part.ja}</h2>
                  <p className="part-en">
                    {part.en}
                    {part.aka && <span> ・ 別名 {part.aka.join("、")}</span>}
                  </p>
                </div>
                <button type="button" className={`pick-btn ${picked ? "is-on" : ""}`} onClick={() => togglePick(sel)} aria-pressed={picked}>
                  <Icon name={picked ? "check" : "plus"} size={18} />
                  {picked ? "指示に入れた" : "AIへの指示に入れる"}
                </button>
              </div>
              <p className="part-meaning">{part.meaning}</p>
              <p className="part-when"><b>使いどころ</b>{part.when}</p>
              <div className="kit preview" style={vars}>
                <PartPreview key={`${sel}-${JSON.stringify(opts)}`} id={sel} o={opts} />
              </div>
              {related.map((c) => (
                <div key={c.title} className="confuse-inline">
                  <b>まぎらわしい名前：{c.title}</b>
                  <p>{c.rule}</p>
                  <div className="chips">
                    {c.parts.filter((id) => id !== sel).map((id) => (
                      <button type="button" key={id} onClick={() => openPart(id)}>{PART_MAP[id].ja}を見る</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ---- 右：つまみ ---- */}
        <aside className="panel knobs" aria-label="つまみ">
          {view === "part" && part.knobs.length > 0 && (
            <section className="knob-group">
              <h2>{part.ja}のつまみ</h2>
              {part.knobs.map((kn) => (
                <div key={kn.key} className="knob">
                  <div className="knob-label">{kn.label}</div>
                  <Stops name={kn.label} value={opts[kn.key]} options={kn.options} onChange={(v) => setOpt(kn.key, v)} />
                </div>
              ))}
            </section>
          )}
          <section className="knob-group">
            <h2>全体の雰囲気</h2>
            <p className="knob-hint">すべての部品にまとめて効きます。迷ったら、ことば1つで選べます。</p>
            <div className="moods">
              {MOODS.map((m) => (
                <button key={m.id} type="button" className={moodOn === m.id ? "is-on" : ""} onClick={() => setS((cur) => ({ ...cur, tokens: { ...cur.tokens, ...m.tokens } }))}>
                  <b>{m.label}</b>
                  <small>{m.desc}</small>
                </button>
              ))}
            </div>
            {GLOBAL_KNOBS.map((kn) => (
              <div key={kn.key} className="knob">
                <div className="knob-label">
                  {kn.label}
                  <span>{kn.hint}</span>
                </div>
                {kn.kind === "color" ? (
                  <div className="swatches" role="radiogroup" aria-label={kn.label}>
                    {ACCENTS.map((a) => (
                      <button key={a.v} type="button" role="radio" aria-checked={s.tokens.accent === a.v} aria-label={a.label} title={a.label} className={s.tokens.accent === a.v ? "is-on" : ""} style={{ background: `#${a.v}` }} onClick={() => setToken("accent", a.v)} />
                    ))}
                    <label className="swatch-custom" title="好きな色">
                      <input type="color" value={`#${s.tokens.accent}`} onChange={(e) => setToken("accent", e.target.value.slice(1))} aria-label="好きな色を選ぶ" />
                      好きな色
                    </label>
                  </div>
                ) : (
                  <Stops name={kn.label} value={s.tokens[kn.key]} options={kn.options} onChange={(v) => setToken(kn.key, v)} />
                )}
              </div>
            ))}
            <button type="button" className="reset" onClick={() => setS((cur) => ({ ...cur, tokens: initialState().tokens }))}>雰囲気を最初に戻す</button>
          </section>
        </aside>
      </div>

      {/* ---- 下：AIへの指示 ---- */}
      <div className="dock" role="region" aria-label="AIへの指示">
        <div className="dock-picks">
          <span className="dock-label">AIへの指示に入れた部品</span>
          {s.picks.length === 0 ? (
            <span className="dock-empty">まだありません（全体の雰囲気だけを渡します）</span>
          ) : (
            s.picks.map((id) => (
              <span key={id} className="dock-chip">
                <button type="button" onClick={() => openPart(id)}>{PART_MAP[id].ja}</button>
                <button type="button" aria-label={`${PART_MAP[id].ja}を外す`} onClick={() => togglePick(id)}><Icon name="x" size={12} stroke={2.4} /></button>
              </span>
            ))
          )}
        </div>
        <div className="dock-actions">
          <button type="button" className="ghost" onClick={async () => (await copyText(link)) && flash("リンクをコピーしました")}>リンクをコピー</button>
          <button type="button" className="primary" onClick={() => setPromptOpen(true)}>AIへの指示文を見る</button>
        </div>
      </div>

      {promptOpen && (
        <div className="sheet-backdrop" onClick={() => setPromptOpen(false)}>
          <div className="prompt-sheet" role="dialog" aria-modal="true" aria-label="AIへの指示文" onClick={(e) => e.stopPropagation()}>
            <div className="ps-head">
              <h2>AIへの指示文</h2>
              <button type="button" className="ps-x" aria-label="閉じる" onClick={() => setPromptOpen(false)}><Icon name="x" size={18} /></button>
            </div>
            <p className="ps-lead">Claude・ChatGPT・Codex・Cursor などのチャットにそのまま貼ってください。「このデザインでログイン画面を作って」のように、作りたい物を一言添えると伝わります。</p>
            <label className="ps-opt">
              <input type="checkbox" checked={withCss} onChange={(e) => setWithCss(e.target.checked)} />
              CSS変数の一覧も入れる（コードを書くAI向け）
            </label>
            <pre className="ps-text" tabIndex={0}>{prompt}</pre>
            <div className="ps-actions">
              <span className="ps-count">{prompt.length.toLocaleString()}文字</span>
              <button type="button" className="ghost" onClick={async () => (await copyText(link)) && flash("リンクをコピーしました")}>リンクだけコピー</button>
              <button type="button" className="primary" onClick={async () => (await copyText(prompt)) && flash("指示文をコピーしました")}>指示文をコピー</button>
            </div>
          </div>
        </div>
      )}

      {copied && <div className="flash" role="status">{copied}</div>}
    </>
  );
}
