import { expect, test } from '@playwright/test'

test('loads the validated AX-1 GLB viewer and channel state', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await expect(page.getByLabel('AX-1 avatar viewer')).toBeVisible()
  await expect(page.getByText(/AX-1 RIG VERIFIED/)).toBeVisible({ timeout: 45_000 })
  await page.getByRole('button', { name: /simulate reviewed-sign/i }).click()
  await expect(page.getByText('SIGNING LOCK')).toBeVisible()
})
