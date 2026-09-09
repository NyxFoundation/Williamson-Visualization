import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
async function setRange(locator: Locator, value: number) {
  await locator.evaluate((el, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, String(value));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('controls, explanations and contributions remain connected', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ガバナンスの3層構造' })).toBeVisible();
  await expect(page.getByText('シナリオから試す')).toHaveCount(0);
  const initialPosition = await page.getByTestId('spectrum-marker').getAttribute('style');
  const initialArrow = await page.getByTestId('environment-arrow').getAttribute('stroke-width');
  await setRange(page.locator('#uncertainty'), 70);
  await setRange(page.locator('#smallNumbers'), 80);
  await setRange(page.locator('#assetSpecificity'), 90);
  await setRange(page.locator('#frequency'), 80);
  await setRange(page.locator('#boundedRationality'), 70);
  await setRange(page.locator('#opportunism'), 85);
  await expect(page.locator('#assetSpecificity')).toHaveValue('90');
  await expect(page.locator('.why h3')).toContainText('ヒエラルキー');
  expect(await page.getByTestId('spectrum-marker').getAttribute('style')).not.toBe(initialPosition);
  expect(Number(await page.getByTestId('environment-arrow').getAttribute('stroke-width'))).toBeGreaterThan(Number(initialArrow));
  for (const id of ['uncertainty', 'smallNumbers', 'assetSpecificity', 'frequency', 'boundedRationality', 'opportunism']) {
    const old = await page.locator('.score-list').innerText();
    await setRange(page.locator(`#${id}`), 15);
    await expect(page.locator(`#${id}`)).toHaveValue('15');
    expect(await page.locator('.score-list').innerText()).not.toBe(old);
  }
  await page.getByRole('button', { name: '初期状態に戻す' }).click();
  await expect(page.locator('#assetSpecificity')).toHaveValue('65');
  const slider = page.locator('#assetSpecificity');
  await slider.focus();
  await page.keyboard.down('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('.changed-inputs')).toContainText('65');
  await expect(slider).toHaveValue('67');
  await page.getByRole('button', { name: '全ルール・計算式を見る' }).click();
  await expect(page.locator('.rule-card')).toHaveCount(8);
  await page.getByRole('button', { name: '不確実性の説明', exact: true }).first().click();
  await expect(page.getByRole('note')).toContainText('将来');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('note')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('desktop and narrow screens fit without horizontal scrolling', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: '/tmp/tce-desktop.png', fullPage: true });
  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 8).map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right })) }));
    if (overflow.scroll > width) console.log(JSON.stringify(overflow));
    expect.soft(overflow.scroll, `viewport ${width}`).toBeLessThanOrEqual(width);
    const box = await page.locator('.governance').boundingBox();
    expect(box!.width).toBeGreaterThan(200);
  }
  await page.screenshot({ path: '/tmp/tce-mobile.png', fullPage: true });
});
