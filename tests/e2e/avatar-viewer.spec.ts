import { expect, test } from '@playwright/test'

test('loads the AX-1 development workspace without bypassing the approval gate', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await expect(page.getByLabel('AX-1 avatar viewer')).toBeVisible()
  await expect(page.getByText(/AX-1 RIG VERIFIED/)).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('button', { name: 'Play approved animation' })).toBeDisabled()
  await expect(page.getByText(/Playback locked: no human-approved/i)).toBeVisible()
  await page.getByRole('button', { name: 'Reset neutral pose' }).focus()
  await expect(page.getByRole('button', { name: 'Reset neutral pose' })).toBeFocused()
})

test('keeps controls readable on a narrow fallback workspace', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?webgl-fallback=1')
  await expect(page.getByRole('status')).toContainText('3D preview unavailable')
  await expect(page.getByText('DEVELOPMENT CONTROLS', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset neutral pose' })).toBeVisible()
})
