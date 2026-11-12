import { expect, test } from '@playwright/test'

test('loads the AX-1 development workspace without bypassing the approval gate', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/workspace')
  await expect(page.getByLabel('AX-1 avatar viewer')).toBeVisible()
  await expect(page.getByText(/AX-1 RIG VERIFIED/)).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('button', { name: 'Play approved animation' })).toBeDisabled()
  await expect(page.getByText(/Playback locked: no human-approved/i)).toBeVisible()
  await page.getByRole('button', { name: 'Play rig validation' }).click()
  await expect(page.getByText('Rig validation motion active — not a sign')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop rig validation' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/ax1-rig-validation-browser.png', fullPage: true })
  await page.getByRole('button', { name: 'Reset neutral pose' }).focus()
  await expect(page.getByRole('button', { name: 'Reset neutral pose' })).toBeFocused()
})

test('keeps controls readable on a narrow fallback workspace', async ({ page }) => {
  await page.goto('/workspace?webgl-fallback=1')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('status')).toContainText('3D preview unavailable')
  await expect(page.getByText('DEVELOPMENT CONTROLS', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset neutral pose' })).toBeVisible()
})

test('keeps the end-user companion separate from development controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('AX-1 front avatar')).toBeVisible()
  await expect(page.getByRole('img', { name: 'AX-1 front-facing avatar' })).toBeVisible()
  await expect(page.getByText('DEVELOPMENT CONTROLS', { exact: true })).not.toBeVisible()
})

test('enables automatic hand tests only after the real rig is ready', async ({ page }) => {
  await page.route('**/AX1.glb', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await route.continue()
  })
  await page.goto('/avatar-lab', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Close Fist' })).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('Waiting for the verified AX-1 hand rig')
  await page.getByLabel('L INDEX MCP').waitFor({ timeout: 45_000 })
  const closeFist = page.getByRole('button', { name: 'Close Fist' })
  await expect(closeFist).toBeEnabled()
  await closeFist.click()
  await expect(page.getByLabel('L INDEX MCP')).toHaveValue('70')
  await expect(page.getByLabel('R LITTLE DIP')).toHaveValue('70')
  await page.getByRole('button', { name: 'Reset Neutral Pose' }).click()
  await page.getByLabel('L INDEX MCP').fill('60')
  await expect(page.getByLabel('R INDEX MCP')).toHaveValue('0')
})

test('runs only the labelled synthetic automatic demonstration for the verified AX-1 rig', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/signing-demo')
  await expect(page.getByText('Animated boy', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Animated boy' })).toBeDisabled()
  const play = page.getByRole('button', { name: 'Play automatically' })
  await expect(play).toBeEnabled({ timeout: 45_000 })
  await play.click()
  await expect(page.getByText(/Synthetic bimanual engineering demo is playing|Demo complete. AX-1 returned to idle./)).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('SYNTHETIC_TEST', { exact: true })).toBeVisible()
})
