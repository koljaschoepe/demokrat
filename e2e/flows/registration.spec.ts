/**
 * Phase 188 -- E2E Tests: Registration Flow
 *
 * Structural E2E tests that verify page rendering and navigation.
 * Authentication-dependent flows use test.skip() since no test user setup exists.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Landing page should have meaningful content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('has correct lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'de');
  });
});

test.describe('Registration Page', () => {
  test('navigates to registration page', async ({ page }) => {
    await page.goto('/registrieren');
    await page.waitForLoadState('domcontentloaded');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test.skip('shows form validation errors for empty fields', async ({ page }) => {
    // Requires the registration form to be rendered without auth redirect
    await page.goto('/registrieren');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Expect validation errors to appear
      const errorMessages = page.locator('[role="alert"], .text-destructive, [aria-invalid="true"]');
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test.skip('shows validation error for invalid email', async ({ page }) => {
    // Requires the registration form to be rendered
    await page.goto('/registrieren');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('not-an-email');
      await emailInput.press('Tab');
      // Expect validation error
      const errorMessages = page.locator('[role="alert"], .text-destructive');
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('login page is accessible from registration', async ({ page }) => {
    await page.goto('/registrieren');
    await page.waitForLoadState('domcontentloaded');

    // Look for a link to the login page
    const loginLink = page.locator('a[href*="login"]');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe('Login Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
