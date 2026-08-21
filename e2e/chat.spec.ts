import { expect, test } from "@playwright/test";
import { loginAsNewUser } from "./helpers";

test.describe("chat", () => {
  test("opens search dialog and finds users", async ({ page }) => {
    await loginAsNewUser(page);
    await page.getByTestId("new-chat").click();
    await expect(page.getByRole("heading", { name: "New line" })).toBeVisible();
    await page.getByTestId("user-search").fill("Ada");
    await expect(page.getByText(/Ada Lovelace|Ada/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("blocks whitespace-only send after opening a thread", async ({ page }) => {
    await loginAsNewUser(page);
    await page.getByTestId("new-chat").click();
    await page.getByTestId("user-search").fill("Ada");
    await page.getByRole("button", { name: /Ada/i }).first().click();
    await expect(page).toHaveURL(/\/chat\/.+/, { timeout: 20_000 });
    const composer = page.getByPlaceholder("Transmit…");
    await composer.fill("   ");
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
