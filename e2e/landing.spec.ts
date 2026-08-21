import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("shows product and routes to login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /every conversation/i })).toBeVisible();
    await page.getByTestId("cta-start-chatting").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
