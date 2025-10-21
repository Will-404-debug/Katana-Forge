import { config as dotenvConfig } from "dotenv";
import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();
const TEST_PASSWORD = "TestPassword!1";

dotenvConfig({ path: ".env.local" });
dotenvConfig();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("persists draft and merges after login", async ({ page }) => {
  const email = `merge-${randomUUID()}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      name: "Draft Merge User",
      passwordHash: await hashPassword(TEST_PASSWORD),
    },
  });

  try {
    await page.goto("/atelier/demo");

    const handleColor = page.locator('input[name="handleColor"]');
    await handleColor.evaluate((element, value) => {
      (element as HTMLInputElement).value = value as string;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, "#3366ff");

    const quantityInput = page.getByTestId("quantity-input");
    await quantityInput.fill("3");

    await page.waitForTimeout(800);

    await page.getByRole("link", { name: "Connexion" }).click();

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/compte$/);

    await page.goto("/atelier/demo");

    await expect(quantityInput).toHaveValue("3");
    await expect(handleColor).toHaveValue("#3366ff");
  } finally {
    await prisma.katanaDraft.deleteMany({ where: { ownerId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
});
