import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: { currency?: string; locale?: string } = {}
) {
  const { currency = 'GBP', locale = 'en-GB' } = options
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(typeof price === 'string' ? parseFloat(price) : price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function estimatedDelivery(daysMin = 3, daysMax = 5): string {
  const now = new Date()
  const minDate = new Date(now)
  const maxDate = new Date(now)
  minDate.setDate(now.getDate() + daysMin)
  maxDate.setDate(now.getDate() + daysMax)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(minDate)} – ${fmt(maxDate)}`
}

/** Cents to whole gift points (100 pence = 1 point) */
export function priceToGiftPoints(price: number): number {
  return Math.floor(price)
}

/** Gift points to discount amount (100 points = £1) */
export function giftPointsToDiscount(points: number): number {
  return points / 100
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}
