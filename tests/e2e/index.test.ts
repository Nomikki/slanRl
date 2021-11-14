import { expect, test } from "@playwright/test";
import { config } from "../playwright.config";
import { initialiseScreenshotSettings, testStep } from "../playwright.utils";

test("run tests", async ({ page, browserName, viewport }) => {
  await page.goto(`http://localhost:${config?.webServer?.port || 8080}`);
  const pageTitle = page.locator("title");
  await expect(pageTitle).toHaveText("Slan Roguelike");

  test.slow();

  const screenshotSettings = initialiseScreenshotSettings(
    browserName,
    viewport,
  );

  /* Menu */
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

    for (let i = 0; i < 2; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("Enter");

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("ArrowDown");

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
    }

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

  /* Floor 1 */
  await testStep("open help", async ({ title }) => {
    await page.keyboard.press("?");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("equip gear", async ({ title }) => {
    await page.keyboard.press("Escape");

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("w");
      await page.keyboard.press("b");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("drop others", async ({ title }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("d");
      await page.keyboard.press("a");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to room 1", async ({ title }) => {
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowUp");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("open door", async ({ title }) => {
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowUp");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("kill rats", async ({ title }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowUp");
    }
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press("ArrowUp");
    }
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press("ArrowLeft");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("pickup healthpotion", async ({ title }) => {
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("g");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to stairs", async ({ title }) => {
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("ArrowRight");
    }
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowDown");
    }
    for (let i = 0; i < 17; i++) {
      await page.keyboard.press("ArrowLeft");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to floor 2", async ({ title }) => {
    await page.keyboard.press(">");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  /* Floor 2 */
  await testStep("open secret door", async ({ title }) => {
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowDown");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to room 2", async ({ title }) => {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("ArrowRight");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("pickup scroll of fireball", async ({ title }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("g");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to stairs", async ({ title }) => {
    for (let i = 0; i < 18; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 21; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 17; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowDown");
    for (let i = 0; i < 19; i++) {
      await page.keyboard.press("ArrowDown");
    }
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowDown");
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowDown");
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("g");
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowDown");
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowRight");
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowRight");
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press("ArrowRight");
    }
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowUp");
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("g");
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowDown");
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowLeft");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("move to floor 3", async ({ title }) => {
    await page.keyboard.press(">");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  /* Floor 3 */
  await testStep("save game", async ({ title }) => {
    await page.keyboard.press("S");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("reload page", async ({ title }) => {
    await page.reload();

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("continue game", async ({ title }) => {
    await page.keyboard.press("Enter");

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("DIE", async ({ title }) => {
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press("i");
    await page.keyboard.press("b");
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press("Enter");
    // Rat dead

    for (let i = 0; i < 17; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 27; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("d");
      await page.keyboard.press("a");
    }
    await page.keyboard.press("o");
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    for (let i = 0; i < 39; i++) {
      await page.keyboard.press("ArrowDown");
    }

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  await testStep("open temp-image", async ({ title }) => {
    await page.$eval("#temp-image", async el => {
      if (!el.classList.contains("zoomed")) {
        el.classList.add("zoomed");
      }
    });
    await page.waitForTimeout(2000);

    await page.screenshot(screenshotSettings(title));

    // expect(
    //   await page.screenshot({
    //     fullPage: true,
    //   }),
    // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  });

  // await testStep("go to floor 4", async ({ title }) => {
  //   await page.keyboard.press(">");

  //   await page.screenshot(screenshotSettings(title));

  //   // expect(
  //   //   await page.screenshot({
  //   //     fullPage: true,
  //   //   }),
  //   // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  // });

  // /* Floor 4 */
  // await testStep("pick and use healthpotion", async ({ title }) => {
  //   await page.keyboard.press("ArrowRight");
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowDown");
  //   for (let i = 0; i < 9; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   await page.keyboard.press("g");
  //   await page.keyboard.press("i");
  //   await page.keyboard.press("x");

  //   await page.screenshot(screenshotSettings(title));

  //   // expect(
  //   //   await page.screenshot({
  //   //     fullPage: true,
  //   //   }),
  //   // ).toMatchSnapshot(`tests/screenshots/${browserName}-screenshot.png`);
  // });

  // await testStep("pickup healthpotion", async ({ title }) => {
  //   for (let i = 0; i < 3; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowRight");

  //   for (let i = 0; i < 10; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("Enter");
  //   for (let i = 0; i < 7; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowRight");

  //   for (let i = 0; i < 30; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   for (let i = 0; i < 4; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("g");
  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("pickup scroll of map", async ({ title }) => {
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   for (let i = 0; i < 20; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   for (let i = 0; i < 8; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 16; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("ArrowLeft");
  //   for (let i = 0; i < 21; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowUp");
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   for (let i = 0; i < 29; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("ArrowUp");
  //   await page.keyboard.press("g");
  //   // await page.keyboard.press("i");

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("go to stairs", async ({ title }) => {
  //   for (let i = 0; i < 4; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   for (let i = 0; i < 22; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowLeft");
  //   for (let i = 0; i < 4; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 4; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowUp");
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowDown");
  //   await page.keyboard.press("ArrowDown");
  //   await page.keyboard.press("ArrowDown");
  //   await page.keyboard.press("ArrowDown");

  //   for (let i = 0; i < 7; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("g");
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   for (let i = 0; i < 2; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("go to floor 5", async ({ title }) => {
  //   await page.keyboard.press(">");

  //   await page.screenshot(screenshotSettings(title));
  // });

  // /* Floor 5 */
  // await testStep("pickup scroll of confusion", async ({ title }) => {
  //   for (let i = 0; i < 12; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowLeft");
  //   for (let i = 0; i < 11; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   for (let i = 0; i < 10; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowDown");
  //   for (let i = 0; i < 9; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   for (let i = 0; i < 4; i++) {
  //     await page.keyboard.press("ArrowLeft");
  //   }
  //   await page.keyboard.press("g");

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("pickup healthpotion", async ({ title }) => {
  //   for (let i = 0; i < 7; i++) {
  //     await page.keyboard.press("ArrowDown");
  //   }
  //   for (let i = 0; i < 11; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowRight");
  //   for (let i = 0; i < 26; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("o");
  //   await page.keyboard.press("ArrowRight");
  //   for (let i = 0; i < 11; i++) {
  //     await page.keyboard.press("ArrowRight");
  //   }
  //   await page.keyboard.press("ArrowDown");
  //   await page.keyboard.press("g");

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("go to stairs", async ({ title }) => {
  //   for (let i = 0; i < 16; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }
  //   await page.keyboard.press("ArrowLeft");

  //   for (let i = 0; i < 12; i++) {
  //     await page.keyboard.press("ArrowUp");
  //   }

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("go to floor 6", async ({ title }) => {
  //   await page.keyboard.press(">");

  //   await page.screenshot(screenshotSettings(title));
  // });

  // await testStep("save game", async ({ title }) => {
  //   await page.keyboard.press("S");

  //   await page.screenshot(screenshotSettings(title));
  // });
});
