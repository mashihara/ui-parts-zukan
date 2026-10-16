import { defineConfig, devices } from "@playwright/test";

// 静的書き出し（out/）を配信して確かめる。先に npm run build を実行しておく
export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  use: { baseURL: "http://localhost:4320" },
  webServer: { command: "python3 -m http.server 4320 --directory out", port: 4320, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" }, grep: /@mobile/ },
  ],
});
