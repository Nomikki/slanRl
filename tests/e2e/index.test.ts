import { expect, test } from "@playwright/test";

test("basic test", async ({ page, browserName, viewport }) => {
  await page.goto("http://localhost:8080");
  const pageTitle = page.locator("title");
  await expect(pageTitle).toHaveText("Slan Roguelike");

  const { width, height } = viewport || {};

  await page.screenshot({
    path: `tests/snapshots/${browserName}/test1_${width}x${height}.png`,
    fullPage: true,
  });

  // expect(
  //   await page.screenshot({
  //     fullPage: true,
  //   }),
  // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
});
