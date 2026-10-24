'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Truck, Clock, XCircle, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { toast } from '@/hooks/use-toast'

type OrderItem = {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  book: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
    author: { name: string }
  }
}

type Order = {
  id: string
  reference: string
  status: string
  subtotal: number
  shippingCost: number
  giftPointsUsed: number
  giftPointsDiscount: number
  total: number
  createdAt: string
  address: {
    fullName: string
    line1: string
    city: string
    postalCode: string
    country: string
  } | null
  orderItems: OrderItem[]
  payment: { method: string; demoCardLast4?: string } | null
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; colour: string }> = {
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle, colour: 'text-blue-600' },
  PROCESSING: { label: 'Processing', icon: Clock, colour: 'text-blue-600' },
  SHIPPED: { label: 'Shipped', icon: Truck, colour: 'text-purple-600' },
  DELIVERED: { label: 'Delivered', icon: Package, colour: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, colour: 'text-red-600' },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const isConfirmed = searchParams.get('confirmed') === 'true'
  const addItem = useCartStore((s) => s.addItem)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setOrder(data.order)
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleBuyAgain = () => {
    if (!order) return
    order.orderItems.forEach((item) => {
      addItem({
        bookId: item.book.id,
        slug: item.book.slug,
        title: item.book.title,
        author: item.book.author.name,
        price: Number(item.unitPrice),
        coverUrl: item.book.coverUrl,
      })
    })
    toast({ title: 'Added to cart', description: 'All items have been added to your cart.' })
  }

  const canCancel = (order: Order) => {
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') return false
    const hours = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
    return hours <= 48
  }

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Order cancelled', description: 'Your order has been cancelled.' })
        fetchOrder()
      } else {
        toast({ title: 'Cancellation failed', description: data.error, variant: 'destructive' })
      }
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="container-narrow py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-narrow py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold">Order not found</h1>
        <Link href="/account/orders"><Button>Back to orders</Button></Link>
      </div>
    )
  }

  const status = statusConfig[order.status] ?? { label: order.status, icon: Package, colour: 'text-foreground' }
  const StatusIcon = status.icon

  return (
    <div className="container-narrow py-10 space-y-8">
      {/* Confirmation banner */}
      {isConfirmed && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Thank you for your order. Your reference is{' '}
              <strong>#{order.reference.slice(-8).toUpperCase()}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">
            Order #{order.reference.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className={`flex items-center gap-1.5 ${status.colour}`}>
          <StatusIcon className="h-5 w-5" />
          <span className="font-medium">{status.label}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="space-y-3 md:col-span-2">
          <h2 className="font-serif text-lg font-semibold">Items</h2>
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 rounded-lg border bg-card">
              <div className="relative w-12 h-18 flex-shrink-0">
                {item.book.coverUrl ? (
                  <Image
                    src={item.book.coverUrl}
                    alt={item.book.title}
                    width={48}
                    height={72}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/books/${item.book.slug}`}>
                  <p className="text-sm font-semibold line-clamp-1 hover:text-primary/80">{item.book.title}</p>
                </Link>
                <p className="text-xs text-muted-foreground">{item.book.author.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(Number(item.totalPrice))}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-semibold">Payment Summary</h2>
          <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{Number(order.shippingCost) === 0 ? 'Free' : formatPrice(Number(order.shippingCost))}</span>
            </div>
            {Number(order.giftPointsDiscount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Gift points ({order.giftPointsUsed} pts)</span>
                <span>-{formatPrice(Number(order.giftPointsDiscount))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
            {order.payment && (
              <p className="text-xs text-muted-foreground pt-1">
                Paid via {order.payment.method === 'DEMO_CARD'
                  ? `Demo card ending ${order.payment.demoCardLast4 ?? '****'}`
                  : 'Gift points'}
              </p>
            )}
          </div>
        </div>

        {/* Delivery */}
        {order.address && (
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold">Delivery Address</h2>
            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground space-y-0.5">
              <p className="text-foreground font-medium">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              <p>{order.address.city}, {order.address.postalCode}</p>
              <p>{order.address.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" onClick={handleBuyAgain} className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Buy again
        </Button>

        {canCancel(order) && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </Button>
        )}

        {!canCancel(order) && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Cancellation window has passed (48 hrs)
          </div>
        )}

        <Link href="/account/orders">
          <Button variant="ghost">← All orders</Button>
        </Link>
      </div>
    </div>
  )
}
