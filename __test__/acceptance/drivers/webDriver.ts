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

        await expect(page.getByText(email)).toBeVisible();

        return { page };
      });
    },
    signInIsUnauthorized: async (email: string, password: string): Promise<void> => {
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
        await page.getByRole("button", { name: /sign out/i }).click();

        await page.waitForLoadState("networkidle");
      });
    },
    resetPassword: async (context: WebContext, newPassword: string): Promise<void> => {
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
    setMyProfile: async (context: WebContext, profile: { username: string }): Promise<void> => {
      await test.step("Set My Profile", async () => {
        const { page } = context;
        await page.goto("/account");
        await page.getByLabel(/username/i).fill(profile.username);
        await page.getByRole("button", { name: /update profile/i }).click();

        await page.waitForLoadState("networkidle");
      });
    },
    getMyProfile: async (context: WebContext): Promise<{ username: string }> => {
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
    create: async (context: WebContext, name: string): Promise<Jam> => {
      return await test.step("Create Jam", async () => {
        const { page } = context;
        await page.goto("/home");
        await page.getByRole("button", { name: /create jam/i }).click();

        await page.waitForLoadState("networkidle");

        return {
          id: "1",
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    },
    getAll: async (context: WebContext): Promise<Jam[]> => {
      return await test.step("Get All Jams", async () => {
        const { page } = context;
        await page.goto("/home");

        await page.waitForLoadState("networkidle");

        return [];
      });
    },
  };
}
