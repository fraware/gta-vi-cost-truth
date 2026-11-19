import { test, expect } from '@playwright/test';

/** All cases exercise the actual served ES modules, not mocked calculations. */
test('comparison-first homepage initializes without errors or missing results', async ({ page }) => {
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('$80');
  await expect(page.locator('.comparison-card')).toHaveCount(3);
  await expect(page.locator('#main-total')).toContainText('79.99');
  await expect(page.locator('#receipt-status-text')).toContainText('Local sales tax');
  expect(errors).toEqual([]);
});

test('French cloud purchase selects least expensive official packs', async ({ page }) => {
  await page.goto('/');
  await page.locator('#market').selectOption('FR');
  await page.locator('[data-route="cloud"]').click();
  await expect(page.locator('#main-total')).toContainText('90,98');
  await expect(page.locator('#cloud-pack-note')).toContainText('50h');
  await expect(page.locator('#receipt-status')).toHaveClass(/complete/);
  await expect(page.locator('.receipt-lines a[href^="https://www.xbox.com/"]')).toHaveCount(2);
  await page.locator('[data-hours="100"]').click();
  await expect(page.locator('#hours-output')).toContainText('100');
  await expect(page.locator('#main-total')).toContainText('101,97');
});

test('hardware quote and tax produce a complete US purchasing scenario', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-route="buy"]').click();
  await expect(page.locator('#hardware-source-hint')).toBeVisible();
  await page.locator('#reference-quote').click();
  await expect(page.locator('#hardware')).toHaveValue('499.99');
  await expect(page.locator('#receipt-status')).not.toHaveClass(/complete/);
  await page.locator('.advanced-fields summary').click();
  await page.locator('#tax').fill('7.25');
  await page.locator('#tax').press('Tab');
  await expect(page.locator('#main-total')).toContainText('622.03');
  await expect(page.locator('#receipt-status')).toHaveClass(/complete/);
});

test('Japanese prices use yen and never apply a 100x conversion', async ({ page }) => {
  await page.goto('/');
  await page.locator('#market').selectOption('JP');
  await page.locator('#platform').selectOption('xbox-series-s');
  await expect(page.locator('#main-total')).toContainText('9,800');
  await expect(page.locator('#receipt-status')).toHaveClass(/complete/);
});

test('shared URLs restore the choices without user accounts', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('#market').selectOption('GB');
  await page.locator('[data-route="cloud"]').click();
  await page.locator('[data-hours="100"]').click();
  const link=page.url();
  expect(link).toContain('?s=v1.');
  const shared=await context.newPage();
  await shared.goto(link);
  await expect(shared.locator('#market')).toHaveValue('GB');
  await expect(shared.locator('[data-route="cloud"]')).toHaveAttribute('aria-pressed','true');
  await expect(shared.locator('#hours-output')).toContainText('100');
});

test('receipt export produces a local PNG for sharing', async ({ page }) => {
  await page.goto('/');
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#export-btn').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^gta-vi-cost-truth-us\.png$/);
});

test('layout has no unintended horizontal document overflow', async ({ page },testInfo) => {
  await page.goto('/');
  const dimensions=await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport+2);
  if (testInfo.project.name === 'desktop-chromium') {
    await page.screenshot({ path:'test-results/desktop-design.png',fullPage:true });
  } else {
    await page.screenshot({ path:'test-results/mobile-design.png',fullPage:true });
  }
});
