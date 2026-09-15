import { expect, test } from "@playwright/test";

test("homepage shows the catalogue shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Snack Rate/);

  const navbar = page.getByRole("navigation");
  await expect(navbar.getByRole("heading", { name: "Snack Rate" })).toBeVisible();
  await expect(navbar.getByRole("link", { name: "Dodaj produkt" })).toBeVisible();
});
