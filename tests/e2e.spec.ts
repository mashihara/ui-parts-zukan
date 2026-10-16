import { expect, test } from "@playwright/test";

const SHOT = process.env.SHOT_DIR;
const shot = async (page: import("@playwright/test").Page, name: string) => {
  if (SHOT) await page.screenshot({ path: `${SHOT}/${name}.png`, fullPage: false });
};

test.describe("画面の地図", () => {
  test("乗せると名前が出て、押すとその部品へ進む", async ({ page }) => {
    await page.goto("/");
    const header = page.locator(".map .spot.map-header").first();
    await header.locator(".k-logo").hover();
    await expect(header.locator(":scope > .spot-tag")).toHaveText("ヘッダー");
    await expect(header.locator(":scope > .spot-tag")).toHaveCSS("opacity", "1");
    await shot(page, "map-hover");
    // 入れ子：ヘッダーの中のナビを押すとグローバルナビが選ばれる
    await page.locator(".map .k-gnav a", { hasText: "予約" }).click();
    await expect(page.locator(".part-head h2")).toHaveText("グローバルナビ");
  });

  test("ラジオボタンを押しても選択は変わらず名前が分かる", async ({ page }) => {
    await page.goto("/");
    await page.locator(".map .k-radio", { hasText: "持ち帰り" }).click();
    await expect(page.locator(".part-head h2")).toHaveText("ラジオボタン");
  });

  test("名前を全部出す", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("名前を全部出す").check();
    const visible = await page.locator(".map .spot.show-tag > .spot-tag").count();
    expect(visible).toBeGreaterThanOrEqual(20);
    await page.waitForTimeout(300);
    await page.locator(".map-kit").screenshot({ path: SHOT ? `${SHOT}/map-all.png` : undefined });
  });
});

test("つまみ→指示に入れる→指示文とURLに反映", async ({ page }) => {
  await page.goto("/");
  await page.locator(".index-item", { hasText: "ボタン" }).filter({ hasText: "Button" }).first().click();
  await expect(page.locator(".part-head h2")).toHaveText("ボタン");
  const variant = page.getByRole("radiogroup", { name: "種類" });
  await variant.getByRole("radio", { name: /枠線/ }).click();
  await expect(page.locator(".preview .k-btn").first()).toHaveClass(/v-outline/);
  await page.getByRole("button", { name: "AIへの指示に入れる" }).click();
  await expect(page.locator(".dock-chip")).toHaveCount(1);
  await expect(page).toHaveURL(/pick=button/);
  await expect(page).toHaveURL(/button=variant:outline/);
  await shot(page, "part-button");
  await page.getByRole("button", { name: "AIへの指示文を見る" }).click();
  const text = page.locator(".ps-text");
  await expect(text).toContainText("ボタン（Button）");
  await expect(text).toContainText("枠線ボタン（Outlined / Secondary button）");
  await expect(text).toContainText("--accent: #2563eb;");
  await expect(text).toContainText("pick=button");
  await shot(page, "prompt");
});

test("ふんいきボタンで全部のつまみが動く", async ({ page }) => {
  await page.goto("/?part=button");
  await page.locator(".moods button", { hasText: "元気" }).click();
  await expect(page).toHaveURL(/radius=999/);
  const r = await page.locator(".preview .k-btn").first().evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  expect(r).toBeGreaterThanOrEqual(20);
  const fw = await page.locator(".preview .k-btn").first().evaluate((el) => getComputedStyle(el).fontWeight);
  expect(fw).toBe("900");
  await expect(page.locator(".moods button.is-on")).toHaveText(/元気/);
});

test("共有リンクを開くと同じ状態になる", async ({ page }) => {
  await page.goto("/?radius=0&theme=dark&pick=modal,toast&modal=size:lg;backdrop:dark");
  await expect(page.locator(".part-head h2")).toHaveText("モーダル");
  await expect(page.getByRole("radiogroup", { name: "幅" }).getByRole("radio", { checked: true })).toHaveText(/大/);
  await expect(page.locator(".dock-chip")).toHaveCount(2);
  const w = await page.locator(".preview .k-modal").evaluate((el) => el.style.width);
  expect(w).toContain("720px");
  await page.waitForTimeout(500);
  await shot(page, "modal-dark");
  await page.getByRole("button", { name: "AIへの指示文を見る" }).click();
  const text = page.locator(".ps-text");
  await expect(text).toContainText("幅 720px");
  await expect(text).toContainText("黒の不透明度0.7");
  await expect(text).toContainText("角の丸さ: 角ばる");
  await expect(text).toContainText("暗い画面（ダークモード）");
  await expect(text).toContainText("2. トースト");
});

test("全部の部品の見本がエラーなく出る", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  const items = page.locator(".index-item");
  const n = await items.count();
  expect(n).toBe(43);
  for (let i = 0; i < n; i++) {
    await items.nth(i).click();
    const name = (await page.locator(".part-head h2").textContent()) ?? "";
    const box = await page.locator(".preview").evaluate((el) => (el.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0);
    expect(box, `${name} の見本が空`).toBeGreaterThan(10);
  }
  expect(errors).toEqual([]);
});

test("スマホ幅で横にはみ出さない @mobile", async ({ page }) => {
  await page.goto("/");
  await shot(page, "mobile-top");
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over).toBeLessThanOrEqual(0);
  await page.goto("/?part=dialog");
  await page.waitForTimeout(500);
  const over2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over2).toBeLessThanOrEqual(0);
  await page.locator(".part-view").screenshot({ path: SHOT ? `${SHOT}/mobile-dialog.png` : undefined });
});
