"use client";
// 画面の地図：見本の画面の部品に名前の札を付け、押すとその部品を選ぶ
import { createContext, useContext, useState, type ReactNode } from "react";
import Icon from "./Icon";
import { Screen } from "./previews";
import { PART_MAP } from "@/lib/parts";

type Ctx = { hover: string | null; setHover: (id: string | null) => void; onPick: (id: string) => void; showAll: boolean; selected: string | null };
const MapCtx = createContext<Ctx | null>(null);

function Spot({ id, children, className = "", as = "div", tagPos = "tl" }: { id: string; children: ReactNode; className?: string; as?: "div" | "span"; tagPos?: "tl" | "tr" | "bl" | "br" }) {
  const c = useContext(MapCtx)!;
  const Tag = as;
  const p = PART_MAP[id];
  const on = c.hover === id || c.showAll || c.selected === id;
  return (
    <Tag
      className={`spot ${className} ${c.hover === id ? "is-hover" : ""} ${c.selected === id ? "is-sel" : ""} ${on ? "show-tag" : ""}`}
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
      <span className={`spot-tag pos-${tagPos}`} aria-hidden={!on}>
        {p.ja}
      </span>
    </Tag>
  );
}

export default function ScreenMap({ onPick, selected, showAll }: { onPick: (id: string) => void; selected: string | null; showAll: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  const { Btn, Field, Toggle, Check, Radios, Tabs, Card, Accordion, Alert, Stepper } = Screen;
  return (
    <MapCtx.Provider value={{ hover, setHover, onPick, showAll, selected }}>
      <div className="map">
        <Spot id="header" className="map-header" tagPos="bl">
          <header className="k-header bg-surface" style={{ height: 60 }}>
            <span className="k-logo"><Icon name="coffee" size={22} />もりカフェ</span>
            <Spot id="global-nav" as="span" tagPos="bl">
              <nav className="k-gnav c-underline"><a className="is-on">お店をさがす</a><a>予約</a><a>お知らせ</a></nav>
            </Spot>
            <span className="map-header-right">
              <Spot id="search" as="span" className="map-search" tagPos="bl">
                <label className="k-search sh-pill" style={{ height: 38 }}><Icon name="search" size={16} /><input placeholder="駅名・お店" aria-label="検索" /></label>
              </Spot>
              <Spot id="badge" as="span" tagPos="bl">
                <span className="k-anchor"><span className="k-icon-btn sh-circle st-ghost"><Icon name="bell" /></span><span className="k-badge">3</span></span>
              </Spot>
              <Spot id="avatar" as="span" tagPos="br">
                <span className="k-avatar sh-circle" style={{ width: 34, height: 34 }}><Icon name="user" size={18} /></span>
              </Spot>
            </span>
          </header>
        </Spot>

        <div className="map-body">
          <Spot id="breadcrumb" className="map-crumb">
            <nav className="k-crumb"><a>ホーム</a><span>›</span><a>渋谷</a><span>›</span><b>森のコーヒー 駅前店</b></nav>
          </Spot>
          <Spot id="alert">
            <Alert o={{ kind: "info", style: "soft" }} />
          </Spot>

          <div className="map-cols">
            <div className="map-col">
              <Spot id="card">
                <Card o={{ media: "top", hover: "none" }} />
              </Spot>
              <div className="map-row">
                <Spot id="chip" as="span"><span className="k-chip st-soft is-on">電源あり</span></Spot>
                <span className="k-chip st-soft is-on">Wi-Fi</span>
                <span className="k-chip st-soft">テラス席</span>
                <Spot id="tooltip" as="span" className="map-tip">
                  <span className="k-anchor">
                    <span className="k-icon-btn sh-circle st-tonal"><Icon name="heart" /></span>
                    <span className="k-tooltip st-dark">お気に入りに追加</span>
                  </span>
                </Spot>
              </div>
              <Spot id="tabs">
                <Tabs o={{ style: "underline" }} />
              </Spot>
              <Spot id="accordion">
                <Accordion o={{ icon: "chevron", multi: "one" }} />
              </Spot>
            </div>

            <div className="map-col form">
              <h3 className="map-h">席を予約する</h3>
              <Spot id="stepper"><Stepper /></Spot>
              <Spot id="text-field"><Field label="お名前" value="森 はな" /></Spot>
              <Spot id="select">
                <label className="k-field s-outline">
                  <span className="k-field-label">人数</span>
                  <span className="k-field-box sel"><select defaultValue="2名" aria-label="人数"><option>1名</option><option>2名</option><option>3名</option></select><Icon name="chevronDown" size={18} /></span>
                </label>
              </Spot>
              <Spot id="radio"><Radios o={{ layout: "vertical" }} /></Spot>
              <Spot id="checkbox"><Check label="禁煙席を希望" init /></Spot>
              <Spot id="toggle"><Toggle label="前日にお知らせを受け取る" /></Spot>
              <Spot id="button"><Btn o={{ variant: "filled", size: "lg", width: "full" }}>予約内容を確認する</Btn></Spot>
            </div>
          </div>
        </div>

        <Spot id="footer" className="map-footer">
          <footer className="k-footer l-simple bg-surface">
            <span className="k-logo sm"><Icon name="coffee" size={18} />もりカフェ</span>
            <span className="k-footer-links"><a>利用規約</a><a>プライバシー</a><a>お問い合わせ</a></span>
            <small>© 2026</small>
          </footer>
        </Spot>

        <Spot id="toast" className="map-toast" tagPos="bl">
          <div role="status" className="k-toast pos-corner st-dark is-open" style={{ position: "static" }}>
            <Icon name="check" size={18} />お気に入りに追加しました
          </div>
        </Spot>
      </div>
    </MapCtx.Provider>
  );
}
