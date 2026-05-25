import { test, expect } from '@playwright/test';

async function loginAndGoToMarketplace(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'john@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.goto('/marketplace');
}

test.describe('Service Marketplace', () => {
  test('displays service catalog with categories', async ({ page }) => {
    await loginAndGoToMarketplace(page);
    await expect(page.getByText('HVAC').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Plumbing' })).toBeVisible();
  });

  test('shows service prices', async ({ page }) => {
    await loginAndGoToMarketplace(page);
    await expect(page.getByText(/\$\d+/).first()).toBeVisible({ timeout: 15000 });
  });
});
