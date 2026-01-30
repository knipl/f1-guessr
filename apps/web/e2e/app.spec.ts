import { test, expect } from '@playwright/test';

test('shows next race and group name', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Friends League')).toBeVisible();
  await expect(page.getByText('Next race')).toBeVisible();
  await expect(page.getByText('Bahrain Grand Prix')).toBeVisible();
});

test('shows standings and achievements', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Season standings')).toBeVisible();
  await expect(page.getByText('Achievements')).toBeVisible();
  await expect(page.getByText('Group results (after race)')).toBeVisible();
});
