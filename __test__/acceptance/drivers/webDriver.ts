import { type Browser, expect, Page, test } from "@playwright/test";
import { ITestDriver } from "./ITestDriver";
import { DraftLoop, Jam } from "../dsl/jams";

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
        const created_at =
          (await page
            .locator('[data-testid="jam-created-at"]')
            .textContent()) || "";

        const loopContainers = await page
          .locator('[data-testid^="loop-container-"]')
          .all();
        const loops = await Promise.all(
          loopContainers.map(async (loopContainer) => {
            const audioElements = await loopContainer
              .locator('[data-testid^="audio-"]')
              .all();
            const audio = await Promise.all(
              audioElements.map(async (audioElement) => {
                const dataTestId =
                  (await audioElement.getAttribute("data-testid")) || "";
                const id = dataTestId.replace("audio-", "");
                return { id };
              }),
            );
            return { audio };
          }),
        );

        return {
          id: jamId.replace(/^ID:\s*/, ""),
          name: nameText.replace(/^Name:\s*/, ""),
          description: descriptionText.replace(/^Description:\s*/, ""),
          created_at,
          loops: loops || [],
        };
      });
    },
    getAll: async (context: WebContext): Promise<Jam[]> => {
      return await test.step("Get All Jams", async () => {
        const { page } = context;

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const jamCards = await page.locator('[data-testid="jam-card"]').all();

        return await Promise.all(
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
            const created_at =
              (await jamCard
                .locator('[data-testid="jam-created-at"]')
                .textContent()) ?? "";

            const loopContainer = await jamCard
              .locator('[data-testid^="loop-container-"]')
              .first();
            let loops: { audio: { id: string }[] }[] = [];

            if ((await loopContainer.count()) > 0) {
              const audioElements = await loopContainer
                .locator('[data-testid^="audio-"]')
                .all();
              const audio = await Promise.all(
                audioElements.map(async (audioElement) => {
                  const dataTestId =
                    (await audioElement.getAttribute("data-testid")) || "";
                  const id = dataTestId.replace("audio-", "");
                  return { id };
                }),
              );
              loops = [{ audio }];
            }

            return {
              id: id.replace(/^ID:\s*/, ""),
              name: nameText.replace(/^Name:\s*/, ""),
              description: descriptionText.replace(/^Description:\s*/, ""),
              created_at,
              loops: loops || [],
            };
          }),
        );
      });
    },
    get: async (
      context: WebContext,
      jamId: string,
    ): Promise<Jam | undefined> => {
      return await test.step("Get Jam", async () => {
        const { page } = context;

        await page.goto(`/jams/${jamId}`);
        await page.waitForLoadState("networkidle");

        const nameText =
          (await page.locator('[data-testid="jam-name"]').textContent()) || "";
        const descriptionText =
          (await page
            .locator('[data-testid="jam-description"]')
            .textContent()) || "";
        const created_at =
          (await page
            .locator('[data-testid="jam-created-at"]')
            .textContent()) || "";

        const loopContainers = await page
          .locator('[data-testid^="loop-container-"]')
          .all();
        const loops = await Promise.all(
          loopContainers.map(async (loopContainer) => {
            const audioElements = await loopContainer
              .locator('[data-testid^="audio-"]')
              .all();
            const audio = await Promise.all(
              audioElements.map(async (audioElement) => {
                const dataTestId =
                  (await audioElement.getAttribute("data-testid")) || "";
                const id = dataTestId.replace("audio-", "");
                return { id };
              }),
            );
            return { audio };
          }),
        );

        return {
          id: jamId,
          name: nameText.replace(/^Name:\s*/, ""),
          description: descriptionText.replace(/^Description:\s*/, ""),
          created_at,
          loops: loops || [],
        };
      });
    },
    addLoop: async (
      context: WebContext,
      jamId: string,
      draftLoop: DraftLoop,
    ): Promise<void> => {
      return await test.step("Add Loop to Jam", async () => {
        const { page } = context;

        await page.goto(`/jams/${jamId}`);
        await page.waitForLoadState("networkidle");

        const initialLoopCount = await page
          .locator('[data-testid^="loop-container-"]')
          .count();

        await page.getByTestId("add-loop-button").click();

        for (const audio of draftLoop.audio) {
          await page.getByTestId(`audio-item-${audio.id}`).click();
        }

        await page.getByRole("button", { name: "Add", exact: true }).click();

        await page.waitForLoadState("networkidle");

        const expectedLoopCount = initialLoopCount + 1;

        try {
          await page.waitForFunction(
            (expected) => {
              const containers = document.querySelectorAll(
                '[data-testid^="loop-container-"]',
              );
              return containers.length >= expected;
            },
            expectedLoopCount,
            { timeout: 5000 },
          );
        } catch (error) {
          console.error("Timeout waiting for loop to appear:", error);
        }
      });
    },
  };

  audio = {
    upload: async (
      context: WebContext,
      path: string,
      type: string,
    ): Promise<{ id: string }> => {
      return await test.step("Upload Audio", async () => {
        const { page } = context;

        await page.goto("/audio/upload");
        await page.waitForLoadState("networkidle");

        const fileInput = page.locator('input[type="file"]');

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("fs");
        await fileInput.setInputFiles({
          name: path,
          mimeType: type,
          buffer: Buffer.from(fs.readFileSync(path)),
        });

        await page.getByRole("button", { name: /upload/i }).click();

        await page.waitForLoadState("networkidle");

        const audioId =
          (await page.getByTestId("audio-id").textContent()) || "";

        return { id: audioId };
      });
    },
  };
}
