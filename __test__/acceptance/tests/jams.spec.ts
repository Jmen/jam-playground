import { test } from "@playwright/test";
import { User } from "../dsl/user";
import { createDriver } from "../config";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.use({
  baseURL: BASE_URL,
});

test.describe("Jams", () => {
  test("can create a jam", async ({ browser }) => {
    const user = await User.register(createDriver(browser));

    const jam = await user.jams.create("Test Jam", "Test Description");

    await user.jams.contains(jam.id);
  });
});
