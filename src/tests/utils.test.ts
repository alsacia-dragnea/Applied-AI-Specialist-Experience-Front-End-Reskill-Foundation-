import { describe, it, expect } from 'vitest'
import { formatPrice, estimatedDelivery, giftPointsToDiscount, truncate, slugify } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats a number as GBP', () => {
    expect(formatPrice(12.99)).toBe('£12.99')
  })
  it('formats a string price', () => {
    expect(formatPrice('24.00')).toBe('£24.00')
  })
})

describe('giftPointsToDiscount', () => {
  it('converts 100 points to £1 discount', () => {
    expect(giftPointsToDiscount(100)).toBe(1)
  })
  it('converts 0 points to £0', () => {
    expect(giftPointsToDiscount(0)).toBe(0)
  })
  it('converts 250 points to £2.50', () => {
    expect(giftPointsToDiscount(250)).toBe(2.5)
  })
})

describe('truncate', () => {
  it('returns original string if shorter than limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })
  it('truncates at the given length', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…')
  })
})

describe('slugify', () => {
  it('creates a slug from a title', () => {
    expect(slugify('One Hundred Years of Solitude')).toBe('one-hundred-years-of-solitude')
  })
  it('removes special characters', () => {
    expect(slugify("We're All Writers!")).toBe('were-all-writers')
  })
})

describe('estimatedDelivery', () => {
  it('returns a non-empty string', () => {
    const result = estimatedDelivery()
    expect(result).toBeTruthy()
    expect(result).toContain('–')
  })
})
