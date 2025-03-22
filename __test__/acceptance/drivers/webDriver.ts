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
        
        // Click on the Account dropdown menu first
        await page.getByRole("button", { name: /account/i }).click();
        
        // Then click on the Sign out button inside the dropdown
        await page.getByRole("menuitem").filter({ hasText: /sign out/i }).click();

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
    create: async (context: WebContext, name: string, description: string): Promise<void> => {
      return await test.step("Create Jam", async () => {
        const { page } = context;
        await page.goto("/");
        await page.getByRole("link", { name: /create a jam/i }).click();

        await page.waitForLoadState("networkidle");

        await page.getByLabel(/name/i).fill(name);
        await page.getByLabel(/description/i).fill(description);
        await page.getByRole("button", { name: /create/i }).click();

        await page.waitForLoadState("networkidle");
      });
    },
    getAll: async (context: WebContext): Promise<Jam[]> => {
      return await test.step("Get All Jams", async () => {
        const { page } = context;
        await page.goto("/");

        await page.waitForLoadState("networkidle");

        const jams = await page.getByRole("listitem").all();

        const jamsData = await Promise.all(
          jams.map(async (jam) => ({
            id: (await jam.getAttribute("data-id")) ?? "",
            name: (await jam.getByText(/name/i).textContent()) ?? "",
            description: (await jam.getByText(/description/i).textContent()) ?? "",
            createdAt: (await jam.getByText(/created at/i).textContent()) ?? "",
            updatedAt: (await jam.getByText(/updated at/i).textContent()) ?? "",
          })),
        );

        return jamsData;
      });
    },
  };
}
