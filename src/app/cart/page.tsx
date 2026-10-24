'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore()
  const sub = subtotal()
  const shipping = sub >= 25 ? 0 : 3.99
  const total = sub + shipping

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center space-y-6">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold text-primary">Your cart is empty</h1>
        <p className="text-muted-foreground">Looks like you haven&apos;t added any books yet.</p>
        <Link href="/catalogue">
          <Button size="lg">Browse Books</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-wide py-10">
      <h1 className="font-serif text-3xl font-bold text-primary mb-8">
        Your Cart ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.bookId} className="flex gap-4 p-4 rounded-xl border bg-card">
              {/* Cover */}
              <Link href={`/books/${item.slug}`} className="flex-shrink-0">
                <div className="relative w-16 h-24 rounded-md overflow-hidden bg-muted">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-brand-parchment" />
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <Link href={`/books/${item.slug}`}>
                  <h3 className="font-serif font-semibold text-sm line-clamp-2 hover:text-primary/80">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground">{item.author}</p>
                <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
              </div>

              {/* Quantity & remove */}
              <div className="flex flex-col items-end justify-between gap-2">
                <button
                  onClick={() => removeItem(item.bookId)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 border rounded-md">
                  <button
                    className="p-1.5 hover:bg-muted rounded-l-md transition-colors disabled:opacity-40"
                    onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    className="p-1.5 hover:bg-muted rounded-r-md transition-colors disabled:opacity-40"
                    onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                    aria-label="Increase quantity"
                    disabled={item.quantity >= 10}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {sub < 25 && (
                <p className="text-xs text-brand-warm">
                  Add {formatPrice(25 - sub)} more for free delivery
                </p>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/catalogue" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
