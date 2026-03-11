import { test, expect } from "@playwright/test";

test("smoke test - create a jam", async ({ page }) => {
  const email = `smoke-${Date.now()}@example.com`;
  await page.goto("/auth");
  await page.getByRole("tab", { name: /register/i }).click();
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL("/");
  await page.goto("/jams/create");
  await page.getByLabel(/name/i).fill("Smoke Jam");
  await page.getByLabel(/description/i).fill("Smoke test");
  await page.getByRole("button", { name: /create/i }).click();
  await expect(page.locator('[data-testid="jam-card"]')).toBeVisible();
});
