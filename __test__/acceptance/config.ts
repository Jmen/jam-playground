import { Browser } from "@playwright/test";
import { ApiDriver } from "./drivers/apiDriver";
import { ITestDriver } from "./drivers/ITestDriver";
import { PlaywrightWebDriver } from "./drivers/webDriver";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DRIVER = process.env.DRIVER?.toLowerCase() || "api";

export const createDriver = (browser: Browser): ITestDriver => {
  switch (DRIVER) {
    case "api":
      return new ApiDriver(BASE_URL);
    case "web":
    default:
      return new PlaywrightWebDriver(browser);
  }
};
