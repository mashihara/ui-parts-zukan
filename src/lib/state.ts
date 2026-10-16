// 調整した状態と URL の相互変換。
// 人もAIも読めるよう、既定値と違う物だけを素直なクエリで書く。
// 例: ?accent=db2777&radius=999&pick=button,modal&button=variant:outline;size:lg
import { DEFAULT_TOKENS, GLOBAL_KNOBS, isHex, type Tokens } from "./tokens.ts";
import { PART_MAP, defaultOpts } from "./parts.ts";

export type AppState = {
  tokens: Tokens;
  picks: string[]; // 指示に入れる部品（選んだ順）
  opts: Record<string, Record<string, string>>; // 部品ごとのつまみ
};

export const initialState = (): AppState => ({ tokens: { ...DEFAULT_TOKENS }, picks: [], opts: {} });

export function toQuery(s: AppState): string {
  const q = new URLSearchParams();
  for (const kn of GLOBAL_KNOBS) {
    const v = s.tokens[kn.key];
    if (v !== DEFAULT_TOKENS[kn.key]) q.set(kn.key, v);
  }
  if (s.picks.length) q.set("pick", s.picks.join(","));
  for (const id of s.picks) {
    const p = PART_MAP[id];
    if (!p) continue;
    const def = defaultOpts(p);
    const o = s.opts[id] ?? {};
    const diff = Object.entries(o).filter(([key, v]) => def[key] !== undefined && def[key] !== v);
    if (diff.length) q.set(id, diff.map(([key, v]) => `${key}:${v}`).join(";"));
  }
  // カンマ・コロン・セミコロンは読みやすさのため戻す
  return q.toString().replace(/%2C/g, ",").replace(/%3A/g, ":").replace(/%3B/g, ";");
}

export function fromQuery(search: string): AppState {
  const q = new URLSearchParams(search);
  const s = initialState();
  for (const kn of GLOBAL_KNOBS) {
    const v = q.get(kn.key);
    if (v == null) continue;
    if (kn.kind === "color" ? isHex(v) : kn.options.some((o) => o.v === v)) s.tokens[kn.key] = v.toLowerCase();
  }
  s.picks = (q.get("pick") ?? "").split(",").filter((id) => PART_MAP[id]);
  for (const id of Object.keys(PART_MAP)) {
    const raw = q.get(id);
    if (!raw) continue;
    const p = PART_MAP[id];
    const o: Record<string, string> = {};
    for (const pair of raw.split(";")) {
      const [key, v] = pair.split(":");
      if (p.knobs.find((x) => x.key === key)?.options.some((op) => op.v === v)) o[key] = v;
    }
    s.opts[id] = o;
  }
  return s;
}
