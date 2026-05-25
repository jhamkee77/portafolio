import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@indor.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.getByRole('button', { name: /sign in/i }).click();
  // Admin redirects to /admin
  await page.waitForURL('**/admin', { timeout: 15000 });
}

test.describe('Admin Panel', () => {
  test('admin login redirects to admin dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('admin dashboard loads stats', async ({ page }) => {
    await loginAsAdmin(page);
    // Wait for dashboard stats to load from API
    await page.waitForTimeout(2000);
    // Dashboard shows stats cards
    await expect(page.getByText(/users|orders|providers|revenue/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('admin can view providers page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/providers');
    await expect(page.getByText('Charlotte HVAC Pros')).toBeVisible({ timeout: 15000 });
  });

  test('admin can view customers page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/customers');
    await expect(page.getByText('John Mitchell')).toBeVisible({ timeout: 15000 });
  });

  test('admin can view orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await page.waitForTimeout(2000);
    // Should display order status badges or order content
    await expect(page.locator('table, [class*="card"], [class*="space-y"]').first()).toBeVisible({ timeout: 10000 });
  });
});
