import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("shows product and routes to login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /every conversation/i })).toBeVisible();
    await page.getByTestId("cta-start-chatting").click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("demo pane sends a local bubble", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("preview-composer").fill("hello demo");
    await page.getByTestId("preview-send").click();
    await expect(page.getByText("hello demo")).toBeVisible();
    await expect(page.getByText(/Received on the demo line/i)).toBeVisible();
  });
});
