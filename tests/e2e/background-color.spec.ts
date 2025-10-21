import { expect, test } from "@playwright/test";

test("background color persists after reload", async ({ page }) => {
  await page.goto("/atelier/demo");

  const hexInput = page.getByTestId("background-hex-input");
  await expect(hexInput).toBeVisible();

  const swatch = page.getByTestId("background-swatch-101828");
  await swatch.click();

  await expect(hexInput).toHaveValue("#101828");

  await page.reload();

  await expect(hexInput).toHaveValue("#101828");

  const storedValue = await page.evaluate(() => window.localStorage.getItem("katana-background-color"));
  expect(storedValue).toBe("#101828");

  await page.evaluate(() => window.localStorage.removeItem("katana-background-color"));
});
