import { expect, test } from "@playwright/test";

const legalLinks = [
  { label: "Mentions legales", path: "/legal/mentions-legales", heading: "Mentions legales" },
  { label: "Confidentialite", path: "/legal/confidentialite", heading: "Politique de confidentialite" },
  { label: "Conditions generales de vente", path: "/legal/cgv", heading: "Conditions generales de vente" },
  { label: "Livraison", path: "/legal/livraison", heading: "Politique de livraison" },
  { label: "Remboursement", path: "/legal/remboursement", heading: "Politique de remboursement" },
  {
    label: "Contact DPO",
    path: "/legal/confidentialite#contact-DPO",
    heading: "Politique de confidentialite",
    anchor: "#contact-DPO",
  },
];

const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Footer legal navigation", () => {
  test("footer legal links are visible and navigate", async ({ page }) => {
    for (const link of legalLinks) {
      await test.step(`Verify ${link.label}`, async () => {
        await page.goto("/");

        const footerLink = page.getByRole("link", { name: link.label });
        await expect(footerLink, `Footer link ${link.label} should be visible`).toBeVisible();

        await footerLink.click();

        await expect(page).toHaveURL(new RegExp(escapeForRegex(link.path)));
        await expect(page.locator("main h1").first()).toHaveText(link.heading);

        if (link.anchor) {
          await expect(page.locator(link.anchor)).toBeVisible();
        }
      });
    }
  });
});

test.describe("Legal pages content", () => {
  for (const link of legalLinks.filter((item) => !item.anchor)) {
    test(`renders heading for ${link.heading}`, async ({ page }) => {
      await page.goto(link.path);
      await expect(page.locator("main h1").first()).toHaveText(link.heading);
    });
  }
});
