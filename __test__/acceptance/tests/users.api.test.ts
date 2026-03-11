/**
 * @vitest-environment node
 */
import { describe, it } from "vitest";
import { User } from "../dsl/user";
import { createDriver } from "../config";

describe("Users", () => {
  it("can set and retrieve their username", async () => {
    const uniqueUsername = `test-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const user = await User.register(createDriver());

    await user.setUsername(uniqueUsername);

    await user.usernameIs(uniqueUsername);
  });
});
