import { test, expect, Page } from '@playwright/test';

async function loginAsHomeowner(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'john@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('Homeowner Dashboard', () => {
  test('shows dashboard content after login', async ({ page }) => {
    await loginAsHomeowner(page);
    // Dashboard should show user's name or welcome content
    await expect(page.getByText('John Mitchell')).toBeVisible({ timeout: 10000 });
  });

  test('sidebar shows navigation links', async ({ page }) => {
    await loginAsHomeowner(page);
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Properties')).toBeVisible();
    await expect(sidebar.getByText('Services')).toBeVisible();
    await expect(sidebar.getByText('Orders')).toBeVisible();
  });

  test('sidebar shows INDOR branding', async ({ page }) => {
    await loginAsHomeowner(page);
    await expect(page.locator('aside').getByText('INDOR')).toBeVisible();
  });

  test('navigate to properties via sidebar', async ({ page }) => {
    await loginAsHomeowner(page);
    await page.locator('aside').getByRole('link', { name: /properties/i }).click();
    await page.waitForURL('**/properties', { timeout: 10000 });
    await expect(page.getByText('Charlotte').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigate to marketplace via sidebar', async ({ page }) => {
    await loginAsHomeowner(page);
    await page.locator('aside').getByRole('link', { name: /services/i }).click();
    await page.waitForURL('**/marketplace', { timeout: 10000 });
  });
});
