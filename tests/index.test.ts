import { expect, test } from "@playwright/test";

test("basic test", async ({ page, browserName }) => {
  await page.goto("http://localhost:8080");
  const title = page.locator(".navbar__inner .navbar__title");
  await expect(title).toHaveText("Playwright");
  await page.screenshot({
    path: `tests/screenshots/${browserName}-screenshot.png`,
    fullPage: true,
  });
});
