import { expect, test, type Page } from "@playwright/test";

const SHOT = process.env.SHOT_DIR;
const shot = async (page: Page, name: string) => {
  if (SHOT) await page.screenshot({ path: `${SHOT}/${name}.png` });
};
const entryName = (page: Page) => page.locator(".entry h2");
// 図面の中の部品どうしが重ならないか（トーストがフッターに重なった不具合 2026-10-17 の再発防止）
const overlap = async (page: Page, a: string, b: string) => {
  const ra = (await page.locator(`.sheet [data-part=${a}]`).boundingBox())!;
  const rb = (await page.locator(`.sheet [data-part=${b}]`).boundingBox())!;
  return ra.x < rb.x + rb.width && rb.x < ra.x + ra.width && ra.y < rb.y + rb.height && rb.y < ra.y + ra.height;
};
const insideSheet = async (page: Page, id: string) => {
  const r = (await page.locator(`.sheet [data-part=${id}]`).boundingBox())!;
  const s = (await page.locator(".sheet").boundingBox())!;
  return r.x >= s.x - 1 && r.y >= s.y - 1 && r.x + r.width <= s.x + s.width + 1 && r.y + r.height <= s.y + s.height + 1;
};

test.describe("図面", () => {
  test("引き出し線の名前を押すと、その部品の説明が出る", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".drawing.is-wide")).toBeVisible();
    await page.waitForTimeout(300);
    await shot(page, "pc-top");
    const n = await page.locator(".callout").count();
    expect(n).toBe(await page.locator(".sheet [data-part]").count());
    await page.locator(".callout", { hasText: "トグルスイッチ" }).click();
    await expect(entryName(page)).toHaveText("トグルスイッチ");
    await expect(page).toHaveURL(/part=toggle/);
  });

  test("よくあるノートPCの幅（1280px）でも引き出し線が出る", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator(".drawing.is-wide")).toBeVisible();
    // 名前を押すと、下に回した説明へ移る
    await page.locator(".callout", { hasText: "アラート" }).click();
    await expect(page.locator(".entry h2")).toHaveText("アラート");
    await expect(page.locator(".entry h2")).toBeInViewport();
  });

  test("トーストはフッターに重ならず、浮いた札として画面の中に出る", async ({ page }) => {
    await page.goto("/");
    expect(await overlap(page, "toast", "footer")).toBe(false);
    expect(await overlap(page, "toast", "button")).toBe(false);
    expect(await insideSheet(page, "toast")).toBe(true);
    expect(await page.locator(".sheet [data-part=toast]").evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
    // 横いっぱいに伸びない
    const t = (await page.locator(".sheet [data-part=toast]").boundingBox())!;
    const sh = (await page.locator(".sheet").boundingBox())!;
    expect(t.width).toBeLessThan(sh.width * 0.6);
    if (SHOT) await page.locator(".sheet").screenshot({ path: `${SHOT}/pc-sheet-bottom.png` });
  });

  test("見本の画面に部品の見た目が効いている", async ({ page }) => {
    await page.goto("/");
    // 変数が流れていないと背景が透明になる（2026-10-16 に一度起きた）
    const bg = await page.locator(".sheet .k-btn").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(37, 99, 235)");
    const card = await page.locator(".sheet .k-card").evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(card).toBe("12px");
  });

  test("画面の部品そのものを押しても名前が分かる（入れ子は内側を優先）", async ({ page }) => {
    await page.goto("/");
    await page.locator(".sheet .k-check").click();
    await expect(entryName(page)).toHaveText("チェックボックス");
    await page.locator(".sheet .k-gnav a", { hasText: "予約" }).click();
    await expect(entryName(page)).toHaveText("グローバルナビ");
  });

  test("部品に乗せると、対応する名前と線が光る", async ({ page }) => {
    await page.goto("/");
    await page.locator(".sheet .k-search").hover();
    await expect(page.locator(".callout.hot", { hasText: "検索バー" })).toBeVisible();
  });

  test("名前どうしが重ならず、画面からはみ出さない", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    const boxes = await page.locator(".callout").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, s: e.textContent }; }));
    const vw = page.viewportSize()!.width;
    for (const b of boxes) {
      expect(b.l, `${b.s} が左にはみ出す`).toBeGreaterThanOrEqual(0);
      expect(b.r, `${b.s} が右にはみ出す`).toBeLessThanOrEqual(vw);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], c = boxes[j];
        const hit = a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b;
        expect(hit, `${a.s} と ${c.s} が重なる`).toBe(false);
      }
  });
});

test("一覧から窓の部品を開くと、見本と頼み方の例が出る", async ({ page }) => {
  await page.goto("/");
  await page.locator(".name-card", { hasText: "モーダル" }).first().click();
  await expect(entryName(page)).toHaveText("モーダル");
  await expect(page.locator(".entry-preview .k-modal")).toBeVisible();
  await expect(page.locator(".entry .ask")).toContainText("モーダルで出して");
  await expect(page.locator(".entry-confuse").first()).toContainText("ダイアログ");
});

test("名前を選んでAIに渡す文にする", async ({ page }) => {
  await page.goto("/?part=modal");
  await expect(page.locator(".dock-go")).toBeDisabled();
  await page.getByRole("button", { name: "AIに渡す名前に入れる" }).click();
  await page.locator(".name-card", { hasText: "トースト" }).click();
  await page.getByRole("button", { name: "AIに渡す名前に入れる" }).click();
  await expect(page.locator(".dock-chip")).toHaveCount(2);
  await expect(page).toHaveURL(/pick=modal,toast/);
  await page.getByRole("button", { name: "AIに渡す文を見る" }).click();
  const text = page.locator(".ps-text");
  await expect(text).toContainText("1. モーダル（Modal）");
  await expect(text).toContainText("2. トースト（Toast）");
  await expect(text).toContainText("頼み方の例:");
  await expect(text).toContainText("?pick=modal,toast");
  // 調整機能は廃止したので、数値やCSS変数は入らない
  await expect(text).not.toContainText("px");
  await expect(text).not.toContainText("--accent");
  await shot(page, "pc-sheet");
});

test("共有リンクを開くと同じ選択になる", async ({ page }) => {
  await page.goto("/?pick=modal,toast&part=dialog");
  await expect(entryName(page)).toHaveText("ダイアログ");
  await expect(page.locator(".dock-chip")).toHaveCount(2);
});

test("ことばで探せる", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("部品を探す").fill("窓");
  await expect(page.locator(".name-card", { hasText: "モーダル" })).toBeVisible();
  await expect(page.locator(".name-card", { hasText: "ヘッダー" })).toHaveCount(0);
  await page.getByLabel("部品を探す").fill("zzz");
  await expect(page.locator(".none")).toBeVisible();
});

test("調整のつまみは出ない", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("全体の雰囲気")).toHaveCount(0);
  await expect(page.getByText("角の丸さ")).toHaveCount(0);
  await expect(page.locator(".moods, .stops")).toHaveCount(0);
});

test("全部の部品の見本がエラーなく出る", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  const cards = page.locator(".name-card");
  const n = await cards.count();
  expect(n).toBe(43);
  for (let i = 0; i < n; i++) {
    await cards.nth(i).click();
    const name = (await entryName(page).textContent()) ?? "";
    const h = await page.locator(".entry-preview").evaluate((el) => (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0);
    expect(h, `${name} の見本が空`).toBeGreaterThan(10);
  }
  expect(errors).toEqual([]);
});

test("スマホ幅：部品の上に名前が出て、押すと説明へ進む @mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".drawing.is-narrow")).toBeVisible();
  await expect(page.locator(".spot-tag", { hasText: "ラジオボタン" })).toBeVisible();
  // 紙の上端にある部品の札も切れずに見える
  const tag = await page.locator(".spot[data-part=header] > .spot-tag").boundingBox();
  const sheet = await page.locator(".sheet").boundingBox();
  expect(tag!.y).toBeLessThan(sheet!.y);
  // トーストもフッターに重ならない
  expect(await overlap(page, "toast", "footer")).toBe(false);
  expect(await overlap(page, "toast", "button")).toBe(false);
  expect(await insideSheet(page, "toast")).toBe(true);
  // 右端のアバターが画面に収まる
  const av = await page.locator(".spot[data-part=avatar]").boundingBox();
  expect(av!.x + av!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await shot(page, "sp-top");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await page.locator(".sheet .k-toggle").click();
  await expect(entryName(page)).toHaveText("トグルスイッチ");
  await page.waitForTimeout(800);
  await shot(page, "sp-entry");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});
