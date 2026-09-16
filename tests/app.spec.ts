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
  await expect(page.locator('.workspace .why h3')).toContainText('ヒエラルキー');
  expect(await page.getByTestId('spectrum-marker').getAttribute('style')).not.toBe(initialPosition);
  expect(await page.getByTestId('environment-arrow').getAttribute('stroke-width')).not.toBe(initialArrow);
  for (const id of ['uncertainty', 'smallNumbers', 'assetSpecificity', 'frequency', 'boundedRationality', 'opportunism']) {
    const old = await page.locator('.workspace .score-list').innerText();
    await setRange(page.locator(`#${id}`), 15);
    await expect(page.locator(`#${id}`)).toHaveValue('15');
    expect(await page.locator('.workspace .score-list').innerText()).not.toBe(old);
  }
  await page.getByRole('button', { name: '初期状態に戻す' }).click();
  await expect(page.locator('#assetSpecificity')).toHaveValue('100');
  const slider = page.locator('#assetSpecificity');
  await slider.focus();
  await page.keyboard.down('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.up('ArrowLeft');
  await expect(slider).toHaveValue('98');
  await expect(page.getByRole('heading', { name: '↔ 変更前と変更後' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'いま強く作用しているルール' })).toHaveCount(0);
  const uncertaintyHelp = page.getByRole('button', { name: '不確実性の説明', exact: true }).first();
  await uncertaintyHelp.scrollIntoViewIfNeeded();
  await uncertaintyHelp.click();
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
    const box = await page.locator('.workspace .governance').boundingBox();
    expect(box!.width).toBeGreaterThan(200);
  }
  await page.screenshot({ path: '/tmp/tce-mobile.png', fullPage: true });
});

test('extended view adds blockchain and visualizes the moderating effect', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '明示できる取引は、コードで統治できるか。' })).toBeVisible();
  await expect(page.locator('#assetSpecificity')).toHaveValue('100');
  const mtSwitch = page.getByRole('switch', { name: 'M&Tスイッチ' });
  await expect(page.locator('#ext-codifiability')).toHaveValue('100');
  await expect(page.locator('#ext-verifiability')).toHaveValue('100');
  await setRange(page.locator('#ext-codifiability'), 0);
  await expect(page.locator('#ext-codifiability')).toHaveValue('0');
  await expect(page.locator('.ext-results .why h3')).toContainText('ヒエラルキー');
  await mtSwitch.click();
  await expect(mtSwitch).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#ext-codifiability')).toHaveValue('0');
  await expect(page.locator('.ext-results .why h3')).toContainText('ブロックチェーン');
  await mtSwitch.click();
  await setRange(page.locator('#ext-assetSpecificity'), 95);
  await setRange(page.locator('#ext-opportunism'), 90);
  await setRange(page.locator('#ext-codifiability'), 0);
  await setRange(page.locator('#ext-verifiability'), 0);
  const tacitHierarchy = Number(await page.getByTestId('ext-hierarchyScore').innerText());
  const tacitBlockchain = Number(await page.getByTestId('ext-blockchainScore').innerText());
  await setRange(page.locator('#ext-codifiability'), 100);
  await setRange(page.locator('#ext-verifiability'), 100);
  expect(Number(await page.getByTestId('ext-hierarchyScore').innerText())).toBeLessThan(tacitHierarchy);
  expect(Number(await page.getByTestId('ext-blockchainScore').innerText())).toBeGreaterThan(tacitBlockchain);
  await expect(page.locator('#assetSpecificity')).toHaveValue('100');
});
