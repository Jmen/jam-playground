import { test } from "@playwright/test";
import { User } from "../dsl/user";
import { createDriver } from "../config";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.use({
  baseURL: BASE_URL,
});

test.describe("Authentication", () => {
  test("can register, sign out, and sign in", async () => {
    const user = await User.register(createDriver());

    await user.signOut();

    await user.signIn(user.email, user.password);
  });

  test("password reset", async () => {
    const email = User.uniqueEmail();
    const initialPassword = "initial-password";
    const updatedPassword = "updated-password";

    const user = await User.register(createDriver(), email, initialPassword);

    await user.resetPassword(updatedPassword);

    await user.signOut();

    await user.signInIsUnauthorized(email, initialPassword);

    await user.signIn(email, updatedPassword);
  });
});
