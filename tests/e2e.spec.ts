import { expect, test, type Page } from "@playwright/test";

const SHOT = process.env.SHOT_DIR;
const shot = async (page: Page, name: string) => {
  if (SHOT) await page.screenshot({ path: `${SHOT}/${name}.png` });
};
const entryName = (page: Page) => page.locator(".drawer h2");
// 一覧のカード（名前で探す。見本の中の文字には反応させない）
const card = (page: Page, name: string) => page.locator(".name-card").filter({ has: page.locator(".nc-ja", { hasText: new RegExp(`^${name}`) }) });
// 説明（重ねて開く欄）を閉じる
const closeEntry = async (page: Page) => {
  await page.keyboard.press("Escape");
  await expect(page.locator(".drawer")).toHaveCount(0);
};
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
    await expect(entryName(page)).toHaveText("アラート");
    await expect(entryName(page)).toBeInViewport();
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

  test("ツールチップの札とハートのアイコンボタンを別々に引ける", async ({ page }) => {
    await page.goto("/");
    expect(await overlap(page, "tooltip", "icon-button")).toBe(false);
    await page.locator(".sheet .k-tooltip").click();
    await expect(entryName(page)).toHaveText("ツールチップ");
    await closeEntry(page);
    await page.locator(".sheet [data-part=icon-button] .k-icon-btn").click();
    await expect(entryName(page)).toHaveText("アイコンボタン");
    // 札はハートの真上にあり、三角（札の左から20px）がハートの中心を指す
    const tip = (await page.locator(".sheet [data-part=tooltip]").boundingBox())!;
    const btn = (await page.locator(".sheet [data-part=icon-button]").boundingBox())!;
    expect(tip.y + tip.height).toBeLessThanOrEqual(btn.y);
    expect(Math.abs(tip.x + 20 - (btn.x + btn.width / 2))).toBeLessThan(4);
    expect(await insideSheet(page, "tooltip")).toBe(true);
    // 名前の線の点は札そのものの高さにある
    const tagY = await page.locator(".callout", { hasText: "ツールチップ" }).evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(tagY + 10 - (tip.y + Math.min(tip.height / 2, 16)))).toBeLessThan(40);
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
    await closeEntry(page);
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
  await card(page, "モーダル").click();
  await expect(entryName(page)).toHaveText("モーダル");
  await expect(page.locator(".entry-preview .k-modal")).toBeVisible();
  await expect(page.locator(".drawer .ask")).toContainText("モーダルで出して");
  await expect(page.locator(".entry-confuse").first()).toContainText("ダイアログ");
});

test("名前を選んでAIに渡す文にする", async ({ page }) => {
  await page.goto("/?part=modal");
  await expect(page.locator(".dock-go")).toBeDisabled();
  await page.getByRole("button", { name: "AIに渡す名前に入れる" }).click();
  await closeEntry(page);
  await card(page, "トースト").click();
  await page.getByRole("button", { name: "AIに渡す名前に入れる" }).click();
  await expect(page.locator(".dock-chip")).toHaveCount(2);
  await expect(page).toHaveURL(/pick=modal,toast/);
  await closeEntry(page);
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

test("部品を開いて閉じても、ページの位置が変わらない", async ({ page }) => {
  await page.goto("/");
  const sk = card(page, "スケルトン");
  await sk.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(800);
  await sk.click();
  await expect(entryName(page)).toHaveText("スケルトン");
  expect(await page.evaluate(() => scrollY)).toBe(before);
  // 開いたまま前後の部品をめくれる
  await page.getByRole("button", { name: "次の部品" }).click();
  await expect(entryName(page)).toHaveText("ステップ表示");
  await page.getByRole("button", { name: "前の部品" }).click();
  await expect(entryName(page)).toHaveText("スケルトン");
  if (SHOT) await page.screenshot({ path: `${SHOT}/pc-drawer.png` });
  // 閉じる：×・背景・Esc のどれでも、元の位置のまま
  await page.getByRole("button", { name: "閉じる", exact: true }).click();
  await expect(page.locator(".drawer")).toHaveCount(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await sk.click();
  await page.locator(".drawer-backdrop").click({ position: { x: 20, y: 300 } });
  await expect(page.locator(".drawer")).toHaveCount(0);
  await sk.click();
  await closeEntry(page);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await expect(page).not.toHaveURL(/part=/);
});

test("共有リンクを開くと同じ選択になる", async ({ page }) => {
  await page.goto("/?pick=modal,toast&part=dialog");
  await expect(entryName(page)).toHaveText("ダイアログ");
  await expect(page.locator(".dock-chip")).toHaveCount(2);
});

test("ことばで探せる", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("部品を探す").fill("窓");
  await expect(card(page, "モーダル")).toBeVisible();
  await expect(card(page, "ヘッダー")).toHaveCount(0);
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
  // 一覧の小さな見本も全部描かれている
  const empty = await page.locator(".thumb-in").evaluateAll((els) => els.filter((e) => ((e.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0) < 10).length);
  expect(empty, "小さな見本が空のカード").toBe(0);
  // 小さな見本は枠の中に収まり、左右が切れない
  const cut = await page.locator(".thumb").evaluateAll((els) => els.filter((t) => { const a = t.getBoundingClientRect(), b = t.querySelector(".thumb-in")!.getBoundingClientRect(); return b.left < a.left - 2 || b.right > a.right + 2; }).length);
  expect(cut, "見本の左右が切れるカード").toBe(0);
  // 説明を開き、「次の部品」で全部をめくる
  await cards.first().click();
  for (let i = 0; i < n; i++) {
    if (i > 0) await page.getByRole("button", { name: "次の部品" }).click();
    await expect(page.locator(".dh-count")).toHaveText(`${i + 1} / ${n}`);
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
  // 名前の札どうしが重ならない
  const tags = await page.locator(".drawing.is-narrow .spot-tag").evaluateAll((els) =>
    els.filter((e) => getComputedStyle(e).display !== "none" && (e as HTMLElement).offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, s: e.textContent }; }),
  );
  for (let i = 0; i < tags.length; i++)
    for (let j = i + 1; j < tags.length; j++) {
      const a = tags[i], c = tags[j];
      expect(a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b, `${a.s} と ${c.s} の札が重なる`).toBe(false);
    }
  // ツールチップの名前の札が、ツールチップの文字を隠さない
  const tipText = (await page.locator(".sheet .k-tooltip").boundingBox())!;
  const tipTag = (await page.locator(".spot[data-part=tooltip] > .spot-tag").boundingBox())!;
  expect(tipTag.x).toBeGreaterThanOrEqual(tipText.x + tipText.width);
  // ツールチップの札が画面の右で切れない
  expect(await insideSheet(page, "tooltip")).toBe(true);
  // 一覧の小さな見本も左右が切れない
  const cut = await page.locator(".thumb").evaluateAll((els) => els.filter((t) => { const a = t.getBoundingClientRect(), b = t.querySelector(".thumb-in")!.getBoundingClientRect(); return b.left < a.left - 2 || b.right > a.right + 2; }).length);
  expect(cut, "見本の左右が切れるカード").toBe(0);
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
