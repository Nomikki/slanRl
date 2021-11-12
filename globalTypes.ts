import { Browser, Page } from "@playwright/test";
declare global {
  const browser: Browser;
  const page: Page;
  const browserName: string;
}
