import { PlaywrightTestConfig } from "@playwright/test";
import {
  BrowserName,
  initialiseBrowserConfig,
  resolveSlowMotion,
} from "./playwright.utils";

const port = 8081;

const browsers: BrowserName[] = ["chromium", "firefox"];

const resolutions = [
  // { width: 768, height: 576 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1200 },
  // { width: 3840, height: 2160 },
];

const browserConfig = initialiseBrowserConfig(resolutions);

export const config: PlaywrightTestConfig = {
  timeout: 120 * 1000,
  testDir: "e2e",
  retries: 2,

  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    video: "on",
    // trace: "retain-on-failure",
    launchOptions: {
      slowMo: process.env.SLOW ? resolveSlowMotion(process.env.SLOWMO) : 0,
    },
  },
  projects: browsers.flatMap(browserName => browserConfig(browserName)),

  webServer: {
    command: `yarn webpack:start`,
    port,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stats: "none",
    env: {
      COMMIT_HASH: "snapshot",
      NODE_ENV: "production",
      PORT: JSON.stringify(port),
      SEED: "74477464",
      TEST: "true",
      VERSION: "snapshot",
    },
  },
};

export default config;
