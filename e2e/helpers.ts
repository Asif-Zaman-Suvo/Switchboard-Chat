import { expect, type Page } from "@playwright/test";

export async function loginAsNewUser(page: Page, name = "Playwright User") {
  const phone = `+1555${Date.now().toString().slice(-8)}`;
  await page.goto("/login");
  await page.getByTestId("login-phone").fill(phone);
  await page.getByTestId("login-name").fill(name);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/chat/, { timeout: 45_000 });
  await expect(page.getByTestId("chat-sidebar")).toBeVisible();
  return { phone, name };
}
