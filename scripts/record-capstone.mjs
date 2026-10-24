import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3000'
const OUT = path.resolve(process.env.HOME, 'Downloads/chapter-and-co-capstone-clips')
const EMAIL = 'demo@chapterandco.com'
const PASSWORD = 'Demo1234!'

fs.mkdirSync(OUT, { recursive: true })

function pause(page, ms) {
  return page.waitForTimeout(ms)
}

async function slowScroll(page, distance, step = 280, gap = 450) {
  let travelled = 0
  while (travelled < distance) {
    const amount = Math.min(step, distance - travelled)
    await page.mouse.wheel(0, amount)
    travelled += amount
    await pause(page, gap)
  }
}

const ONLY = process.env.ONLY?.split(',').filter(Boolean)

async function record(name, run, viewport = { width: 1920, height: 1080 }) {
  if (ONLY && !ONLY.includes(name)) return
  const dir = path.join(OUT, name)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    recordVideo: { dir, size: viewport },
  })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  try {
    await run(page)
  } catch (error) {
    const shot = path.join(OUT, `${name}-error.png`)
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {})
    console.error(`FAIL ${name}:`, error.message)
    console.error(`screenshot ${shot}`)
  } finally {
    await context.close()
    await browser.close()
  }
  const webm = fs.readdirSync(dir).find((file) => file.endsWith('.webm'))
  if (webm) {
    const dest = path.join(OUT, `${name}.webm`)
    fs.renameSync(path.join(dir, webm), dest)
    fs.rmSync(dir, { recursive: true, force: true })
    console.log('saved', dest)
  }
}

await record('01-homepage', async (page) => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /Stay With You/ }).waitFor()
  await pause(page, 1200)
  await slowScroll(page, 3200)
  await pause(page, 800)
})

await record('03-catalogue', async (page) => {
  await page.goto(`${BASE}/catalogue`, { waitUntil: 'networkidle' })
  await pause(page, 1000)
  await page.getByRole('button', { name: 'Fiction', exact: true }).click()
  await pause(page, 1200)
  await page.getByRole('button', { name: 'Price: Low to High' }).click()
  await pause(page, 1200)
  await page.getByRole('button', { name: 'Bestsellers first' }).click()
  await pause(page, 1000)
  await page.goto(`${BASE}/search`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder(/One Hundred Years/).fill('sapiens')
  await pause(page, 400)
  await page.locator('form button[type="submit"]').click()
  await page.getByText('Sapiens').first().waitFor()
  await pause(page, 1500)
})

await record('04-book-detail', async (page) => {
  await page.goto(`${BASE}/books/one-hundred-years-of-solitude`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  await pause(page, 1200)
  await slowScroll(page, 900, 300, 500)
  await page.locator('main button', { hasText: 'Add to cart' }).first().click()
  await pause(page, 1800)
})

await record('05-cart', async (page) => {
  await page.goto(`${BASE}/books/one-hundred-years-of-solitude`, { waitUntil: 'networkidle' })
  await page.locator('main button', { hasText: 'Add to cart' }).first().click()
  await pause(page, 600)
  await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' })
  await pause(page, 800)
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await pause(page, 1200)
  await page.getByRole('link', { name: 'Proceed to Checkout' }).scrollIntoViewIfNeeded()
  await pause(page, 1000)
})

await record('06-checkout', async (page) => {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Email address').fill(EMAIL)
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD)
  await pause(page, 400)
  await page.locator('main button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 20000 })
  await pause(page, 800)
  await page.goto(`${BASE}/books/one-hundred-years-of-solitude`, { waitUntil: 'networkidle' })
  const add = page.locator('main button', { hasText: 'Add to cart' }).first()
  if (await add.count()) {
    await add.click()
    await pause(page, 500)
  }
  await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' })
  await pause(page, 600)
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await page.getByText('Demo Card Payment').waitFor()
  await pause(page, 800)
  await page.getByPlaceholder('4242').fill('4242')
  await pause(page, 600)
  await page.getByText(/You have \d+ points/).scrollIntoViewIfNeeded()
  await pause(page, 1200)
  await page.getByRole('button', { name: /Place order/ }).click()
  await page.getByText(/Order placed|order reference|Order #|successfully/i).first().waitFor({ timeout: 20000 })
  await pause(page, 2000)
})

await record('07-orders', async (page) => {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
  await page.getByLabel('Email address').fill(EMAIL)
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD)
  await page.locator('main button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.includes('/auth/login'))
  await page.goto(`${BASE}/account/orders`, { waitUntil: 'networkidle' })
  await pause(page, 1200)
  const orderLink = page.locator('a[href*="/account/orders/"]').first()
  await orderLink.click()
  await page.getByRole('button', { name: 'Buy again' }).waitFor()
  await pause(page, 1200)
  await page.getByRole('button', { name: 'Buy again' }).click()
  await pause(page, 1500)
})

await record(
  '10-mobile',
  async (page) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await pause(page, 800)
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await pause(page, 1200)
    await page.goto(`${BASE}/catalogue`, { waitUntil: 'networkidle' })
    await pause(page, 1200)
    await page.goto(`${BASE}/books/one-hundred-years-of-solitude`, { waitUntil: 'networkidle' })
    await pause(page, 800)
    await slowScroll(page, 700, 200, 400)
  },
  { width: 390, height: 844 }
)

console.log('done', OUT)
