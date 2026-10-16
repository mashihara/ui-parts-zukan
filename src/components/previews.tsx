"use client";
// 部品の見本。色・角・余白などは親の .kit に流したCSS変数（--k-*）で決まる。
// 寸法の数値は src/lib/parts.ts の数値表と同じ物を使い、指示文と見本を一致させる。
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Icon from "./Icon";
import { AVATAR, BACKDROP, BTN_SIZE, HEADER_H, MODAL_W, TOAST_SEC } from "@/lib/parts";

type O = Record<string, string>;

// 窓の見本を描く小さな画面。中に偽の背景を敷く
function Frame({ children, h = 300, onReplay, label = "もう一度開く" }: { children: ReactNode; h?: number; onReplay?: () => void; label?: string }) {
  return (
    <div className="k-frame" style={{ height: h }}>
      <div className="k-frame-bg" aria-hidden="true">
        <div className="k-ghost w60" />
        <div className="k-ghost w90" />
        <div className="k-ghost w80" />
        <div className="k-ghost-card" />
        <div className="k-ghost w70" />
      </div>
      {children}
      {onReplay && (
        <button type="button" className="k-replay" onClick={onReplay}>
          {label}
        </button>
      )}
    </div>
  );
}

const useReplay = () => {
  const [n, setN] = useState(0);
  const [open, setOpen] = useState(true);
  const replay = () => {
    setOpen(false);
    setN((x) => x + 1);
  };
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setOpen(true), 260);
    return () => clearTimeout(t);
  }, [open, n]);
  return { open, replay, key: n };
};

export function Btn({ o = {}, children, style }: { o?: O; children?: ReactNode; style?: CSSProperties }) {
  const s = BTN_SIZE[o.size ?? "md"];
  return (
    <button
      type="button"
      className={`k-btn v-${o.variant ?? "filled"}`}
      style={{ height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, width: o.width === "full" ? "100%" : undefined, ...style }}
    >
      {children ?? "予約する"}
    </button>
  );
}

function Field({ o = {}, label = "メールアドレス", value = "" }: { o?: O; label?: string; value?: string }) {
  const [v, setV] = useState(value);
  const err = o.state === "error";
  const float = o.label === "float";
  return (
    <label className={`k-field s-${o.style ?? "outline"} ${float ? "is-float" : ""} ${err ? "is-error" : ""} ${v ? "has-value" : ""}`}>
      {!float && <span className="k-field-label">{label}</span>}
      <span className="k-field-box">
        {float && <span className="k-field-float">{label}</span>}
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={float ? "" : "name@example.com"} />
      </span>
      {err && <span className="k-field-help">メールアドレスの形で入れてください</span>}
    </label>
  );
}

function Toggle({ o = {}, init = true, label = "お知らせを受け取る" }: { o?: O; init?: boolean; label?: string }) {
  const [on, setOn] = useState(init);
  return (
    <label className="k-row-label">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={on} className={`k-toggle z-${o.size ?? "md"} c-${o.on ?? "accent"}`} onClick={() => setOn(!on)}>
        <span />
      </button>
    </label>
  );
}

function Check({ o = {}, label, init = false }: { o?: O; label: string; init?: boolean }) {
  const [on, setOn] = useState(init);
  return (
    <label className="k-check">
      <input type="checkbox" checked={on} onChange={() => setOn(!on)} />
      <span className={`k-check-box z-${o.size ?? "md"}`} aria-hidden="true">
        <Icon name="check" size={o.size === "lg" ? 18 : 15} stroke={3} />
      </span>
      {label}
    </label>
  );
}

function Radios({ o = {} }: { o?: O }) {
  const items = [
    { v: "a", t: "店内で飲む", d: "席を予約します" },
    { v: "b", t: "持ち帰り", d: "受け取り時刻を選びます" },
    { v: "c", t: "配達", d: "30分ほどで届きます" },
  ];
  const [v, setV] = useState("a");
  return (
    <fieldset className={`k-radios l-${o.layout ?? "vertical"}`}>
      <legend>受け取り方</legend>
      {items.map((it) => (
        <label key={it.v} className={`k-radio ${v === it.v ? "is-on" : ""}`}>
          <input type="radio" name="k-radio-demo" checked={v === it.v} onChange={() => setV(it.v)} />
          <span className="k-radio-dot" aria-hidden="true" />
          <span>
            <span className="k-radio-t">{it.t}</span>
            {o.layout === "card" && <span className="k-radio-d">{it.d}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function Tabs({ o = {} }: { o?: O }) {
  const tabs = ["メニュー", "お店の情報", "口コミ"];
  const [i, setI] = useState(0);
  return (
    <div className={`k-tabs t-${o.style ?? "underline"}`}>
      <div role="tablist" className="k-tablist">
        {tabs.map((t, j) => (
          <button key={t} type="button" role="tab" aria-selected={i === j} className={i === j ? "is-on" : ""} onClick={() => setI(j)}>
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="k-tabpanel" key={i}>
        {["季節のブレンド・自家製プリン・厚切りトースト", "営業 8:00〜19:00・火曜定休・駅から徒歩3分", "「静かで作業しやすい」「プリンが絶品」"][i]}
      </div>
    </div>
  );
}

function Segmented() {
  const items = ["日", "週", "月"];
  const [i, setI] = useState(1);
  return (
    <div className="k-seg" role="radiogroup" style={{ ["--n" as string]: items.length, ["--i" as string]: i }}>
      <span className="k-seg-thumb" aria-hidden="true" />
      {items.map((t, j) => (
        <button key={t} type="button" role="radio" aria-checked={i === j} onClick={() => setI(j)}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Card({ o = {} }: { o?: O }) {
  return (
    <article className={`k-card m-${o.media ?? "top"} ${o.hover === "none" ? "" : "is-lift"}`}>
      {o.media !== "none" && <div className="k-card-img" aria-hidden="true"><Icon name="coffee" size={34} stroke={1.4} /></div>}
      <div className="k-card-body">
        <h4>森のコーヒー 駅前店</h4>
        <p>静かな店内で、季節の豆を一杯ずつ淹れます。</p>
        <div className="k-card-meta"><Icon name="star" size={14} /> 4.6　・　¥600〜</div>
      </div>
    </article>
  );
}

function Accordion({ o = {} }: { o?: O }) {
  const qs = [
    ["予約の取り消しはできますか？", "前日の20時まで、予約の一覧から取り消せます。"],
    ["支払い方法は？", "現金・カード・電子マネーが使えます。"],
    ["子ども連れでも入れますか？", "はい。ベビーカーのまま入れる席があります。"],
  ];
  const [open, setOpen] = useState<number[]>([0]);
  const tog = (i: number) =>
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : o.multi === "many" ? [...cur, i] : [i]));
  return (
    <div className={`k-acc i-${o.icon ?? "chevron"}`}>
      {qs.map(([q, a], i) => (
        <div key={q} className={`k-acc-item ${open.includes(i) ? "is-open" : ""}`}>
          <button type="button" aria-expanded={open.includes(i)} onClick={() => tog(i)}>
            {q}
            <span className="k-acc-ic" aria-hidden="true">
              <Icon name={o.icon === "plus" ? (open.includes(i) ? "minus" : "plus") : "chevronDown"} size={18} />
            </span>
          </button>
          <div className="k-acc-panel"><div><p>{a}</p></div></div>
        </div>
      ))}
    </div>
  );
}

function Modal({ o }: { o: O }) {
  const { open, replay, key } = useReplay();
  return (
    <Frame onReplay={replay} h={330}>
      <div key={key} className={`k-overlay ${open ? "is-open" : ""}`} style={{ ["--backdrop" as string]: BACKDROP[o.backdrop] }}>
        <div className={`k-modal mo-${o.motion}`} style={{ width: `min(${MODAL_W[o.size]}px, calc(100% - 32px))` }} role="dialog" aria-modal="true" aria-label="予約の内容">
          <button type="button" className="k-x" aria-label="閉じる" onClick={replay}><Icon name="x" size={18} /></button>
          <h4>予約の内容</h4>
          <p>10月18日（土）14:00〜・2名・窓ぎわの席</p>
          <div className="k-actions">
            <Btn o={{ variant: "text", size: "md" }}>キャンセル</Btn>
            <Btn o={{ variant: "filled", size: "md" }}>この内容で予約</Btn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Dialog({ o }: { o: O }) {
  const { open, replay, key } = useReplay();
  const danger = o.tone === "danger";
  return (
    <Frame onReplay={replay} h={300}>
      <div key={key} className={`k-overlay ${open ? "is-open" : ""}`} style={{ ["--backdrop" as string]: 0.5 }}>
        <div className="k-modal mo-zoom k-dialog" style={{ width: "min(400px, calc(100% - 32px))" }} role="alertdialog" aria-modal="true" aria-label="確認">
          <h4>{danger ? "予約を取り消しますか？" : "この内容で送信しますか？"}</h4>
          <p>{danger ? "取り消すと元に戻せません。" : "送信後はお店から確認のメールが届きます。"}</p>
          <div className={`k-actions b-${o.buttons}`}>
            {o.buttons === "stack" ? (
              <>
                <Btn o={{ variant: "filled", size: "md", width: "full" }} style={danger ? { background: "var(--k-danger)", color: "#fff" } : undefined}>{danger ? "取り消す" : "送信する"}</Btn>
                <Btn o={{ variant: "text", size: "md", width: "full" }}>キャンセル</Btn>
              </>
            ) : (
              <>
                <Btn o={{ variant: "outline", size: "md", width: o.buttons === "full" ? "full" : "auto" }}>キャンセル</Btn>
                <Btn o={{ variant: "filled", size: "md", width: o.buttons === "full" ? "full" : "auto" }} style={danger ? { background: "var(--k-danger)", color: "#fff" } : undefined}>{danger ? "取り消す" : "送信する"}</Btn>
              </>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Drawer({ o }: { o: O }) {
  const { open, replay, key } = useReplay();
  return (
    <Frame onReplay={replay} h={320}>
      <div key={key} className={`k-overlay is-side ${open ? "is-open" : ""}`} style={{ ["--backdrop" as string]: 0.4 }}>
        <nav className={`k-drawer side-${o.side}`} style={{ width: `min(${o.width === "wide" ? 400 : 280}px, 85%)` }} aria-label="メニュー">
          <div className="k-drawer-head">メニュー<button type="button" className="k-x static" aria-label="閉じる" onClick={replay}><Icon name="x" size={18} /></button></div>
          {[["home", "ホーム"], ["calendar", "予約の一覧"], ["heart", "お気に入り"], ["gear", "設定"]].map(([ic, t], i) => (
            <a key={t} className={i === 0 ? "is-on" : ""}><Icon name={ic} size={18} />{t}</a>
          ))}
        </nav>
      </div>
    </Frame>
  );
}

function BottomSheet({ o }: { o: O }) {
  const { open, replay, key } = useReplay();
  return (
    <Frame onReplay={replay} h={340}>
      <div key={key} className={`k-overlay is-bottom ${open ? "is-open" : ""}`} style={{ ["--backdrop" as string]: 0.4 }}>
        <div className={`k-sheet ${o.height === "half" ? "is-half" : ""}`} role="dialog" aria-label="並べ替え">
          {o.handle === "on" ? <span className="k-sheet-handle" aria-hidden="true" /> : <button type="button" className="k-x" aria-label="閉じる" onClick={replay}><Icon name="x" size={18} /></button>}
          <h4>並べ替え</h4>
          {["おすすめ順", "近い順", "評価の高い順"].map((t, i) => (
            <div key={t} className="k-sheet-row">{t}{i === 0 && <Icon name="check" size={18} />}</div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function Popover({ o }: { o: O }) {
  return (
    <div className="k-stage-center" style={{ minHeight: 230, alignItems: "flex-start", paddingTop: 24 }}>
      <div className="k-anchor">
        <Btn o={{ variant: "outline", size: "md" }}>人数：2名 <Icon name="chevronDown" size={16} /></Btn>
        <div className={`k-popover ${o.arrow === "on" ? "has-arrow" : ""}`} role="dialog" aria-label="人数">
          <div className="k-pop-row">大人<span className="k-mini-step"><button type="button" aria-label="減らす"><Icon name="minus" size={14} /></button>2<button type="button" aria-label="増やす"><Icon name="plus" size={14} /></button></span></div>
          <div className="k-pop-row">子ども<span className="k-mini-step"><button type="button" aria-label="減らす"><Icon name="minus" size={14} /></button>0<button type="button" aria-label="増やす"><Icon name="plus" size={14} /></button></span></div>
          <Btn o={{ variant: "filled", size: "sm", width: "full" }}>決定</Btn>
        </div>
      </div>
    </div>
  );
}

function Tooltip({ o }: { o: O }) {
  return (
    <div className="k-stage-center" style={{ minHeight: 160 }}>
      <span className="k-anchor">
        <button type="button" className="k-icon-btn sh-circle st-tonal" aria-label="お気に入りに追加"><Icon name="heart" /></button>
        <span className={`k-tooltip st-${o.style}`} role="tooltip">お気に入りに追加</span>
      </span>
    </div>
  );
}

function Toast({ o }: { o: O }) {
  const { open, replay, key } = useReplay();
  useEffect(() => {
    if (!open) return;
    // 指定秒数で消える（見本は消えたあと手で出し直す）
    const t = setTimeout(replay, TOAST_SEC[o.sec] * 1000 + 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, o.sec]);
  return (
    <Frame h={260}>
      <div key={key} role="status" className={`k-toast pos-${o.pos} st-${o.style} ${open ? "is-open" : ""}`}>
        <Icon name="check" size={18} />予約を保存しました<button type="button">元に戻す</button>
      </div>
    </Frame>
  );
}

function DropdownMenu({ o }: { o: O }) {
  const items: [string, string, boolean?][] = [["edit", "編集"], ["copy", "複製"], ["trash", "削除", true]];
  return (
    <div className="k-stage-center" style={{ minHeight: 230, alignItems: "flex-start", paddingTop: 24 }}>
      <div className="k-anchor">
        <button type="button" className="k-icon-btn sh-circle st-ghost" aria-label="操作" aria-expanded="true"><Icon name="more" /></button>
        <div className="k-menu" role="menu">
          {items.map(([ic, t, danger], i) => (
            <div key={t}>
              {danger && <hr className="k-divider tight" />}
              <button type="button" role="menuitem" className={`${danger ? "is-danger" : ""} ${i === 0 ? "is-hover" : ""}`}>
                {o.icons === "on" && <Icon name={ic} size={16} />}{t}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({ o }: { o: O }) {
  return (
    <div className="k-frame" style={{ height: 200 }}>
      <header className={`k-header bg-${o.bg}`} style={{ height: HEADER_H[o.height] }}>
        <span className="k-logo"><Icon name="coffee" size={22} />もりカフェ</span>
        <nav className="k-gnav c-underline">
          <a className="is-on">お店をさがす</a><a>予約</a><a>お知らせ</a>
        </nav>
        <Btn o={{ variant: o.bg === "accent" ? "tonal" : "filled", size: "sm" }}>ログイン</Btn>
      </header>
      <div className="k-frame-bg below" aria-hidden="true"><div className="k-ghost w60" /><div className="k-ghost w90" /><div className="k-ghost-card" /></div>
    </div>
  );
}

function Footer({ o }: { o: O }) {
  return (
    <footer className={`k-footer l-${o.layout} bg-${o.bg}`}>
      {o.layout === "columns" ? (
        <>
          <div className="k-footer-cols">
            <div><b>サービス</b><a>お店をさがす</a><a>予約の一覧</a></div>
            <div><b>会社</b><a>運営会社</a><a>採用情報</a></div>
            <div><b>サポート</b><a>よくある質問</a><a>お問い合わせ</a></div>
          </div>
          <small>© 2026 もりカフェ</small>
        </>
      ) : (
        <>
          <span className="k-logo sm"><Icon name="coffee" size={18} />もりカフェ</span>
          <span className="k-footer-links"><a>利用規約</a><a>プライバシー</a><a>お問い合わせ</a></span>
          <small>© 2026</small>
        </>
      )}
    </footer>
  );
}

function Sidebar({ o }: { o: O }) {
  const items: [string, string][] = [["home", "ホーム"], ["calendar", "予約"], ["user", "会員"], ["gear", "設定"]];
  return (
    <div className="k-frame" style={{ height: 260, display: "flex" }}>
      <aside className={`k-sidebar w-${o.width}`} aria-label="サイドメニュー">
        {items.map(([ic, t], i) => (
          <a key={t} className={i === 1 ? "is-on" : ""} title={t}><Icon name={ic} size={20} />{o.width === "wide" && <span>{t}</span>}</a>
        ))}
      </aside>
      <div className="k-frame-bg inline" aria-hidden="true"><div className="k-ghost w60" /><div className="k-ghost w90" /><div className="k-ghost-card" /></div>
    </div>
  );
}

function BottomNav({ o }: { o: O }) {
  const items: [string, string][] = [["home", "ホーム"], ["search", "さがす"], ["calendar", "予約"], ["user", "マイページ"]];
  const [i, setI] = useState(0);
  return (
    <div className="k-frame phone" style={{ height: 300 }}>
      <div className="k-frame-bg" aria-hidden="true"><div className="k-ghost w60" /><div className="k-ghost w90" /><div className="k-ghost-card" /></div>
      <nav className="k-bnav" aria-label="画面の切り替え">
        {items.map(([ic, t], j) => (
          <button key={t} type="button" className={i === j ? "is-on" : ""} onClick={() => setI(j)} aria-current={i === j ? "page" : undefined}>
            <Icon name={ic} size={22} />
            {(o.labels === "always" || i === j) && <span>{t}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Alert({ o }: { o: O }) {
  const txt: Record<string, [string, string, string]> = {
    info: ["info", "お知らせ", "10月20日はメンテナンスのため予約を受け付けません。"],
    success: ["check", "予約が確定しました", "確認のメールを送りました。"],
    warning: ["alert", "残りわずか", "この時間帯の席は残り2つです。"],
    error: ["alert", "エラー", "カード番号が正しくありません。もう一度入れてください。"],
  };
  const [ic, t, d] = txt[o.kind];
  return (
    <div className={`k-alert kd-${o.kind} st-${o.style}`} role={o.kind === "error" ? "alert" : "status"}>
      <Icon name={ic} size={20} />
      <div><b>{t}</b><p>{d}</p></div>
    </div>
  );
}

function Table({ o }: { o: O }) {
  const rows = [["10/18", "森のコーヒー 駅前店", "2名", "¥1,200"], ["10/12", "森のコーヒー 川沿い店", "1名", "¥650"], ["10/03", "森のコーヒー 駅前店", "3名", "¥2,100"], ["9/27", "森のコーヒー 本店", "2名", "¥1,500"]];
  return (
    <div className="k-table-wrap">
      <table className={`k-table ln-${o.lines} ${o.stripe === "on" ? "is-stripe" : ""}`}>
        <thead><tr><th>日付</th><th>お店</th><th>人数</th><th className="num">金額</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="num">{r[3]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function List({ o }: { o: O }) {
  const items: [string, string, string][] = [["bell", "お知らせ", "予約の前日に通知"], ["calendar", "予約の一覧", "3件"], ["heart", "お気に入りのお店", "12件"], ["gear", "アカウント設定", ""]];
  return (
    <ul className={`k-list d-${o.divider} h-${o.density}`}>
      {items.map(([ic, t, d]) => (
        <li key={t}><span className="k-list-ic"><Icon name={ic} size={18} /></span><span className="k-list-t">{t}{d && <small>{d}</small>}</span><Icon name="chevronRight" size={18} /></li>
      ))}
    </ul>
  );
}

function Progress({ o }: { o: O }) {
  const [v, setV] = useState(64);
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div className="k-progress-row">
        <div className="k-progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} style={{ height: Number(o.thick) }}>
          <span style={{ width: `${v}%` }} />
        </div>
        {o.label === "on" && <span className="k-num">{v}%</span>}
      </div>
      <button type="button" className="k-replay inline" onClick={() => setV(v >= 100 ? 12 : Math.min(100, v + 22))}>進める</button>
    </div>
  );
}

function Pagination() {
  const [p, setP] = useState(2);
  const pages = [1, 2, 3, 0, 10];
  return (
    <nav className="k-pager" aria-label="ページ">
      <button type="button" disabled={p === 1} onClick={() => setP(Math.max(1, p - 1))} aria-label="前へ"><Icon name="chevronLeft" size={18} /></button>
      {pages.map((n, i) => (n === 0 ? <span key={i}>…</span> : <button key={i} type="button" className={p === n ? "is-on" : ""} aria-current={p === n ? "page" : undefined} onClick={() => setP(n)}>{n}</button>))}
      <button type="button" disabled={p === 10} onClick={() => setP(Math.min(10, p + 1))} aria-label="次へ"><Icon name="chevronRight" size={18} /></button>
    </nav>
  );
}

function Stepper() {
  return (
    <ol className="k-steps">
      {["入力", "確認", "完了"].map((t, i) => (
        <li key={t} className={i === 0 ? "is-done" : i === 1 ? "is-now" : ""}>
          <span>{i === 0 ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>{t}
        </li>
      ))}
    </ol>
  );
}

function Empty() {
  return (
    <div className="k-empty">
      <Icon name="inbox" size={48} stroke={1.3} />
      <b>お気に入りはまだありません</b>
      <p>気になるお店の♡を押すと、ここに並びます。</p>
      <Btn o={{ variant: "filled", size: "md" }}>お店をさがす</Btn>
    </div>
  );
}

function SliderDemo({ o }: { o: O }) {
  const [v, setV] = useState(40);
  return (
    <div className="k-slider-row" style={{ maxWidth: 420, width: "100%" }}>
      <div className={`k-slider ${o.value === "bubble" ? "has-bubble" : ""}`} style={{ ["--v" as string]: `${v}%` }}>
        <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} aria-label="予算" />
        {o.value === "bubble" && <span className="k-slider-bubble">¥{v * 30}</span>}
      </div>
      {o.value !== "bubble" && <span className="k-num">¥{v * 30}</span>}
    </div>
  );
}

export function PartPreview({ id, o }: { id: string; o: O }) {
  switch (id) {
    case "header": return <Header o={o} />;
    case "global-nav":
      return (
        <nav className={`k-gnav standalone c-${o.current}`} aria-label="グローバルナビ">
          <a className="is-on">お店をさがす</a><a>予約</a><a>お知らせ</a><a>使い方</a>
        </nav>
      );
    case "footer": return <Footer o={o} />;
    case "sidebar": return <Sidebar o={o} />;
    case "breadcrumb":
      return (
        <nav className="k-crumb" aria-label="パンくずリスト">
          <a>ホーム</a><span aria-hidden="true">{o.sep === "slash" ? "/" : "›"}</span><a>お店をさがす</a><span aria-hidden="true">{o.sep === "slash" ? "/" : "›"}</span><b aria-current="page">森のコーヒー 駅前店</b>
        </nav>
      );
    case "hero":
      return (
        <section className={`k-hero a-${o.align}`}>
          <div>
            <h3>いつもの一杯を、<br />待たずに。</h3>
            <p>近くのカフェの空き席を見て、そのまま予約できます。</p>
            <Btn o={{ variant: "filled", size: "lg" }}>お店をさがす</Btn>
          </div>
          {o.align !== "center" && <div className="k-hero-img" aria-hidden="true"><Icon name="coffee" size={64} stroke={1.2} /></div>}
        </section>
      );
    case "bottom-nav": return <BottomNav o={o} />;
    case "modal": return <Modal o={o} />;
    case "dialog": return <Dialog o={o} />;
    case "drawer": return <Drawer o={o} />;
    case "bottom-sheet": return <BottomSheet o={o} />;
    case "popover": return <Popover o={o} />;
    case "tooltip": return <Tooltip o={o} />;
    case "toast": return <Toast o={o} />;
    case "dropdown-menu": return <DropdownMenu o={o} />;
    case "button":
      return (
        <div className="k-stack" style={{ width: o.width === "full" ? "100%" : undefined, maxWidth: 420 }}>
          <Btn o={o} />
          <Btn o={o}>使えない状態</Btn>
        </div>
      );
    case "icon-button":
      return (
        <div className="k-hstack">
          {["heart", "bell", "gear", "x"].map((ic) => (
            <button key={ic} type="button" className={`k-icon-btn sh-${o.shape} st-${o.style}`} aria-label={ic}><Icon name={ic} /></button>
          ))}
        </div>
      );
    case "fab":
      return (
        <div className="k-frame phone" style={{ height: 260 }}>
          <div className="k-frame-bg" aria-hidden="true"><div className="k-ghost w60" /><div className="k-ghost w90" /><div className="k-ghost-card" /></div>
          <button type="button" className={`k-fab ${o.label === "on" ? "is-ext" : ""}`} aria-label="新規作成"><Icon name="plus" size={24} />{o.label === "on" && <span>新規作成</span>}</button>
        </div>
      );
    case "text-field": return <div style={{ width: "100%", maxWidth: 380 }}><Field o={o} value={o.state === "error" ? "mori@example" : ""} /></div>;
    case "textarea":
      return (
        <label className="k-field s-outline" style={{ width: "100%", maxWidth: 420 }}>
          <span className="k-field-label">ご要望</span>
          <span className="k-field-box ta"><textarea rows={4} defaultValue="窓ぎわの席を希望します。" /></span>
          {o.count === "on" && <span className="k-field-count">13 / 500</span>}
        </label>
      );
    case "select":
      return (
        <div style={{ width: "100%", maxWidth: 380 }}>
          <label className="k-field s-outline">
            <span className="k-field-label">都道府県</span>
            <span className="k-field-box sel">
              <select defaultValue="東京都"><option>北海道</option><option>東京都</option><option>大阪府</option><option>福岡県</option></select>
              <Icon name="chevronDown" size={18} />
            </span>
          </label>
          {o.native === "custom" && (
            <div className="k-menu static" role="listbox">
              {["北海道", "東京都", "大阪府"].map((t, i) => <div key={t} role="option" aria-selected={i === 1} className={`k-opt ${i === 1 ? "is-on" : ""}`}>{t}{i === 1 && <Icon name="check" size={16} />}</div>)}
            </div>
          )}
        </div>
      );
    case "search":
      return (
        <label className={`k-search sh-${o.shape}`} style={{ width: "100%", maxWidth: 420 }}>
          <Icon name="search" size={18} />
          <input placeholder="駅名・お店の名前" defaultValue="渋谷" aria-label="検索" />
          <button type="button" aria-label="消す"><Icon name="x" size={16} /></button>
        </label>
      );
    case "checkbox":
      return (
        <div className="k-stack">
          <Check o={o} label="禁煙席を希望" init />
          <Check o={o} label="電源のある席" />
          <Check o={o} label="利用規約に同意する" init />
        </div>
      );
    case "radio": return <Radios o={o} />;
    case "toggle":
      return (
        <div className="k-stack" style={{ width: "100%", maxWidth: 380 }}>
          <Toggle o={o} />
          <Toggle o={o} init={false} label="前日にメールで知らせる" />
        </div>
      );
    case "slider": return <SliderDemo o={o} />;
    case "segmented": return <Segmented />;
    case "card": return <div style={{ width: "100%", maxWidth: o.media === "left" ? 460 : 320 }}><Card o={o} /></div>;
    case "list": return <div style={{ width: "100%", maxWidth: 420 }}><List o={o} /></div>;
    case "table": return <Table o={o} />;
    case "tabs": return <div style={{ width: "100%", maxWidth: 460 }}><Tabs o={o} /></div>;
    case "accordion": return <div style={{ width: "100%", maxWidth: 460 }}><Accordion o={o} /></div>;
    case "pagination": return <Pagination />;
    case "avatar":
      return (
        <div className="k-hstack">
          {["森", "あ", "K"].map((t, i) => (
            <span key={t} className={`k-avatar sh-${o.shape}`} style={{ width: AVATAR[o.size], height: AVATAR[o.size], fontSize: AVATAR[o.size] * 0.42 }}>
              {i === 0 ? <Icon name="user" size={AVATAR[o.size] * 0.55} /> : t}
            </span>
          ))}
        </div>
      );
    case "divider":
      return (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <p className="k-p">店内のようす</p><hr className="k-divider" /><p className="k-p">アクセス</p>
        </div>
      );
    case "alert": return <div style={{ width: "100%", maxWidth: 460 }}><Alert o={o} /></div>;
    case "badge":
      return (
        <div className="k-hstack" style={{ gap: 28 }}>
          <span className="k-anchor"><button type="button" className="k-icon-btn sh-circle st-ghost" aria-label="お知らせ 3件"><Icon name="bell" /></button><span className={`k-badge ${o.style === "dot" ? "is-dot" : ""}`}>{o.style === "dot" ? "" : 3}</span></span>
          <span className="k-anchor"><button type="button" className="k-icon-btn sh-circle st-ghost" aria-label="予約 12件"><Icon name="calendar" /></button><span className={`k-badge ${o.style === "dot" ? "is-dot" : ""}`}>{o.style === "dot" ? "" : 12}</span></span>
        </div>
      );
    case "chip":
      return (
        <div className="k-hstack wrap">
          {["電源あり", "Wi-Fi", "テラス席", "禁煙"].map((t, i) => (
            <span key={t} className={`k-chip st-${o.style} ${i < 2 ? "is-on" : ""}`}>{t}{o.removable === "on" && <button type="button" aria-label={`${t}を外す`}><Icon name="x" size={13} stroke={2.2} /></button>}</span>
          ))}
        </div>
      );
    case "progress": return <Progress o={o} />;
    case "spinner": return <div className="k-hstack"><span className="k-spinner" role="status" aria-label="読み込み中" /><Btn o={{ variant: "filled", size: "md" }} style={{ minWidth: 120 }}><span className="k-spinner on-accent" aria-hidden="true" /></Btn></div>;
    case "skeleton":
      return (
        <div className={`k-skel a-${o.anim}`} aria-busy="true" aria-label="読み込み中" style={{ width: "100%", maxWidth: 320 }}>
          <span className="sk-img" /><span className="sk-l w80" /><span className="sk-l w60" /><span className="sk-l w40" />
        </div>
      );
    case "stepper": return <Stepper />;
    case "empty": return <Empty />;
    default: return null;
  }
}

// 画面の地図で使う、部品の組み合わせの見本（カフェ予約サイト）
export const Screen = {
  Btn, Field, Toggle, Check, Radios, Tabs, Card, Accordion, Alert, Header, Footer, List, Stepper, Segmented,
};
