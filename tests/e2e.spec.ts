import { expect, test, type Page } from "@playwright/test";

const SHOT = process.env.SHOT_DIR;
const shot = async (page: Page, name: string) => {
  if (SHOT) await page.screenshot({ path: `${SHOT}/${name}.png` });
};
// 選んだ部品の名前（見出しの h1。部品名はここ1か所に出す）
const entryName = (page: Page) => page.locator(".intro-name");
// 一覧のカード（名前で探す。見本の中の文字や、単体表示の「ほかの部品」には反応させない）
const card = (page: Page, name: string) => page.locator("#names .name-card").filter({ has: page.locator(".nc-ja", { hasText: new RegExp(`^${name}`) }) });
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
      .filter((e) => e.offsetParent && e.getBoundingClientRect().width > 0)
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
    await expect(page).toHaveURL(/\/parts\/toggle\//);
    // 図面の上の帯に名前と意味が出て、選んだ部品は山吹の角の印で押さえる（2026-10-19）
    // 部品名は図面の上の見出しの1か所だけで、右の欄には出さない（2026-10-19 A案）
    await expect(page.locator(".split-main > .intro.is-part")).toContainText("トグルスイッチ");
    await expect(page.locator(".side .entry-title")).toBeHidden();
    const mark = await page.locator(".sheet [data-part=toggle]").evaluate((el) => getComputedStyle(el, "::after"));
    expect(mark.mixBlendMode).toBe("multiply");
    expect(mark.backgroundImage).toContain("linear-gradient");
    // 周りを暗くする影は使わない
    expect(mark.boxShadow).toBe("none");
    // 選んだ部品の名前が h1 になる（SEO・2026-10-19）
    await expect(page.locator("h1")).toHaveText(/^トグルスイッチ/);
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
  await expect(page).not.toHaveURL(/\/parts\//);
});

test("共有リンクを開くと同じ選択になる", async ({ page }) => {
  await page.goto("/?pick=modal,toast&part=dialog");
  await expect(entryName(page)).toHaveText("ダイアログ");
  await expect(page.locator(".dock-chip")).toHaveCount(2);
});

test("画面の組み方の見本が、右の列の幅に1行で収まる", async ({ page }) => {
  for (const w of [1100, 1440]) {
    await page.setViewportSize({ width: w, height: 1000 });
    for (const id of ["column", "responsive"]) {
      await page.goto(`/?part=${id}`);
      // 子どもの上端ではなく、全部が同じ縦の範囲に重なっているか（折り返すと重ならない）で1行かを判定
      const oneRow = await page.locator(".side .entry-preview .sc-row").evaluate((el) => {
        const rs = [...el.children].map((c) => c.getBoundingClientRect());
        return rs.every((r) => rs.every((q) => r.top < q.bottom && q.top < r.bottom));
      });
      expect(oneRow, `${w}px の ${id} が折り返す`).toBe(true);
    }
  }
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
  expect(n).toBe(68);
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

// スマホ幅（2026-10-19 A3案）。名前の札を部品に重ねると見本の文字が隠れたので、点線で囲み、押した部品のそばに吹き出しで名前を出す
test("スマホ幅：部品は点線で囲むだけで、押すとそばに吹き出しで名前が出る @mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".drawing.is-narrow")).toBeVisible();
  await expect(page.locator(".map-hint")).toHaveText("部品をタップすれば、名前がでます");
  // 点線の枠は付けない（「不要」と言われた）
  expect(await page.locator(".sheet [data-part=radio]").evaluate((e) => getComputedStyle(e, "::after").borderTopStyle)).not.toBe("dashed");
  // 導入文の下に余計な空きを作らない（PC幅の高さそろえが残って空いていた）
  const introGap = await page.evaluate(() => document.querySelector(".intro")!.getBoundingClientRect().bottom - document.querySelector(".intro p")!.getBoundingClientRect().bottom);
  expect(introGap).toBeLessThanOrEqual(12);
  const sheetTop = async () => (await page.locator(".sheet").boundingBox())!.y + (await page.evaluate(() => scrollY));
  // 名前を1つも入れていないときは下の帯を出さない
  await expect(page.locator(".dock")).toBeHidden();
  // 一覧の小さな見本も左右が切れない
  const cut = await page.locator(".thumb").evaluateAll((els) => els.filter((t) => { const a = t.getBoundingClientRect(), b = t.querySelector(".thumb-in")!.getBoundingClientRect(); return b.left < a.left - 2 || b.right > a.right + 2; }).length);
  expect(cut, "見本の左右が切れるカード").toBe(0);
  expect(await overflowing(page), "見本の画面からはみ出す物").toEqual([]);
  // トーストもフッターに重ならない
  expect(await overlap(page, "toast", "footer")).toBe(false);
  expect(await overlap(page, "toast", "button")).toBe(false);
  expect(await insideSheet(page, "toast")).toBe(true);
  expect(await insideSheet(page, "tooltip")).toBe(true);
  // 図面の角の外枠の線が、ヘッダーとフッターの四角い角で消えない（2026-10-19 角が切れて見えた）
  expect(await page.locator(".map-header .k-header").evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe("6px");
  expect(await page.locator(".map .k-footer").evaluate((e) => getComputedStyle(e).borderBottomRightRadius)).toBe("6px");
  // 右端のアバターが画面に収まる
  const av = await page.locator(".spot[data-part=avatar]").boundingBox();
  expect(av!.x + av!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await shot(page, "sp-top");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

  // 部品を押すと、重ねて開く欄ではなく、部品のそばに吹き出しが出る。ページの位置は動かない
  const bubbleFits = async (id: string) => {
    const b = (await page.locator(".map-bubble").boundingBox())!;
    const r = (await page.locator(`.sheet [data-part=${id}]`).boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(b.x, "吹き出しが左で切れる").toBeGreaterThanOrEqual(0);
    expect(b.x + b.width, "吹き出しが右で切れる").toBeLessThanOrEqual(vw);
    // 吹き出しは選んだ部品を隠さない（上か下に出る）
    expect(b.y + b.height <= r.y + 1 || b.y >= r.y + r.height - 1, `吹き出しが${id}に重なる`).toBe(true);
  };
  const top0 = await sheetTop();
  for (const [id, name] of [["toggle", "トグルスイッチ"], ["header", "ヘッダー"], ["avatar", "アバター"], ["alert", "アラート"]] as const) {
    await page.locator(`.sheet [data-part=${id}]`).scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await page.locator(`.sheet [data-part=${id}]`).click({ position: { x: 4, y: 4 } });
    await expect(page.locator(".map-bubble .mb-name b")).toHaveText(name);
    await expect(page.locator(".drawer")).toHaveCount(0);
    await expect(page.locator(".map-bubble")).toBeInViewport();
    expect(await page.evaluate(() => scrollY)).toBe(y);
    await bubbleFits(id);
    // 押しても見出しが切り替わらず、図面の位置が動かない
    await expect(page.locator(".intro h1")).toContainText("なんて呼ぶ");
    expect(await sheetTop()).toBe(top0);
    if (id === "toggle") await shot(page, "sp-bubble");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);

  // AIに渡すと、下の帯が件数つきで出る。吹き出しは開いたまま
  await page.locator(".mb-pick").click();
  await expect(page.locator(".mb-pick")).toHaveText("入れました");
  await expect(page.locator(".dock")).toBeVisible();
  await expect(page.locator(".dock-go")).toHaveText("AIに渡す文を見る（1件）");
  await expect(page.locator(".map-bubble")).toBeVisible();
  await shot(page, "sp-picked");

  // 外を押すと閉じる
  await page.locator(".intro h1").click();
  await expect(page.locator(".map-bubble")).toHaveCount(0);

  // 「詳しく」で、画面全体に説明が開く。ブラウザの「戻る」で吹き出しに戻る（2026-10-19 本人指示）
  await page.locator(".sheet [data-part=text-field]").click({ position: { x: 4, y: 4 } });
  const y0 = await page.evaluate(() => scrollY);
  await page.locator(".mb-more").click();
  await expect(entryName(page)).toHaveText("テキストフィールド");
  await expect(page.locator(".map-bubble")).toHaveCount(0);
  await page.waitForTimeout(800);
  const dr = (await page.locator(".drawer").boundingBox())!;
  expect(dr.y).toBe(0);
  expect(dr.height).toBeGreaterThanOrEqual(page.viewportSize()!.height - 1);
  await shot(page, "sp-entry");
  await page.goBack();
  await expect(page.locator(".drawer")).toHaveCount(0);
  await expect(page.locator(".map-bubble .mb-name b")).toHaveText("テキストフィールド");
  await expect(page).toHaveURL(/\/parts\/text-field\/(\?|$)/);
  expect(await page.evaluate(() => scrollY)).toBe(y0);
  // ✕で閉じても同じく吹き出しへ戻り、そのあと「戻る」を押しても説明は開き直さない
  await page.locator(".mb-more").click();
  await page.getByRole("button", { name: "閉じる", exact: true }).click();
  await expect(page.locator(".drawer")).toHaveCount(0);
  await expect(page.locator(".map-bubble")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".map-bubble")).toHaveCount(0);

  // 一覧のカードからも画面全体に開き、「戻る」で元の画面に戻る
  await card(page, "モーダル").scrollIntoViewIfNeeded();
  const y1 = await page.evaluate(() => scrollY);
  await card(page, "モーダル").click();
  await expect(entryName(page)).toHaveText("モーダル");
  await page.goBack();
  await expect(page.locator(".drawer")).toHaveCount(0);
  await expect(page).not.toHaveURL(/\/parts\//);
  expect(await page.evaluate(() => scrollY)).toBe(y1);
  // Esc でも吹き出しが閉じる
  await page.locator(".sheet [data-part=button]").click({ position: { x: 4, y: 4 } });
  await expect(page.locator(".map-bubble")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".map-bubble")).toHaveCount(0);
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
    // 上に固定した帯（64px）に隠れていないこと
    return r.y >= 64 && r.y + r.height <= vh;
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

// 部品ごとのページ（SEO・2026-10-19）。h1・題・説明が書き出したHTMLに入っている
test("部品のページは、その部品の名前が h1 で、説明が開いた状態で書き出されている", async ({ page, request }) => {
  const html = await (await request.get("/parts/breadcrumb/")).text();
  expect(html).toMatch(/<h1><span class="intro-name">パンくずリスト<\/span>/);
  expect(html).toContain("<title>パンくずリスト（Breadcrumbs）とは？");
  expect(html).toMatch(/<link rel="canonical" href="[^"]*\/parts\/breadcrumb\/"/);
  expect(html).toContain('"@type":"DefinedTerm"');
  await page.goto("/parts/breadcrumb/");
  await expect(page.locator("h1")).toHaveText(/^パンくずリスト/);
  await expect(entryName(page)).toHaveText("パンくずリスト");
  // 見出しの「UI部品図鑑」でトップの見出しに戻る
  await page.locator(".crumbs a").click();
  await expect(page.locator("h1")).toHaveText("その部品、なんて呼ぶ？");
  await expect(page).not.toHaveURL(/\/parts\//);
  // トップにも favicon.ico の指定がある（サブパスの書き出しでトップだけ抜けていた 2026-10-20）
  expect(await (await request.get("/")).text()).toMatch(/<link rel="icon" href="[^"]*\/favicon\.ico"/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  // トップ・見分け方・AIへの渡し方と、一覧にある全部品のページ
  expect(sitemap.match(/<loc>/g)?.length).toBe(3 + (await page.locator("#names .name-card").count()));
  expect(sitemap).toContain("/how-to/</loc>");
  expect(sitemap).toContain("/confusions/</loc>");
});

// 全体図に無い部品は、真ん中を単体の見本に切り替え、全体図へ戻れる（2026-10-19）
test("全体図に無い部品は真ん中を単体表示にし、全体図へ戻れる", async ({ page }) => {
  await page.goto("/");
  const toc = page.getByRole("navigation", { name: "部品の目次" });
  await toc.getByRole("button", { name: /^画面の骨組み/ }).click();
  await toc.getByRole("button", { name: "サイドバー", exact: true }).click();
  await expect(page.locator(".focus-name")).toHaveText(/^サイドバー/);
  // 見本は図面の枠の上の方に出て、画面の中に見えている（余白の見本が下へ沈んで見えなかった 2026-10-19）
  await expect(page.locator(".focus-stage > *").first()).toBeInViewport();
  // 空いた場所には同じ分類のほかの部品が並び、押すとその部品に切り替わる（2026-10-19）
  const more = page.getByRole("region", { name: "画面の骨組みのほかの部品" });
  await expect(more.locator(".name-card").first()).toBeVisible();
  await more.getByRole("link", { name: "ボトムナビの説明を開く" }).click();
  await expect(page.locator(".focus-name")).toHaveText(/^ボトムナビ/);
  await toc.getByRole("button", { name: "サイドバー", exact: true }).click();
  await expect(page.locator(".drawing")).toHaveCount(0);
  await page.getByRole("button", { name: "画面の全体図に戻る" }).click();
  await expect(page.locator(".drawing.is-wide")).toBeVisible();
  await expect(entryName(page)).toHaveText("サイドバー");
  // 全体図にある部品を選ぶと全体図のまま、また別の窓の部品を選ぶと単体表示になる
  await page.locator(".callout", { hasText: "アラート" }).click();
  await expect(page.locator(".drawing")).toBeVisible();
  await toc.getByRole("button", { name: /^重なって出る窓/ }).click();
  await toc.getByRole("button", { name: "モーダル", exact: true }).click();
  await expect(page.locator(".focus-name")).toHaveText(/^モーダル/);
});

// 見分け方は別ページ（2026-10-19）。上の帯とトップの入口から行け、部品のページへリンクしている
test("見分け方は別ページにあり、部品のページへ進める", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "見分け方", exact: true }).click();
  await expect(page).toHaveURL(/\/confusions\/$/);
  await expect(page.locator("h1")).toHaveText("まぎらわしい名前の見分け方");
  await expect(page.locator(".confuse-row").first()).toContainText("モーダルとダイアログ");
  await page.locator(".confuse-row").first().getByRole("link", { name: /^ダイアログ/ }).click();
  await expect(page).toHaveURL(/\/parts\/dialog\/$/);
  await expect(page.locator("h1")).toHaveText(/^ダイアログ/);
});

// AIへの渡し方も別ページ（2026-10-19）
test("AIへの渡し方は別ページにあり、3つの方法と一覧のリンクが出る", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "AIへの渡し方" }).click();
  await expect(page).toHaveURL(/\/how-to\/$/);
  await expect(page.locator("h1")).toHaveText("AIへの渡し方");
  await expect(page.locator(".how-row h2")).toHaveText(["名前を入れて頼む", "選んだ名前をまとめて渡す", "名前の一覧ごと読ませる"]);
  const href = await page.getByRole("link", { name: "llms.txt" }).getAttribute("href");
  expect((await request.get(href!)).status()).toBe(200);
  // トップにはもう渡し方の本文は無く、入口だけがある
  await page.goto("/");
  await expect(page.locator(".how")).toHaveCount(0);
  // 見分け方・AIへの渡し方と、姉妹サイト（アプリ部品図鑑）の入口
  await expect(page.locator(".read-links a")).toHaveCount(3);
});

// 姉妹サイト（アプリ部品図鑑）への入口。上の帯の切り替え・トップの入口・各ページのフッター・部品の説明から行ける（2026-10-19）
test("アプリ部品図鑑へ、上の帯・トップ・フッター・部品の説明から移れる", async ({ page }) => {
  const SISTER = "https://mashiharalab.dev/app-parts-zukan/";
  for (const path of ["/", "/confusions/", "/how-to/", "/parts/header/"]) {
    await page.goto(path);
    const sw = page.getByRole("navigation", { name: "図鑑の切り替え" });
    await expect(sw.getByRole("link", { name: "アプリ" })).toHaveAttribute("href", SISTER);
    await expect(sw.locator("[aria-current=page]")).toHaveText("Web");
    await expect(page.locator(".sister-credit a")).toHaveAttribute("href", SISTER);
  }
  await page.goto("/");
  await expect(page.locator(".confuse-link.is-sister")).toHaveAttribute("href", SISTER);
  // アプリに同じ・近い部品がある物だけ、説明からアプリ部品図鑑の部品のページへ
  await page.goto("/parts/bottom-nav/");
  await expect(page.locator(".entry-sister:visible")).toHaveAttribute("href", `${SISTER}parts/tab-bar/`);
  await page.goto("/parts/breadcrumb/");
  await expect(page.locator(".entry-sister")).toHaveCount(0);
});

test("スマホ幅：上の帯に図鑑の切り替えを足しても折り返さず、横にはみ出さない @mobile", async ({ page }) => {
  await page.goto("/");
  const top = (await page.getByRole("banner").boundingBox())!;
  expect(top.height).toBeLessThanOrEqual(64);
  for (const l of await page.locator(".top-links a").all()) expect((await l.boundingBox())!.height).toBeLessThan(26);
  await expect(page.getByRole("navigation", { name: "図鑑の切り替え" }).getByRole("link", { name: "アプリ" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

// 上の帯は画面上部に固定し、スクロールしても見えている（2026-10-19）
test("上の帯はスクロールしても画面上部に残る", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(page.getByRole("banner")).toBeInViewport();
  const r = (await page.getByRole("banner").boundingBox())!;
  expect(Math.round(r.y)).toBe(0);
  // 右の説明の列は上の帯に重ならない
  const side = (await page.locator(".side").boundingBox())!;
  expect(side.y).toBeGreaterThanOrEqual(r.height);
});

// PC幅：部品名は図面の上の見出し1か所。選ぶ前後で図面の位置が動かず、スクロールしても見出しが付いてくる（2026-10-19 A案）
test("PC幅：見出しは図面の上に1か所で、選んでも図面が動かず、スクロールしても付いてくる", async ({ page }) => {
  await page.goto("/");
  const boardTop = () => page.evaluate(() => Math.round(document.querySelector(".board")!.getBoundingClientRect().top + scrollY));
  const before = await boardTop();
  await page.locator(".callout", { hasText: "ラジオボタン" }).click();
  await expect(entryName(page)).toHaveText("ラジオボタン");
  expect(await boardTop()).toBe(before);
  // 目次は上の帯のすぐ下から始まる（見出しより上にある）
  const toc = (await page.getByRole("navigation", { name: "部品の目次" }).boundingBox())!;
  const head = (await page.locator(".split-main > .intro").boundingBox())!;
  expect(toc.y).toBeLessThanOrEqual(head.y + 1);
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator(".split-main > .intro.is-part")).toBeInViewport();
  await expect(page.locator(".pick-bar")).toHaveCount(0);
});
