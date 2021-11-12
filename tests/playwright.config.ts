import { PlaywrightTestConfig } from "@playwright/test";

const port = 8081;

export const config: PlaywrightTestConfig = {
  timeout: 30000,
  testDir: "e2e",
  retries: 2,

  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    video: "on-first-retry",
    trace: "retain-on-failure",
    launchOptions: {
      slowMo: process.env.SLOW ? 1000 : 0,
    },
  },
  projects: [
    {
      name: "Chromium-1280-720",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: "Firefox-1280-720",
      use: {
        browserName: "firefox",
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

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
