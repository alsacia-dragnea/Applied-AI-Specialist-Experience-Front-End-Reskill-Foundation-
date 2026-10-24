'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Props = {
  bookId: string
  slug: string
  title: string
  author: string
  price: number
  coverUrl: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function AddToCartButton({ bookId, slug, title, author, price, coverUrl, size = 'default', className }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)
  const [added, setAdded] = useState(false)

  const isInCart = items.some((i) => i.bookId === bookId)

  const handleAdd = () => {
    addItem({ bookId, slug, title, author, price, coverUrl })
    setAdded(true)
    toast({ title: 'Added to cart', description: `"${title}" is in your bag.` })
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      size={size}
      variant={isInCart ? 'secondary' : 'default'}
      onClick={handleAdd}
      aria-label={isInCart ? `${title} is in your cart` : `Add ${title} to cart`}
      className={cn('gap-1.5', className)}
    >
      {added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {size !== 'sm' && (isInCart ? 'In cart' : 'Add to cart')}
    </Button>
  )
}
