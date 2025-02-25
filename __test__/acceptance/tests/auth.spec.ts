import { test, type Browser } from "@playwright/test";
import { User } from "../dsl/user";
import { PlaywrightWebDriver } from "../drivers/webDriver";
import { ApiDriver } from "../drivers/apiDriver";
import { ITestDriver } from "../drivers/ITestDriver";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DRIVER = process.env.DRIVER?.toLowerCase() || "web";

test.use({
  baseURL: BASE_URL,
});

const createDriver = (browser: Browser): ITestDriver => {
  switch (DRIVER) {
    case "api":
      return new ApiDriver(BASE_URL);
    case "web":
    default:
      return new PlaywrightWebDriver(browser);
  }
};

test.describe("Authentication", () => {
  test("can register, sign out, and sign in", async ({ browser }) => {
    const user = await User.register(createDriver(browser));

    await user.signOut();

    await user.signIn(user.email, user.password);
  });

  test("password reset", async ({ browser }) => {
    const email = User.uniqueEmail();
    const initialPassword = "initial-password";
    const updatedPassword = "updated-password";

    const user = await User.register(createDriver(browser), email, initialPassword);

    await user.resetPassword(updatedPassword);

    await user.signOut();

    await user.signInIsUnauthorized(email, initialPassword);

    await user.signIn(email, updatedPassword);
  });
});
