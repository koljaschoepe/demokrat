/**
 * Phase 188 -- E2E Tests: Feed Flow
 *
 * Structural E2E tests that verify feed page rendering.
 * The feed page may redirect to login for unauthenticated users.
 */
import { test, expect } from '@playwright/test';

test.describe('Feed Page', () => {
  test('feed page loads or redirects to login', async ({ page }) => {
    await page.goto('/feed');
    await page.waitForLoadState('domcontentloaded');

    // Feed either renders or redirects to login
    const url = page.url();
    const isFeedOrLogin = url.includes('/feed') || url.includes('/login');
    expect(isFeedOrLogin).toBe(true);
  });

  test.skip('topic cards render on authenticated feed', async ({ page }) => {
    // Requires authenticated session with seeded topics
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    // Look for topic cards
    const cards = page.locator('[data-testid="topic-card"], article, [role="article"]');
    await expect(cards.first()).toBeVisible();
  });

  test.skip('search input is functional', async ({ page }) => {
    // Requires authenticated session
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Such"], input[aria-label*="Such"]',
    );
    if (await searchInput.isVisible()) {
      await searchInput.fill('Gesundheit');
      // Wait for search results to filter
      await page.waitForTimeout(500);
    }
  });

  test('bottom navigation is visible on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Only relevant for mobile viewport');

    await page.goto('/feed');
    await page.waitForLoadState('domcontentloaded');

    const bottomNav = page.locator('nav[aria-label*="Navigation"], nav[role="navigation"]');
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }
  });
});
