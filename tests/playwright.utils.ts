import {
  PlaywrightTestOptions,
  PlaywrightWorkerOptions,
  Project,
  test,
  ViewportSize,
} from "@playwright/test";

export type BrowserName = "chromium" | "firefox" | "webkit";
export type TestBody = { title: string };

export const initialiseBrowserConfig =
  (resolutions: ViewportSize[]) =>
  (
    browserName: BrowserName,
  ): Project<PlaywrightTestOptions, PlaywrightWorkerOptions>[] => {
    const configs = resolutions.map(({ width, height }) => ({
      name: `${browserName}-${width}-${height}`,
      use: {
        browserName,
        viewport: { width, height },
      },
    }));

    return configs;
  };

export const testStep = async (
  title: string,
  body: ({ title }: TestBody) => Promise<unknown>,
) => test.step(title, () => body({ title }));

export const initialiseScreenshotSettings = (
  browserName: BrowserName,
  viewport: ViewportSize | null | undefined,
) => {
  let testIndex = 0;

  const resolution = `${viewport?.width}x${viewport?.height}`;

  return (title: string) => {
    const testname = title.replace(/[^a-zA-Z0-9]/g, "_");

    return {
      path: `test-results/snapshots/${browserName}/${resolution}/${testIndex++}_${testname}.png`,
      fullPage: true,
    };
  };
};

export const resolveSlowMotion = (slowmo?: string) => {
  const setting = JSON.parse(slowmo || "250");
  return typeof setting === "number" ? setting : 0;
};
