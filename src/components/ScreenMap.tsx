"use client";
// 図面：見本の画面の部品に、図面の引き出し線で名前を書き込む。
// 広い幅では左右の余白に名前を並べて線でつなぎ、狭い幅では部品の上に札を出す。
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Icon from "./Icon";
import { Screen } from "./previews";
import { PART_MAP, shortEn } from "@/lib/parts";
import { DEFAULT_TOKENS, cssVars } from "@/lib/tokens";

const VARS = cssVars(DEFAULT_TOKENS) as CSSProperties;

type Ctx = { hover: string | null; setHover: (id: string | null) => void; onPick: (id: string) => void; selected: string };
const MapCtx = createContext<Ctx | null>(null);

function Spot({ id, children, className = "", as = "div" }: { id: string; children: ReactNode; className?: string; as?: "div" | "span" }) {
  const c = useContext(MapCtx)!;
  const Tag = as;
  return (
    <Tag
      data-part={id}
      className={`spot ${className} ${c.hover === id ? "is-hover" : ""} ${c.selected === id ? "is-sel" : ""}`}
      onMouseOver={(e) => {
        e.stopPropagation();
        c.setHover(id);
      }}
      onMouseLeave={() => c.setHover(null)}
      onClickCapture={(e) => {
        // 部品そのものの操作より先に名前を選ぶ。入れ子のときは内側を優先
        if ((e.target as HTMLElement).closest(".spot") !== e.currentTarget) return;
        e.preventDefault();
        e.stopPropagation();
        c.onPick(id);
      }}
    >
      {children}
      <span className="spot-tag" aria-hidden="true">{PART_MAP[id].ja}</span>
    </Tag>
  );
}

type Callout = { id: string; side: "l" | "r"; ex: number; ey: number; y: number };

const WIDE = 900; // これより広ければ引き出し線で書き込む
const GAP = 36; // 名前どうしの最小の縦の間隔

export default function ScreenMap({ onPick, selected }: { onPick: (id: string) => void; selected: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const [lines, setLines] = useState<{ wide: boolean; items: Callout[]; sl: number; sr: number; h: number }>({ wide: false, items: [], sl: 0, sr: 0, h: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const { Btn, Field, Toggle, Check, Radios, Tabs, Card, Accordion, Alert, Stepper } = Screen;

  // 部品の実際の位置を測って、引き出し線と名前の位置を決める
  const layout = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const W = el.getBoundingClientRect();
    const sheet = el.querySelector(".sheet")!.getBoundingClientRect();
    if (W.width < WIDE) {
      setLines((cur) => (cur.wide ? { wide: false, items: [], sl: 0, sr: 0, h: 0 } : cur));
      return;
    }
    const sl = sheet.left - W.left;
    const sr = sheet.right - W.left;
    const mid = (sl + sr) / 2;
    const L: Callout[] = [];
    const R: Callout[] = [];
    el.querySelectorAll<HTMLElement>("[data-part]").forEach((node) => {
      const r = node.getBoundingClientRect();
      const cx = r.left - W.left + r.width / 2;
      const ey = r.top - W.top + Math.min(r.height / 2, 16);
      // 横に広い部品と左半分の部品は左へ、残りは右へ
      const left = r.width > sheet.width * 0.6 || cx < mid;
      (left ? L : R).push({ id: node.dataset.part!, side: left ? "l" : "r", ex: left ? r.left - W.left - 3 : r.right - W.left + 3, ey, y: ey });
    });
    for (const arr of [L, R]) {
      arr.sort((a, b) => a.ey - b.ey);
      let last = -Infinity;
      for (const c of arr) {
        c.y = Math.max(c.ey, last + GAP);
        last = c.y;
      }
    }
    setLines({ wide: true, items: [...L, ...R], sl, sr, h: W.height });
  }, []);

  useLayoutEffect(() => {
    layout();
    const ro = new ResizeObserver(layout);
    if (wrap.current) ro.observe(wrap.current);
    document.fonts?.ready.then(layout);
    return () => ro.disconnect();
  }, [layout]);

  const hot = (id: string) => id === selected || id === hover;

  return (
    <MapCtx.Provider value={{ hover, setHover, onPick, selected }}>
      <div ref={wrap} className={`drawing ${lines.wide ? "is-wide" : "is-narrow"}`}>
        {lines.wide && (
          <svg className="leaders" aria-hidden="true" width="100%" height={lines.h}>
            {lines.items.map((c) => {
              const bend = c.side === "l" ? lines.sl - 8 : lines.sr + 8;
              const end = c.side === "l" ? lines.sl - 22 : lines.sr + 22;
              return (
                <g key={c.id} className={hot(c.id) ? "hot" : ""}>
                  {/* 白い紙の上でも見えるよう、青い縁の上に白い線を重ねる */}
                  <path className="halo" d={`M${c.ex} ${c.ey} L${bend} ${c.y} L${end} ${c.y}`} />
                  <path d={`M${c.ex} ${c.ey} L${bend} ${c.y} L${end} ${c.y}`} />
                  <circle cx={c.ex} cy={c.ey} r={3.5} />
                </g>
              );
            })}
          </svg>
        )}
        {lines.wide &&
          lines.items.map((c) => {
            const p = PART_MAP[c.id];
            const style: CSSProperties = c.side === "l" ? { right: `calc(100% - ${lines.sl - 28}px)`, top: c.y - 10 } : { left: lines.sr + 28, top: c.y - 10 };
            return (
              <button
                key={c.id}
                type="button"
                className={`callout ${c.side} ${hot(c.id) ? "hot" : ""} ${selected === c.id ? "sel" : ""}`}
                style={style}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick(c.id)}
              >
                {p.ja}
                <small>{shortEn(p)}</small>
              </button>
            );
          })}

        <div className="sheet kit" style={VARS}>
          <div className="map">
            <Spot id="header" className="map-header">
              <header className="k-header bg-surface" style={{ height: 56 }}>
                <span className="k-logo"><Icon name="coffee" size={22} />もりカフェ</span>
                <Spot id="global-nav" as="span">
                  <nav className="k-gnav c-underline"><a className="is-on">お店をさがす</a><a>予約</a><a>お知らせ</a></nav>
                </Spot>
                <span className="map-header-right">
                  <Spot id="search" as="span" className="map-search">
                    <label className="k-search sh-pill" style={{ height: 36 }}><Icon name="search" size={16} /><input placeholder="駅名・お店" aria-label="検索" tabIndex={-1} /></label>
                  </Spot>
                  <Spot id="badge" as="span">
                    <span className="k-anchor"><span className="k-icon-btn sh-circle st-ghost"><Icon name="bell" /></span><span className="k-badge">3</span></span>
                  </Spot>
                  <Spot id="avatar" as="span">
                    <span className="k-avatar sh-circle" style={{ width: 32, height: 32 }}><Icon name="user" size={18} /></span>
                  </Spot>
                </span>
              </header>
            </Spot>

            <div className="map-body">
              <Spot id="breadcrumb">
                <nav className="k-crumb"><a>ホーム</a><span>›</span><a>渋谷</a><span>›</span><b>森のコーヒー 駅前店</b></nav>
              </Spot>
              <Spot id="alert">
                <Alert o={{ kind: "info", style: "soft" }} />
              </Spot>
              <div className="map-cols">
                <div className="map-col">
                  <Spot id="card"><Card o={{ media: "top", hover: "none" }} /></Spot>
                  <div className="map-row">
                    <Spot id="chip" as="span"><span className="k-chip st-soft is-on">電源あり</span></Spot>
                    <span className="k-chip st-soft is-on">Wi-Fi</span>
                    <Spot id="tooltip" as="span" className="map-tip">
                      <span className="k-anchor">
                        <span className="k-icon-btn sh-circle st-tonal"><Icon name="heart" /></span>
                        <span className="k-tooltip st-dark">お気に入りに追加</span>
                      </span>
                    </Spot>
                  </div>
                  <Spot id="tabs"><Tabs o={{ style: "underline" }} /></Spot>
                  <Spot id="accordion"><Accordion o={{ icon: "chevron", multi: "one" }} /></Spot>
                </div>
                <div className="map-col form">
                  <h3 className="map-h">席を予約する</h3>
                  <Spot id="stepper"><Stepper /></Spot>
                  <Spot id="text-field"><Field label="お名前" value="森 はな" /></Spot>
                  <Spot id="select">
                    <label className="k-field s-outline">
                      <span className="k-field-label">人数</span>
                      <span className="k-field-box sel"><select defaultValue="2名" aria-label="人数" tabIndex={-1}><option>1名</option><option>2名</option><option>3名</option></select><Icon name="chevronDown" size={18} /></span>
                    </label>
                  </Spot>
                  <Spot id="radio"><Radios o={{ layout: "vertical" }} /></Spot>
                  <Spot id="checkbox"><Check label="禁煙席を希望" init /></Spot>
                  <Spot id="toggle"><Toggle label="前日にお知らせ" /></Spot>
                  <Spot id="button"><Btn o={{ variant: "filled", size: "lg", width: "full" }}>予約内容を確認する</Btn></Spot>
                </div>
              </div>
            </div>
            <Spot id="toast" className="map-toast">
              <div role="status" className="k-toast st-dark is-open" style={{ position: "static" }}>
                <Icon name="check" size={18} />お気に入りに追加しました
              </div>
            </Spot>
            <Spot id="footer">
              <footer className="k-footer l-simple bg-surface">
                <span className="k-logo sm"><Icon name="coffee" size={18} />もりカフェ</span>
                <span className="k-footer-links"><a>利用規約</a><a>プライバシー</a><a>お問い合わせ</a></span>
              </footer>
            </Spot>
          </div>
        </div>
      </div>
    </MapCtx.Provider>
  );
}
