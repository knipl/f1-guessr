import { test, expect } from '@playwright/test';

test('shows voting editor pills', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Your vote')).toBeVisible();
  await expect(page.getByText('Pick drivers')).toBeVisible();
});
