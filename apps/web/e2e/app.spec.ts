import { test, expect } from '@playwright/test';

test('shows next race and group name', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Friends League')).toBeVisible();
  await expect(page.getByText('Next race')).toBeVisible();
  await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
});

test('shows ten picks', async ({ page }) => {
  await page.goto('/');

  const picks = page.getByText(/P\d+/);
  await expect(picks).toHaveCount(10);
});
