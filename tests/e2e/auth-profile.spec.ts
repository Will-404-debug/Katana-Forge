import { config as dotenvConfig } from "dotenv";
import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const TEST_PASSWORD = "TestPassword!1";

dotenvConfig({ path: ".env.local" });
dotenvConfig();

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe("Profile access control", () => {
  test("redirects unauthenticated users to the login page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/connexion$/);
  });

  test("allows access to /profile when authenticated", async ({ context, page }) => {
    const email = `playwright-${randomUUID()}@example.com`;

    const user = await prisma.user.create({
      data: {
        email,
        name: "Playwright User",
        passwordHash: await hashPassword(TEST_PASSWORD),
      },
    });

    try {
      const response = await page.request.post("/api/auth/login", {
        data: {
          email,
          password: TEST_PASSWORD,
        },
      });

      expect(response.ok()).toBeTruthy();

      const setCookieHeader = response.headers()["set-cookie"];
      if (!setCookieHeader) {
        throw new Error("No auth cookie received from login endpoint");
      }

      const authCookie = parseAuthCookie(setCookieHeader);
      if (!authCookie) {
        throw new Error("Unable to parse auth cookie from login response");
      }

      await context.addCookies([authCookie]);

      await page.goto("/profile");
      await expect(page).toHaveURL(/\/profile$/);
      await expect(page.getByRole("heading", { level: 1, name: "Votre profil" })).toBeVisible();
      await expect(page.getByText(user.email)).toBeVisible();
    } finally {
      await context.clearCookies();
      await prisma.user.delete({
        where: { id: user.id },
      });
    }
  });
});

function parseAuthCookie(header: string) {
  const cookies = header.split(/,(?=[^;]+=)/g); // split cookies but keep attributes
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed.toLowerCase().startsWith("auth_token=")) {
      continue;
    }

    const [nameValue, ...attributes] = trimmed.split(";");
    const [, value] = nameValue.split("=");

    const cookieAttributes = attributes.reduce<Record<string, string>>((accumulator, attribute) => {
      const [attrName, attrValue] = attribute.trim().split("=");
      accumulator[attrName.toLowerCase()] = attrValue ?? "";
      return accumulator;
    }, {});

    const isSecure = Object.prototype.hasOwnProperty.call(cookieAttributes, "secure");
    const sameSiteValue = cookieAttributes.samesite?.toLowerCase();
    const sameSite: "Strict" | "Lax" | "None" =
      sameSiteValue === "strict" ? "Strict" : sameSiteValue === "none" ? "None" : "Lax";

    return {
      name: "auth_token",
      value,
      domain: cookieAttributes.domain ?? "127.0.0.1",
      path: cookieAttributes.path || "/",
      httpOnly: true,
      sameSite,
      secure: isSecure,
    };
  }

  return null;
}
