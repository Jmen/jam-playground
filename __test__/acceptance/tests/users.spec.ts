import { test } from "@playwright/test";
import { User } from "../dsl/user";
import { createDriver } from "../config";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.use({
  baseURL: BASE_URL,
});

test.describe("Users", () => {
  test("can set and retrieve their username", async ({ browser }) => {
    const uniqueUsername = `test-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const user = await User.register(createDriver(browser));

    await user.setUsername(uniqueUsername);

    await user.usernameIs(uniqueUsername);
  });
});
