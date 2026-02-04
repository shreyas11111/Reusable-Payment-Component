import { test, expect } from '@playwright/test';

test.describe('Payment component E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/index.html');
  });

  test('renders secure-payment-form', async ({ page }) => {
    const form = page.locator('secure-payment-form');
    await expect(form).toBeVisible();
  });

  test('pay button is disabled until form complete', async ({ page }) => {
    const btn = page.getByRole('button', { name: /pay/i });
    await expect(btn).toBeDisabled();
  });

  test('complete flow with success card', async ({ page }) => {
    const form = page.locator('secure-payment-form');
    await form.locator('input').nth(0).fill('4242424242424242');
    await form.locator('input').nth(1).fill('12/30');
    await form.locator('input').nth(2).fill('123');
    await form.locator('input').nth(3).fill('12345');
    const btn = page.getByRole('button', { name: /pay/i });
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(page.getByText(/success|transaction|token/i)).toBeVisible({ timeout: 5000 });
  });
});
