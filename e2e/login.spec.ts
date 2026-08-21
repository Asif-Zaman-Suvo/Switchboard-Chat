import { expect, test } from "@playwright/test";

test.describe("login", () => {
  test("blocks empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-submit").click();
    await expect(page.getByText("Enter a phone number")).toBeVisible();
    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /chat redirects to login", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("new phone registers and opens chat", async ({ page }) => {
    const phone = `+1555${Date.now().toString().slice(-8)}`;
    await page.goto("/login");
    await page.getByTestId("login-phone").fill(phone);
    await page.getByTestId("login-name").fill("Playwright User");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/chat/, { timeout: 45_000 });
    await expect(page.getByText("Playwright User")).toBeVisible();
  });
});
