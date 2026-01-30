import { test, expect } from '@playwright/test';

test.skip('shows auth options', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Sign in')).toBeVisible();
  await expect(page.getByText('Send magic link')).toBeVisible();
  await expect(page.getByText('Continue with Google')).toBeVisible();
});
