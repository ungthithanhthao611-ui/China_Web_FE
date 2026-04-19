import { expect, test } from '@playwright/test'

const LEGACY_ROUTE = '/project_list/1676767239059300352.html'

test.describe('Project Case legacy route', () => {
  test('renders seeded Star Hotel category and canonical detail link', async ({ page }) => {
    await page.goto(LEGACY_ROUTE)

    await expect(page.locator('.new_banner_top span').first()).toHaveText(/Star Hotel/i)
    await expect(page.locator('[data-section-id="ctn2"] .topTitle').first()).toHaveText('W HOTEL')
    await expect(page.locator('[data-section-id="ctn2"] a.almore').first()).toHaveAttribute('href', '/project/w-hotel')
  })

  test('keeps legacy hash anchor behavior for ctn2', async ({ page }) => {
    await page.goto(`${LEGACY_ROUTE}#ctn2`)

    await page.waitForFunction(() => window.location.hash === '#ctn2')
    const topDistance = await page.locator('[data-section-id="ctn2"]').first().evaluate((element) =>
      Math.abs(element.getBoundingClientRect().top)
    )

    await expect(page.locator('[data-section-id="ctn2"] .topTitle').first()).toHaveText('W HOTEL')
    expect(topDistance).toBeLessThan(240)
  })
})
