import { test, expect } from "@playwright/test";

test.describe("WanderMind smoke", () => {
  test("home page loads trip planner", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("India trip");
    await expect(page.getByText(/problem statement/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /skip to trip planner/i })).toBeAttached();
    await expect(page.getByRole("button", { name: /build grounded itinerary/i })).toBeVisible();
  });

  test("quality scorecard page loads", async ({ page }) => {
    await page.goto("/quality");
    await expect(page.getByText("AI Evaluation Score")).toBeVisible();
    await expect(page.getByText("Detailed score breakdown")).toBeVisible();
  });

  test("destination spotlight is keyboard reachable", async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("button", { name: /Jaipur/i }).first();
    await expect(card).toBeVisible();
    await card.focus();
    await expect(card).toBeFocused();
  });
});
