import { expect, test } from "@playwright/test";

test("run tests", async ({ page, browserName, viewport }) => {
  await page.goto("http://localhost:8080");
  const pageTitle = page.locator("title");
  await expect(pageTitle).toHaveText("Slan Roguelike");

  const { width, height } = viewport || {};

  await test.step("initial view snapshot", async () => {
    await page.screenshot({
      path: `test-results/snapshots/${browserName}/test1_${width}x${height}.png`,
      fullPage: true,
    });

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await test.step("character build menu", async () => {
    await page.keyboard.press("Enter");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    await page.screenshot({
      path: `test-results/snapshots/${browserName}/test2_${width}x${height}.png`,
      fullPage: true,
    });

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await test.step("start new game", async () => {
    await page.keyboard.press("Enter");

    await page.screenshot({
      path: `test-results/snapshots/${browserName}/test3_${width}x${height}.png`,
      fullPage: true,
    });

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });
});
