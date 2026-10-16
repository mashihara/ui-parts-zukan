// AIに渡す指示文を組み立てる。
import { cssBlock, globalSpec, resolve } from "./tokens.ts";
import { PART_MAP, partSpec } from "./parts.ts";
import type { AppState } from "./state.ts";

export const SITE_NAME = "UIつまみ";

export function buildPrompt(s: AppState, link: string, opts: { css: boolean }): string {
  const R = resolve(s.tokens);
  const out: string[] = [];
  out.push(`${SITE_NAME}で調整したUIのデザインです。部品の名前と数値はこのまま使い、文言・中身・画像だけ今作っている物に合わせてください。`);
  out.push(`既にUIライブラリ（Tailwind・shadcn/ui・MUI・Flutter など）を使っているなら、その仕組みの中で同じ見た目にしてください。`);
  out.push("");
  out.push("■ 全体の雰囲気");
  for (const l of globalSpec(s.tokens)) out.push(`- ${l}`);
  if (opts.css) {
    out.push("");
    out.push("CSS変数にするとこうなります:");
    out.push("```css");
    out.push(cssBlock(s.tokens));
    out.push("```");
  }
  if (s.picks.length) {
    out.push("");
    out.push(`■ 使う部品（${s.picks.length}個）`);
    s.picks.forEach((id, i) => {
      const p = PART_MAP[id];
      if (!p) return;
      const { lines, chosen } = partSpec(p, s.opts[id] ?? {}, R);
      out.push("");
      out.push(`${i + 1}. ${p.ja}（${p.en}）: ${p.meaning}`);
      if (chosen.length) out.push(`   選んだ設定: ${chosen.join("・")}`);
      for (const l of lines) out.push(`   - ${l}`);
    });
  }
  out.push("");
  out.push(`同じ見た目を開くリンク: ${link}`);
  return out.join("\n");
}
