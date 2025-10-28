import { expect, test } from "@playwright/test";
import fixtures from "@/docs/tests/fixtures.json";

test.describe("UI regression guards", () => {
  test("homepage renders hero header and CTA", async ({ page }) => {
    await page.goto(fixtures.ui_header_cta.path);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /entrer dans l'atelier/i })).toBeVisible();
  });

  test("guest cart icon keeps tooltip accessibility", async ({ page }) => {
    await page.goto("/");
    const guestIcon = page.getByTestId("cart-icon-guest");
    await expect(guestIcon).toBeVisible();

    await guestIcon.hover();
    await expect(page.getByRole("tooltip")).toContainText(/Connectez-vous pour/i);
  });
});
