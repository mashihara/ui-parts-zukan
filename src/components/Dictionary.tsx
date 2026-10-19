"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Icon from "./Icon";
import ScreenMap, { MAP_PARTS } from "./ScreenMap";
import { PartPreview } from "./previews";
import { DEFAULT_TOKENS, cssVars } from "@/lib/tokens";
import { CATEGORIES, CONFUSIONS, PARTS, PART_MAP, shortEn, type Part } from "@/lib/parts";
import { fromQuery, toQuery, type AppState } from "@/lib/state";
import { buildPrompt } from "@/lib/prompt";
import { BASE_PATH, SITE_NAME, TOP_TITLE, catLabel, partPath, partTitle } from "@/lib/site";

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

// PC幅（これ以上）は右の列に説明をずっと出し、狭い幅は下から重ねて開く
const SIDE_MQ = "(min-width: 1100px)";

export default function Dictionary({ children, initialPart }: { children?: ReactNode; initialPart?: string }) {
  // 部品のページ（/parts/<id>/）は、その部品を選んだ状態で書き出す（検索エンジンにも説明が見える）
  const [s, setS] = useState<AppState>({ picks: [], part: initialPart ?? null });
  // 全体図に無い部品を単体で見せているとき、「全体図に戻る」を押した部品（その部品の間は全体図を出す）
  const [mapFor, setMapFor] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const loaded = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const toc = useRef<HTMLElement>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [side, setSide] = useState(false);
  // 画面幅が分かるまでは重ねて開く欄を出さない（書き出したHTMLでPC幅に一瞬かぶさらないように）
  const [ready, setReady] = useState(false);

  // 画面幅で、右の列にするか重ねて開くかを決める
  useEffect(() => {
    const mq = window.matchMedia(SIDE_MQ);
    const on = () => setSide(mq.matches);
    on();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // URL から状態を読む（共有リンク・AIが作ったリンクを開いたとき）。
  // 静的書き出しのHTMLは既定の状態で作られるため、表示のずれを避けて読み込み後に1回だけ反映する
  useEffect(() => {
    const q = fromQuery(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS({ picks: q.picks, part: q.part ?? initialPart ?? null });
    loaded.current = true;
  }, [initialPart]);

  // 選んだ部品は URL のパス（/parts/<id>/）、AIに渡す名前はクエリ（?pick=）に書く。題も部品に合わせる
  const query = useMemo(() => toQuery({ picks: s.picks, part: null }), [s.picks]);
  useEffect(() => {
    if (!loaded.current) return;
    const path = `${BASE_PATH}${s.part ? partPath(s.part) : "/"}`;
    window.history.replaceState(null, "", `${path}${query ? `?${query}` : ""}${window.location.hash}`);
    document.title = s.part ? partTitle(PART_MAP[s.part]) : TOP_TITLE;
  }, [s.part, query]);

  const part = s.part ? PART_MAP[s.part] : null;
  const index = part ? PARTS.findIndex((p) => p.id === part.id) : -1;
  // 重ねて開く欄が出ているのは、狭い幅で部品を選んでいるときだけ
  const isOpen = !!part && ready && !side;
  // 全体図に無い部品（重なって出る窓など）は、真ん中を単体の見本に切り替える
  const focus = part && !MAP_PARTS.has(part.id) && mapFor !== part.id ? part : null;
  // 単体表示に切り替えても下の一覧の位置が動かないよう、全体図の高さを覚えて同じ高さにする
  const board = useRef<HTMLElement>(null);
  const [mapH, setMapH] = useState(0);
  useEffect(() => {
    const el = board.current?.querySelector<HTMLElement>(".drawing");
    if (!el) return;
    const ro = new ResizeObserver(() => setMapH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [focus]);

  // 部品を選んだら、目次はその分類だけを開く
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (part) setOpenCat(part.cat);
  }, [part]);

  // 目次の選んだ部品が見えるよう、目次の中だけを動かす（ページの位置は変えない）
  useEffect(() => {
    const nav = toc.current;
    const on = nav?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!nav || !on) return;
    if (on.offsetTop < nav.scrollTop || on.offsetTop + on.offsetHeight > nav.scrollTop + nav.clientHeight) nav.scrollTop = on.offsetTop - nav.clientHeight / 2;
  }, [part]);

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

  // 共有リンクはトップに pick を付けた形（どの部品のページからでも同じ）
  const base = typeof window === "undefined" ? "" : `${window.location.origin}${BASE_PATH}/`;
  const link = s.picks.length ? `${base}?pick=${s.picks.join(",")}` : base;

  const show = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };
  const open = (id: string) => {
    if (!s.part && !side) opener.current = document.activeElement as HTMLElement | null;
    setS((cur) => ({ ...cur, part: id }));
  };
  // 目次から選んだときは、図面のその部品が見えるところまでページを動かす。
  // 真ん中が全体図と単体表示で切り替わることがあるので、描き終えてから測る
  const pendingScroll = useRef<string | null>(null);
  const openFromToc = (id: string) => {
    pendingScroll.current = id;
    open(id);
  };
  useEffect(() => {
    const id = pendingScroll.current;
    if (!id || id !== s.part) return;
    pendingScroll.current = null;
    requestAnimationFrame(() => {
      // 全体図に無い部品は単体表示の上端、全体図にある部品はその部品を目安にする（狭い見本で省いた部品では動かさない）
      const el = document.querySelector<HTMLElement>(`.sheet [data-part="${id}"]`) ?? document.querySelector<HTMLElement>(".focus");
      const r0 = el?.getBoundingClientRect();
      if (!r0 || !r0.width || !r0.height) return;
      const r = el!.classList.contains("focus") ? { top: r0.top, bottom: r0.top + 360, height: 360 } : r0;
      const dock = document.querySelector<HTMLElement>(".dock")?.offsetHeight ?? 0;
      const viewH = window.innerHeight - dock;
      // すでに全体が見えていれば動かさない
      if (r.top >= 12 && r.bottom <= viewH - 12) return;
      const top = window.scrollY + r.top - Math.max(24, (viewH - r.height) / 2);
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
    });
  }, [s.part, focus]);
  // 何も選んでいないときは、次＝最初、前＝最後の部品を開く
  const step = (d: number) => open(PARTS[index < 0 ? (d > 0 ? 0 : PARTS.length - 1) : (index + d + PARTS.length) % PARTS.length].id);
  const togglePick = (id: string) => setS((cur) => ({ ...cur, picks: cur.picks.includes(id) ? cur.picks.filter((x) => x !== id) : [...cur.picks, id] }));

  // 部品の説明の中身（右の列と、重ねて開く欄で共通）
  const entry = (p: Part) => (
    <>
              <h2 className="entry-title">{p.ja}</h2>
              <p className="entry-en">{p.en}</p>
              {p.aka && <p className="entry-aka">別名　{p.aka.join("、")}</p>}
              <p className="entry-meaning">{p.meaning}</p>
              {pickBtn(p)}
              <div className="kit entry-preview" style={VARS}>
                <PartPreview id={p.id} o={p.demo ?? {}} />
              </div>
              <dl className="entry-dl">
                <dt>使いどころ</dt>
                <dd>{p.when}</dd>
                <dt>AIへの頼み方の例</dt>
                <dd className="ask">
                  「{p.ask}」
                  <button type="button" onClick={async () => (await copyText(p.ask)) && show("頼み方の例をコピーしました")}>
                    <Icon name="copy" size={14} />コピー
                  </button>
                </dd>
              </dl>
              {CONFUSIONS.filter((c) => c.parts.includes(p.id)).map((c) => (
                <div key={c.title} className="entry-confuse">
                  <b>まぎらわしい名前</b>
                  <p><strong>{c.title}</strong>　{c.rule}</p>
                  <div className="entry-links">
                    {c.parts.filter((id) => id !== p.id).map((id) => (
                      <button type="button" key={id} onClick={() => open(id)}>{PART_MAP[id].ja}を見る</button>
                    ))}
                  </div>
                </div>
              ))}
    </>
  );

  // AIに渡す名前に入れるボタン
  const pickBtn = (p: Part) => (
      <button type="button" className={`pick ${s.picks.includes(p.id) ? "is-on" : ""}`} onClick={() => togglePick(p.id)} aria-pressed={s.picks.includes(p.id)}>
        <Icon name={s.picks.includes(p.id) ? "check" : "plus"} size={18} />
        {s.picks.includes(p.id) ? "AIに渡す名前に入れました" : "AIに渡す名前に入れる"}
      </button>
  );

  const stepper = (
    <>
      <button type="button" onClick={() => step(-1)} aria-label="前の部品"><Icon name="chevronLeft" size={18} /></button>
      <span className="dh-count">{index >= 0 ? index + 1 : "–"} / {PARTS.length}</span>
      <button type="button" onClick={() => step(1)} aria-label="次の部品"><Icon name="chevronRight" size={18} /></button>
    </>
  );

  const q = filter.trim().toLowerCase();
  const match = (id: string) => {
    if (!q) return true;
    const p = PART_MAP[id];
    return [p.ja, p.en, p.meaning, ...(p.aka ?? [])].join(" ").toLowerCase().includes(q);
  };

  return (
    <>
      {/* 見出し。部品を選んでいるときは、その部品の名前を h1 にする（部品のページでも同じ） */}
      {part ? (
        <section className="intro is-part">
          <nav className="crumbs" aria-label="現在地">
            <a href={`${BASE_PATH}/`} onClick={(e) => { e.preventDefault(); setS((cur) => ({ ...cur, part: null })); }}>{SITE_NAME}</a>
            <span aria-hidden="true">›</span>
            <span>{catLabel(part.id)}</span>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{part.ja}</span>
          </nav>
          <h1>{part.ja}<small>{shortEn(part)}</small></h1>
          <p>{part.meaning}。{part.when}</p>
        </section>
      ) : (
        <section className="intro">
          <h1>
            <span>その部品、</span>
            <em>なんて呼ぶ？</em>
          </h1>
          <p>「上の帯」「出てくる窓」では、AIに伝わりません。見本の画面に、図面のように部品の名前を書き込みました。名前を押すと、意味とAIへの頼み方が分かります。</p>
        </section>
      )}
      <div className="split">
      {/* 広いPC幅：全部の部品の目次（左の列） */}
      <nav className="toc" ref={toc} aria-label="部品の目次">
        <h2>部品の目次</h2>
        {/* 分類ごとのアコーディオン。開くのは1つだけ（選んだ部品の分類が開く） */}
        {CATEGORIES.map((c) => {
          const items = PARTS.filter((p) => p.cat === c.id);
          const isOpen = openCat === c.id;
          return (
            <div key={c.id} className={`toc-cat ${isOpen ? "is-open" : ""}`}>
              <button type="button" className="toc-head" aria-expanded={isOpen} aria-controls={`toc-${c.id}`} onClick={() => setOpenCat(isOpen ? null : c.id)}>
                <span>{c.label}</span>
                <Icon name="chevronDown" size={16} />
              </button>
              {isOpen && (
                <ul id={`toc-${c.id}`}>
                  {items.map((p) => (
                    <li key={p.id}>
                      <button type="button" aria-current={s.part === p.id} onClick={() => openFromToc(p.id)}>
                        {p.ja}{s.picks.includes(p.id) && <i aria-label="AIに渡す名前に入れた">●</i>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="split-main">
      <main className="board" aria-label="図面" ref={board}>
        {focus ? (
          // 全体図に無い部品は、真ん中を単体の見本に切り替える。全体図へ戻る道は上に置く
          <div className="focus" style={{ minHeight: mapH || undefined }}>
            <div className="focus-bar">
              <button type="button" className="focus-back" onClick={() => setMapFor(focus.id)}>
                <Icon name="chevronLeft" size={18} />画面の全体図に戻る
              </button>
              <span>「{focus.ja}」は全体図に無いので、単体で表示しています</span>
            </div>
            <div className="focus-sheet">
              <p className="focus-name">{focus.ja}<small>{shortEn(focus)}</small></p>
              <div className="focus-stage kit" style={VARS} key={focus.id}>
                <PartPreview id={focus.id} o={focus.demo ?? {}} />
              </div>
            </div>
          </div>
        ) : (
          <ScreenMap onPick={open} selected={s.part ?? ""} />
        )}
        <p className="board-note">
          モーダル・ダイアログなど<b>画面に重なって出る窓</b>は、図面ではなく下の「部品の名前」にあります。
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
                      {/* 検索エンジンが部品のページへたどれるよう、リンクにする（押したときはページを移らず説明を開く） */}
                      <a className="nc-open" href={`${BASE_PATH}${partPath(p.id)}`} onClick={(e) => { e.preventDefault(); open(p.id); }} aria-label={`${p.ja}の説明を開く`} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {PARTS.every((p) => !match(p.id)) && <p className="none">「{filter}」に当てはまる名前はありません。別のことばで探してください。</p>}
      </section>
      {children}
      </div>

      {/* PC幅：説明をずっと出しておく右の列（スクロールしても付いてくる） */}
      <aside className="side" aria-label="部品の説明">
        <div className="drawer-head">
          <span className="dh-cat">{part ? CATEGORIES.find((c) => c.id === part.cat)?.label : "部品の説明"}</span>
          <span className="dh-nav">{stepper}</span>
        </div>
        {part ? (
          <div className="drawer-body" key={part.id}>{entry(part)}</div>
        ) : (
          <div className="drawer-body side-empty">
            <p className="side-lead">図面の名前や部品、下の一覧のカードを押すと、ここに説明が出ます。</p>
            <ul>
              <li>意味と使いどころ</li>
              <li>動く見本</li>
              <li>そのまま使えるAIへの頼み方</li>
              <li>まぎらわしい名前の見分け方</li>
            </ul>
            <button type="button" className="pick" onClick={() => open("modal")}>例：モーダルを見る</button>
          </div>
        )}
      </aside>
      </div>

      {isOpen && part && (
        <div className="drawer-backdrop" onClick={close}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${part.ja}の説明`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span className="dh-cat">{CATEGORIES.find((c) => c.id === part.cat)?.label}</span>
              <span className="dh-nav">
                {stepper}
                <button type="button" ref={closeBtn} className="dh-x" onClick={close} aria-label="閉じる"><Icon name="x" size={18} /></button>
              </span>
            </div>
            <div className="drawer-body" key={part.id}>
              {entry(part)}
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
