import { test, expect } from '@playwright/test';

test.describe('Splash Page', () => {
  test('renders INDOR branding and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=INDOR')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('Get Started navigates to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/signup');
  });

  test('Sign In navigates to login', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
  });
});
