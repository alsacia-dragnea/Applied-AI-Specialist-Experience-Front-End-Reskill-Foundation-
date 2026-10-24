import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cart'

// Reset Zustand store between tests
beforeEach(() => {
  useCartStore.setState({ items: [] })
})

const mockBook = {
  bookId: 'book-1',
  slug: 'test-book',
  title: 'Test Book',
  author: 'Test Author',
  price: 12.99,
  coverUrl: null,
}

describe('Cart store', () => {
  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].bookId).toBe('book-1')
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('increments quantity if item already in cart', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.addItem(mockBook) })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('caps quantity at 10', () => {
    const { result } = renderHook(() => useCartStore())
    for (let i = 0; i < 15; i++) {
      act(() => { result.current.addItem(mockBook) })
    }
    expect(result.current.items[0].quantity).toBe(10)
  })

  it('removes an item from the cart', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.removeItem('book-1') })
    expect(result.current.items).toHaveLength(0)
  })

  it('updates quantity correctly', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.updateQuantity('book-1', 5) })
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.updateQuantity('book-1', 0) })
    expect(result.current.items).toHaveLength(0)
  })

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.updateQuantity('book-1', 3) })
    expect(result.current.subtotal()).toBeCloseTo(38.97)
  })

  it('returns correct total items count', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => {
      result.current.addItem({ ...mockBook, bookId: 'book-2', title: 'Book 2' })
    })
    act(() => { result.current.updateQuantity('book-1', 3) })
    expect(result.current.totalItems()).toBe(4)
  })

  it('clears the cart', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => { result.current.addItem(mockBook) })
    act(() => { result.current.clearCart() })
    expect(result.current.items).toHaveLength(0)
  })
})
