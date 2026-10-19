import { expect, test, type Page } from "@playwright/test";

const SHOT = process.env.SHOT_DIR;
const shot = async (page: Page, name: string) => {
  if (SHOT) await page.screenshot({ path: `${SHOT}/${name}.png` });
};
// 説明の見出し（PC幅は右の列、狭い幅は重ねて開く欄。見えている方）
const entryName = (page: Page) => page.locator(".entry-title:visible");
// 一覧のカード（名前で探す。見本の中の文字には反応させない）
const card = (page: Page, name: string) => page.locator(".name-card").filter({ has: page.locator(".nc-ja", { hasText: new RegExp(`^${name}`) }) });
// 説明（重ねて開く欄）を閉じる
const closeEntry = async (page: Page) => {
  if (!(await page.locator(".drawer").count())) return; // PC幅は右の列なので閉じる物がない
  await page.keyboard.press("Escape");
  await expect(page.locator(".drawer")).toHaveCount(0);
};
// 図面の中の部品どうしが重ならないか（トーストがフッターに重なった不具合 2026-10-17 の再発防止）
const overlap = async (page: Page, a: string, b: string) => {
  const ra = (await page.locator(`.sheet [data-part=${a}]`).boundingBox())!;
  const rb = (await page.locator(`.sheet [data-part=${b}]`).boundingBox())!;
  return ra.x < rb.x + rb.width && rb.x < ra.x + ra.width && ra.y < rb.y + rb.height && rb.y < ra.y + ra.height;
};
// 見本の画面の中の文字や部品が、紙の右端・左端からはみ出していないか（はみ出した物の文字を返す）
const overflowing = (page: Page) =>
  page.locator(".sheet").evaluate((sheet) => {
    const s = sheet.getBoundingClientRect();
    return [...sheet.querySelectorAll<HTMLElement>(".map *")]
      .filter((e) => e.offsetParent && !e.closest(".spot-tag") && e.getBoundingClientRect().width > 0)
      .filter((e) => { const r = e.getBoundingClientRect(); return r.right > s.right + 1 || r.left < s.left - 1; })
      .map((e) => e.textContent?.trim().slice(0, 12) || e.className);
  });
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
    expect(n).toBe(await page.locator(".sheet [data-part]").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().width > 0).length));
    await page.locator(".callout", { hasText: "トグルスイッチ" }).click();
    await expect(entryName(page)).toHaveText("トグルスイッチ");
    await expect(page).toHaveURL(/part=toggle/);
  });

  test("よくあるノートPCの幅（1280px）でも引き出し線が出る", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator(".drawing.is-wide")).toBeVisible();
    // 見本の画面の部品が、紙からはみ出さない（はみ出すと引き出し線が紙の外を指す）
    for (const id of await page.locator(".sheet [data-part]").evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent).map((e) => (e as HTMLElement).dataset.part!))) {
      expect(await insideSheet(page, id), `${id} が見本の画面からはみ出す`).toBe(true);
    }
    expect(await overflowing(page), "見本の画面からはみ出す物").toEqual([]);
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
    // 目次を出す幅では見本の画面が狭く検索バーを省くので、どの幅でも出ているバッジで確かめる
    await page.locator(".sheet .k-badge").hover();
    await expect(page.locator(".callout.hot", { hasText: "バッジ" })).toBeVisible();
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
  await expect(page.locator(".ask:visible")).toContainText("モーダルで出して");
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

test("PC幅：説明は右の列にずっと出ていて、押しても右の列だけが変わる", async ({ page }) => {
  await page.goto("/");
  // 何も選んでいないときは案内を出す
  await expect(page.locator(".side")).toBeVisible();
  await expect(page.locator(".side-lead")).toContainText("ここに説明が出ます");
  await expect(page.locator(".drawer")).toHaveCount(0);
  const sk = card(page, "スケルトン");
  await sk.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(800);
  await sk.click();
  await expect(entryName(page)).toHaveText("スケルトン");
  // 重ねて開く欄は出ず、ページも動かない。右の列は画面の中に見えている
  await expect(page.locator(".drawer-backdrop")).toHaveCount(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await expect(page.locator(".side")).toBeInViewport();
  await page.getByRole("button", { name: "次の部品" }).click();
  await expect(entryName(page)).toHaveText("ステップ表示");
  expect(await page.evaluate(() => scrollY)).toBe(before);
  if (SHOT) await page.screenshot({ path: `${SHOT}/pc-side.png` });
  // 一番下までスクロールしても右の列は付いてくる
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await expect(page.locator(".side")).toBeInViewport();
  await expect(entryName(page)).toBeInViewport();
});

test("狭い幅：説明は重ねて開き、閉じてもページの位置が変わらない", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  await expect(page.locator(".side")).toBeHidden();
  const sk = card(page, "スケルトン");
  await sk.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await sk.click();
  await expect(entryName(page)).toHaveText("スケルトン");
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.getByRole("button", { name: "次の部品" }).click();
  await expect(entryName(page)).toHaveText("ステップ表示");
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
  expect(await overflowing(page), "見本の画面からはみ出す物").toEqual([]);
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


// 目次（2026-10-19 3列にした）。広いPC幅だけ左に出て、押すと説明が変わり、ページの位置は動かない
test("広いPC幅：目次から図面に無い部品も開ける", async ({ page }) => {
  await page.goto("/");
  const toc = page.getByRole("navigation", { name: "部品の目次" });
  await expect(toc).toBeVisible();
  // 最初は分類だけが並び、押した分類だけが開く（アコーディオン）
  await expect(toc.getByRole("button", { expanded: true })).toHaveCount(0);
  await toc.getByRole("button", { name: /^画面の骨組み/ }).click();
  await expect(toc.getByRole("button", { name: "ヘッダー", exact: true })).toBeVisible();
  const y = await page.evaluate(() => scrollY);
  await toc.getByRole("button", { name: /^重なって出る窓/ }).click();
  await expect(toc.getByRole("button", { name: "ヘッダー", exact: true })).toHaveCount(0);
  await expect(toc.getByRole("button", { expanded: true })).toHaveCount(1);
  await toc.getByRole("button", { name: "モーダル", exact: true }).click();
  await expect(entryName(page)).toHaveText("モーダル");
  await expect(toc.getByRole("button", { name: "モーダル", exact: true })).toHaveAttribute("aria-current", "true");
  expect(await page.evaluate(() => scrollY)).toBe(y);
  // 図面にある部品を目次で選ぶと、図面のその部品が見えるところまでページが動く（2026-10-19）
  await toc.getByRole("button", { name: /^画面の骨組み/ }).click();
  await toc.getByRole("button", { name: "フッター", exact: true }).click();
  await expect(entryName(page)).toHaveText("フッター");
  await expect.poll(async () => {
    const r = (await page.locator('.sheet [data-part="footer"]').boundingBox())!;
    const vh = page.viewportSize()!.height - 72;
    return r.y >= 0 && r.y + r.height <= vh;
  }).toBe(true);
  // 図面で別の分類の部品を選ぶと、その分類だけが開く
  await page.locator(".callout", { hasText: "アラート" }).click();
  await expect(toc.getByRole("button", { name: /^状態を伝える/ })).toHaveAttribute("aria-expanded", "true");
  await expect(toc.getByRole("button", { expanded: true })).toHaveCount(1);
  // 図面は引き出し線で書き込める幅が残っている
  await expect(page.locator(".drawing.is-wide")).toBeVisible();
});

test("1280px：目次は出さず、図面に引き出し線を書く", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "部品の目次" })).toBeHidden();
  await expect(page.locator(".drawing.is-wide")).toBeVisible();
});
