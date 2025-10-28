import { config as dotenvConfig } from "dotenv";

import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import fixtures from "@/docs/tests/fixtures.json";

const prisma = new PrismaClient();

dotenvConfig({ path: ".env.local" });
dotenvConfig();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe("Access control", () => {
  test("redirects anonymous user from /compte to login", async ({ page }) => {
    await page.goto(fixtures.forbidden_profile.path);
    await expect(page).toHaveURL(/\/connexion$/);
  });

  test("allows navigation to /compte after successful login", async ({ context, page }) => {
    const credentials = {
      email: `playwright-${randomUUID()}@example.com`,
      password: fixtures.auth_valid_user.password,
      name: "Compte Testeur",
    };

    try {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const csrfToken = await page.evaluate(() => {
        const match = document.cookie.split("; ").find((part) => part.startsWith("kf.csrf="));
        return match ? match.split("=")[1] : null;
      });

      if (!csrfToken) {
        throw new Error("CSRF cookie not initialised");
      }

      const registerResponse = await page.request.post("/api/auth/register", {
        headers: {
          "x-csrf-token": csrfToken,
          cookie: `kf.csrf=${csrfToken}`,
        },
        data: credentials,
      });

      expect(registerResponse.status(), "register API must return 201").toBe(201);

      const setCookieHeader = registerResponse.headers()["set-cookie"];
      if (!setCookieHeader) {
        throw new Error("No auth cookie returned");
      }

      const authCookie = parseAuthCookie(setCookieHeader);
      if (!authCookie) {
        throw new Error("Unable to parse auth cookie");
      }

      await context.addCookies([authCookie]);

      await page.goto("/compte");
      await expect(page).toHaveURL(/\/compte$/);
      await expect(page.getByRole("heading", { level: 1, name: /bienvenue/i })).toBeVisible();
    } finally {
      await context.clearCookies();
      await prisma.user.deleteMany({ where: { email: credentials.email } });
    }
  });
});

function parseAuthCookie(header: string) {
  const cookies = header.split(/,(?=[^;]+=)/g);
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed.toLowerCase().startsWith("auth_token=")) {
      continue;
    }

    const [nameValue, ...attributes] = trimmed.split(";");
    const [, value] = nameValue.split("=");

    const attrs = attributes.reduce<Record<string, string>>((acc, attribute) => {
      const [attrName, attrValue] = attribute.trim().split("=");
      acc[attrName.toLowerCase()] = attrValue ?? "";
      return acc;
    }, {});

    const sameSiteValue = attrs.samesite?.toLowerCase();
    const sameSite: "Strict" | "Lax" | "None" =
      sameSiteValue === "strict" ? "Strict" : sameSiteValue === "none" ? "None" : "Lax";

    return {
      name: "auth_token",
      value,
      domain: attrs.domain ?? "127.0.0.1",
      path: attrs.path || "/",
      httpOnly: true,
      sameSite,
      secure: Object.prototype.hasOwnProperty.call(attrs, "secure"),
    };
  }

  return null;
}
