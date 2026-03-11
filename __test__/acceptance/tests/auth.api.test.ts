/**
 * @vitest-environment node
 */
import { describe, it } from "vitest";
import { User } from "../dsl/user";
import { createDriver } from "../config";

describe("Authentication (API)", () => {
  it("can register, sign out, and sign in", async () => {
    const user = await User.register(createDriver());

    await user.signOut();

    await user.signIn(user.email, user.password);
  });

  it("password reset", async () => {
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
