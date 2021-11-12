import { expect, test } from "@playwright/test";
import { config } from "../playwright.config";

const testStep = async (
  title: string,
  body: ({ title }: { title: string }) => Promise<unknown>,
) => test.step(title, () => body({ title }));

test("run tests", async ({ page, browserName, viewport }) => {
  await page.goto(`http://localhost:${config?.webServer?.port || 8080}`);
  const pageTitle = page.locator("title");
  await expect(pageTitle).toHaveText("Slan Roguelike");

  test.slow();

  const screenshotSettings = (title: string) => ({
    path: `test-results/snapshots/${browserName}/${title}_${viewport?.width}x${viewport?.height}.png`,
    fullPage: true,
  });

  await testStep("initial view snapshot", async ({ title }) => {
    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("character build menu", async ({ title }) => {
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

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("start new game", async ({ title }) => {
    await page.keyboard.press("Enter");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });
});
