import { PlaywrightTestConfig } from "@playwright/test";

type BrowserName = "chromium" | "firefox" | "webkit";

const port = 8081;

const resolutions = [
  // { width: 768, height: 576 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1200 },
  // { width: 3840, height: 2160 },
];

const browserConfig = (browserName: BrowserName) => {
  const configs = resolutions.map(({ width, height }) => ({
    name: `${browserName}-${width}-${height}`,
    use: {
      browserName,
      viewport: { width, height },
    },
  }));

  return configs;
};

export const config: PlaywrightTestConfig = {
  timeout: 120 * 1000,
  testDir: "e2e",
  retries: 2,

  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    // video: "on-first-retry",
    // trace: "retain-on-failure",
    launchOptions: {
      slowMo: process.env.SLOW ? 250 : 0,
    },
  },
  projects: [...browserConfig("chromium"), ...browserConfig("firefox")],

  webServer: {
    command: `cross-env PORT=${port} yarn webpack:start`,
    port,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stats: "none",
    env: {
      TEST: "true",
      SEED: "74477464",
      NODE_ENV: "production",
    },
  },
};

export default config;
