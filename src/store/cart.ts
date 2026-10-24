'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  bookId: string
  title: string
  author: string
  coverUrl: string | null
  price: number
  quantity: number
  slug: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.bookId === item.bookId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.bookId === item.bookId
                  ? { ...i, quantity: Math.min(i.quantity + 1, 10) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (bookId) => {
        set((state) => ({
          items: state.items.filter((i) => i.bookId !== bookId),
        }))
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity < 1) {
          get().removeItem(bookId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.bookId === bookId ? { ...i, quantity: Math.min(quantity, 10) } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'chapter-co-cart',
    }
  )
)
