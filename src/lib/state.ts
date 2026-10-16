// 選んだ部品と URL の相互変換。人もAIも読めるよう素直なクエリで書く。
// 例: ?pick=modal,radio&part=radio
import { PART_MAP } from "./parts.ts";

export type AppState = {
  picks: string[]; // AIに渡す部品（選んだ順）
  part: string; // 開いている部品
};

export const DEFAULT_PART = "radio";

export function toQuery(s: AppState): string {
  const q = new URLSearchParams();
  if (s.picks.length) q.set("pick", s.picks.join(","));
  if (s.part !== DEFAULT_PART) q.set("part", s.part);
  return q.toString().replace(/%2C/g, ",");
}

export function fromQuery(search: string): AppState {
  const q = new URLSearchParams(search);
  const picks = (q.get("pick") ?? "").split(",").filter((id, i, a) => PART_MAP[id] && a.indexOf(id) === i);
  const part = q.get("part") ?? "";
  return { picks, part: PART_MAP[part] ? part : picks[0] ?? DEFAULT_PART };
}
