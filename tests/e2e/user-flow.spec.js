const { test, expect } = require("@playwright/test");

test.describe("DevOps Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title and initial content", async ({ page }) => {
    await expect(page).toHaveTitle(/DevOps Project Dashboard/);
    await expect(
      page.getByRole("heading", { name: "System Health Dashboard" })
    ).toBeVisible();
    await expect(page.getByText("Waiting for action...")).toBeVisible();
  });

  test("loads backend message on button click", async ({ page }) => {
    await page.getByRole("button", { name: "Call Backend API" }).click();

    await expect(page.locator("#status")).toContainText(
      "Backend workflow testing",
      {
        timeout: 10000,
      }
    );
  });

  test("call button remains interactive", async ({ page }) => {
    const callButton = page.getByRole("button", { name: "Call Backend API" });
    await expect(callButton).toBeEnabled();

    await callButton.click();

    await expect(callButton).toBeEnabled();
  });

  test("shows fallback message when backend request fails", async ({
    page,
  }) => {
    await page.route("**/api/hello", async (route) => {
      await route.abort();
    });

    await page.getByRole("button", { name: "Call Backend API" }).click();

    await expect(page.getByText("Backend not reachable")).toBeVisible();
  });
});
