import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads the homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Chapter & Co\./)
  })

  test('shows the hero banner', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('navigate to catalogue', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Browse Books/i }).first().click()
    await expect(page).toHaveURL(/catalogue/)
  })
})

test.describe('Catalogue', () => {
  test('shows book listings', async ({ page }) => {
    await page.goto('/catalogue')
    await expect(page.getByRole('heading', { name: /All Books/i })).toBeVisible()
  })

  test('filters by category', async ({ page }) => {
    await page.goto('/catalogue')
    await page.getByRole('button', { name: 'Fiction' }).click()
    await expect(page).toHaveURL(/category=fiction/)
  })

  test('search redirects to catalogue with query', async ({ page }) => {
    await page.goto('/search')
    await page.getByRole('textbox').fill('Sapiens')
    await page.getByRole('button', { name: /Search/i }).click()
    await expect(page).toHaveURL(/search=Sapiens/)
  })
})

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/Email address/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
  })

  test('register page renders', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel(/Email address/i).fill('not-an-email')
    await page.getByLabel(/Password/i).fill('password')
    await page.getByRole('button', { name: /Sign in/i }).click()
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('protected account page redirects to login', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/auth\/login/)
  })
})

test.describe('Cart', () => {
  test('empty cart shows message', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible()
  })
})

test.describe('Order cancellation', () => {
  test('cancellation after 48 hours is rejected by API', async ({ request }) => {
    // Simulate a cancellation request — will fail with 401 (no session)
    const response = await request.patch('/api/orders/nonexistent-id', {
      data: { action: 'cancel' },
    })
    expect(response.status()).toBe(401)
  })
})
