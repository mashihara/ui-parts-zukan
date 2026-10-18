"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Icon from "./Icon";
import ScreenMap from "./ScreenMap";
import { PartPreview } from "./previews";
import { DEFAULT_TOKENS, cssVars } from "@/lib/tokens";
import { CATEGORIES, CONFUSIONS, PARTS, PART_MAP, shortEn } from "@/lib/parts";
import { fromQuery, toQuery, type AppState } from "@/lib/state";
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

// 一覧のカードに載せる小さな見本。押せないようにして、カード全体を押すと説明が開く
function Thumb({ id }: { id: string }) {
  return (
    <span className="thumb kit" style={VARS} inert aria-hidden="true">
      <span className="thumb-in">
        <PartPreview id={id} o={PART_MAP[id].demo ?? {}} />
      </span>
    </span>
  );
}

export default function Dictionary() {
  const [s, setS] = useState<AppState>({ picks: [], part: null });
  const [filter, setFilter] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const loaded = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

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

  const part = s.part ? PART_MAP[s.part] : null;
  const index = part ? PARTS.findIndex((p) => p.id === part.id) : -1;
  const isOpen = !!part;

  const close = () => {
    setS((cur) => ({ ...cur, part: null }));
    // 開いたボタンへ戻る（ページの位置は動かさない）
    opener.current?.focus({ preventScroll: true });
  };

  // 説明を開いている間は後ろのページを動かさない。Esc で閉じる
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setS((cur) => ({ ...cur, part: null }));
        opener.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const base = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}`;
  const link = s.picks.length ? `${base}?pick=${s.picks.join(",")}` : base;

  const show = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };
  const open = (id: string) => {
    if (!s.part) opener.current = document.activeElement as HTMLElement | null;
    setS((cur) => ({ ...cur, part: id }));
  };
  const step = (d: number) => open(PARTS[(index + d + PARTS.length) % PARTS.length].id);
  const togglePick = (id: string) => setS((cur) => ({ ...cur, picks: cur.picks.includes(id) ? cur.picks.filter((x) => x !== id) : [...cur.picks, id] }));

  const q = filter.trim().toLowerCase();
  const match = (id: string) => {
    if (!q) return true;
    const p = PART_MAP[id];
    return [p.ja, p.en, p.meaning, ...(p.aka ?? [])].join(" ").toLowerCase().includes(q);
  };

  return (
    <>
      <main className="board" aria-label="図面">
        <ScreenMap onPick={open} selected={s.part ?? ""} />
        <p className="board-note">
          名前か部品を押すと、意味と使いどころ、AIへの頼み方が開きます。モーダル・ダイアログなど<b>画面に重なって出る窓</b>は、下の「部品の名前」にあります。
        </p>
      </main>

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
                    {/* 見本の中にボタン等があるので、カードを <button> にせず、透明なボタンをカード全体にかぶせる（ボタンの入れ子は不正なHTML） */}
                    <div className={`name-card ${s.part === p.id ? "is-on" : ""}`}>
                      <Thumb id={p.id} />
                      <span className="nc-text">
                        <span className="nc-ja">{p.ja}{s.picks.includes(p.id) && <i aria-label="AIに渡す名前に入れた">●</i>}</span>
                        <span className="nc-en">{shortEn(p)}</span>
                        <span className="nc-m">{p.meaning}</span>
                      </span>
                      <button type="button" className="nc-open" onClick={() => open(p.id)} aria-haspopup="dialog" aria-label={`${p.ja}の説明を開く`} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {PARTS.every((p) => !match(p.id)) && <p className="none">「{filter}」に当てはまる名前はありません。別のことばで探してください。</p>}
      </section>

      {part && (
        <div className="drawer-backdrop" onClick={close}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${part.ja}の説明`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span className="dh-cat">{CATEGORIES.find((c) => c.id === part.cat)?.label}</span>
              <span className="dh-nav">
                <button type="button" onClick={() => step(-1)} aria-label="前の部品"><Icon name="chevronLeft" size={18} /></button>
                <span className="dh-count">{index + 1} / {PARTS.length}</span>
                <button type="button" onClick={() => step(1)} aria-label="次の部品"><Icon name="chevronRight" size={18} /></button>
                <button type="button" ref={closeBtn} className="dh-x" onClick={close} aria-label="閉じる"><Icon name="x" size={18} /></button>
              </span>
            </div>
            <div className="drawer-body" key={part.id}>
              <h2>{part.ja}</h2>
              <p className="entry-en">{part.en}</p>
              {part.aka && <p className="entry-aka">別名　{part.aka.join("、")}</p>}
              <p className="entry-meaning">{part.meaning}</p>
              <button type="button" className={`pick ${s.picks.includes(part.id) ? "is-on" : ""}`} onClick={() => togglePick(part.id)} aria-pressed={s.picks.includes(part.id)}>
                <Icon name={s.picks.includes(part.id) ? "check" : "plus"} size={18} />
                {s.picks.includes(part.id) ? "AIに渡す名前に入れました" : "AIに渡す名前に入れる"}
              </button>
              <div className="kit entry-preview" style={VARS}>
                <PartPreview id={part.id} o={part.demo ?? {}} />
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
              {CONFUSIONS.filter((c) => c.parts.includes(part.id)).map((c) => (
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
      )}

      <div className="dock" role="region" aria-label="AIに渡す名前">
        <div className="dock-picks">
          <span className="dock-label">AIに渡す名前</span>
          {s.picks.length === 0 ? (
            <span className="dock-empty">部品の説明で「AIに渡す名前に入れる」を押すと、ここに並びます</span>
          ) : (
            s.picks.map((id) => (
              <span key={id} className="dock-chip">
                <button type="button" onClick={() => open(id)}>{PART_MAP[id].ja}</button>
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
