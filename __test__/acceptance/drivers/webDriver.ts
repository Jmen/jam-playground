import { test, expect, Page, type Browser } from "@playwright/test";
import { ITestDriver, Jam } from "./ITestDriver";

export interface WebContext {
  page: Page;
}

export class PlaywrightWebDriver implements ITestDriver {
  constructor(private readonly browser: Browser) {}

  auth = {
    register: async (email: string, password: string): Promise<WebContext> => {
      return await test.step("Register", async () => {
        const context = await this.browser.newContext();
        const page = await context.newPage();

        await page.goto("/auth");
        await page.getByRole("tab", { name: /register/i }).click();
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole("button", { name: /create account/i }).click();

        await page.waitForLoadState("networkidle");

        await page.goto("/account");

        await page.waitForLoadState("networkidle");

        await expect(page.getByText(email)).toBeVisible();

        return { page };
      });
    },
    signIn: async (email: string, password: string): Promise<WebContext> => {
      return await test.step("Sign In", async () => {
        const context = await this.browser.newContext();
        const page = await context.newPage();

        await page.goto("/auth");
        await page.getByRole("tab", { name: /sign in/i }).click();
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole("button", { name: /sign in/i }).click();

        await page.waitForLoadState("networkidle");

        await page.goto("/account");

        await page.waitForLoadState("networkidle");

        await expect(page.getByText(email)).toBeVisible();

        return { page };
      });
    },
    signInIsUnauthorized: async (
      email: string,
      password: string,
    ): Promise<void> => {
      await test.step("Sign In is Unauthorized", async () => {
        const context = await this.browser.newContext();
        const page = await context.newPage();

        await page.goto("/auth");
        await page.getByRole("tab", { name: /sign in/i }).click();
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole("button", { name: /sign in/i }).click();

        await page.waitForLoadState("networkidle");

        await expect(page.getByText(/invalid/i)).toBeVisible();
      });
    },
    signOut: async (context: WebContext): Promise<void> => {
      await test.step("Sign Out", async () => {
        const { page } = context;

        // Click on the Account dropdown menu first
        await page.getByRole("button", { name: /account/i }).click();

        // Then click on the Sign out button inside the dropdown
        await page
          .getByRole("menuitem")
          .filter({ hasText: /sign out/i })
          .click();

        await page.waitForLoadState("networkidle");
      });
    },
    resetPassword: async (
      context: WebContext,
      newPassword: string,
    ): Promise<void> => {
      await test.step("Reset Password", async () => {
        const { page } = context;
        await page.goto("/account");
        await page.getByLabel(/new password/i).fill(newPassword);
        await page.getByLabel(/confirm password/i).fill(newPassword);
        await page.getByRole("button", { name: /reset password/i }).click();

        await page.waitForLoadState("networkidle");
      });
    },
  };

  user = {
    setMyProfile: async (
      context: WebContext,
      profile: { username: string },
    ): Promise<void> => {
      await test.step("Set My Profile", async () => {
        const { page } = context;
        await page.goto("/account");
        await page.getByLabel(/username/i).fill(profile.username);
        await page.getByRole("button", { name: /update profile/i }).click();

        await page.waitForLoadState("networkidle");
      });
    },
    getMyProfile: async (
      context: WebContext,
    ): Promise<{ username: string }> => {
      return await test.step("Get My Profile", async () => {
        const { page } = context;
        await page.goto("/account");

        await page.waitForTimeout(1000);
        await page.waitForLoadState("networkidle");

        const usernameInput = page.getByLabel(/username/i);
        await usernameInput.waitFor({ state: "visible" });

        const username = await usernameInput.inputValue();
        return { username };
      });
    },
  };

  jams = {
    create: async (
      context: WebContext,
      name: string,
      description: string,
    ): Promise<Jam> => {
      return await test.step("Create Jam", async () => {
        const { page } = context;
        await page.goto("/");
        await page.getByRole("link", { name: /start a jam/i }).click();

        await page.waitForLoadState("networkidle");

        await page.getByLabel(/name/i).fill(name);
        await page.getByLabel(/description/i).fill(description);
        await page.getByRole("button", { name: /create/i }).click();

        await page.waitForLoadState("networkidle");

        await expect(page.locator('[data-testid="jam-card"]')).toBeVisible();

        const jamId =
          (await page.locator('[data-testid="jam-id"]').textContent()) || "";
        const nameText =
          (await page.locator('[data-testid="jam-name"]').textContent()) || "";
        const descriptionText =
          (await page
            .locator('[data-testid="jam-description"]')
            .textContent()) || "";
        const createdAt =
          (await page
            .locator('[data-testid="jam-created-at"]')
            .textContent()) || "";

        return {
          id: jamId,
          name: nameText.replace(/^Name:\s*/, ""),
          description: descriptionText.replace(/^Description:\s*/, ""),
          createdAt,
        };
      });
    },
    getAll: async (context: WebContext): Promise<Jam[]> => {
      return await test.step("Get All Jams", async () => {
        const { page } = context;

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const jamCards = await page.locator('[data-testid="jam-card"]').all();

        const jamsData = await Promise.all(
          jamCards.map(async (jamCard) => {
            const id =
              (await jamCard.locator('[data-testid="jam-id"]').textContent()) ??
              "";
            const nameText =
              (await jamCard
                .locator('[data-testid="jam-name"]')
                .textContent()) ?? "";
            const descriptionText =
              (await jamCard
                .locator('[data-testid="jam-description"]')
                .textContent()) ?? "";
            const createdAt =
              (await jamCard
                .locator('[data-testid="jam-created-at"]')
                .textContent()) ?? "";

            return {
              id,
              name: nameText.replace(/^Name:\s*/, ""),
              description: descriptionText.replace(/^Description:\s*/, ""),
              createdAt,
            };
          }),
        );

        return jamsData;
      });
    },
    get: async (
      context: WebContext,
      name: string,
    ): Promise<Jam | undefined> => {
      return await test.step("Get Jam", async () => {
        const { page } = context;

        await page.waitForTimeout(1000);

        const url = page.url();

        const isHomePage =
          url.endsWith("/") ||
          url.includes("/jam-playground") ||
          url.includes("localhost") ||
          url.includes("127.0.0.1");

        if (!isHomePage) {
          throw new Error(
            `Test failed: Not redirected to home page. Current URL: ${url}`,
          );
        }

        const jams = await this.jams.getAll(context);

        return jams.find((jam) => jam.name === name);
      });
    },
  };
}
