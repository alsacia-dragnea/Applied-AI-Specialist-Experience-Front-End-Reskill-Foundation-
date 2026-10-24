'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatPrice, giftPointsToDiscount } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { CreditCard, Gift, MapPin, Package } from 'lucide-react'
import { useEffect } from 'react'

type Address = {
  id: string
  fullName: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const sub = subtotal()
  const shipping = sub >= 25 ? 0 : 3.99

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_CARD' | 'GIFT_POINTS'>('DEMO_CARD')
  const [cardLast4, setCardLast4] = useState('')
  const [giftPoints, setGiftPoints] = useState(0)
  const [availablePoints, setAvailablePoints] = useState(0)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [loading, setLoading] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ fullName: '', line1: '', city: '', postalCode: '', country: 'GB' })

  useEffect(() => {
    if (!session) return
    fetch('/api/addresses')
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data.addresses ?? [])
        const def = data.addresses?.find((a: Address) => a) 
        if (def) setSelectedAddressId(def.id)
      })
    fetch('/api/gift-points')
      .then((r) => r.json())
      .then((data) => {
        setGiftPoints(data.balance ?? 0)
        setAvailablePoints(data.balance ?? 0)
      })
  }, [session])

  if (!session) {
    return (
      <div className="container-narrow py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold">Sign in to checkout</h1>
        <p className="text-muted-foreground">You need to sign in before completing your order.</p>
        <Link href="/auth/login?redirect=/checkout">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold">Your cart is empty</h1>
        <Link href="/catalogue"><Button>Browse Books</Button></Link>
      </div>
    )
  }

  const pointsDiscount = giftPointsToDiscount(pointsToRedeem)
  const total = Math.max(0, sub + shipping - pointsDiscount)

  const handleAddAddress = async () => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddress),
    })
    if (res.ok) {
      const data = await res.json()
      setAddresses((prev) => [...prev, data.address])
      setSelectedAddressId(data.address.id)
      setAddingAddress(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({ title: 'Address required', description: 'Please select a delivery address.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          cardLast4: paymentMethod === 'DEMO_CARD' ? cardLast4 || '4242' : undefined,
          giftPointsToRedeem: paymentMethod === 'GIFT_POINTS' ? pointsToRedeem : 0,
          items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Checkout failed', description: data.error ?? 'Please try again.', variant: 'destructive' })
        return
      }

      clearCart()
      router.push(`/account/orders/${data.orderId}?confirmed=true`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-wide py-10">
      <h1 className="font-serif text-3xl font-bold text-primary mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-warm" />
              Delivery Address
            </h2>

            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{addr.fullName}</p>
                    <p className="text-muted-foreground">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.postalCode}, {addr.country}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <button
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              onClick={() => setAddingAddress(!addingAddress)}
            >
              + Add new address
            </button>

            {addingAddress && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label>Full name</Label>
                    <Input
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>Address line 1</Label>
                    <Input
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>City</Label>
                    <Input
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Postcode</Label>
                    <Input
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>
                <Button size="sm" onClick={handleAddAddress}>Save address</Button>
              </div>
            )}
          </section>

          <Separator />

          {/* Payment Method */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-warm" />
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Demo Card */}
              <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'DEMO_CARD' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="DEMO_CARD"
                  checked={paymentMethod === 'DEMO_CARD'}
                  onChange={() => setPaymentMethod('DEMO_CARD')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Demo Card Payment</p>
                    <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">DEMO</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">No real card processing — for demonstration only</p>
                  {paymentMethod === 'DEMO_CARD' && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">Last 4 digits (optional)</Label>
                      <Input
                        placeholder="4242"
                        maxLength={4}
                        value={cardLast4}
                        onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                        className="h-8 w-24 text-sm"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Gift Points */}
              {availablePoints > 0 && (
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'GIFT_POINTS' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="GIFT_POINTS"
                    checked={paymentMethod === 'GIFT_POINTS'}
                    onChange={() => setPaymentMethod('GIFT_POINTS')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-brand-warm" />
                      <p className="text-sm font-medium">Gift Points</p>
                    </div>
                    <p className="text-xs text-muted-foreground">You have {availablePoints} points (worth {formatPrice(giftPointsToDiscount(availablePoints))})</p>
                    {paymentMethod === 'GIFT_POINTS' && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-xs">Points to redeem</Label>
                        <Input
                          type="number"
                          min={0}
                          max={availablePoints}
                          value={pointsToRedeem}
                          onChange={(e) => setPointsToRedeem(Math.min(Number(e.target.value), availablePoints))}
                          className="h-8 w-32 text-sm"
                        />
                        <p className="text-xs text-muted-foreground">= {formatPrice(giftPointsToDiscount(pointsToRedeem))} discount</p>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>
          </section>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
            <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-warm" />
              Order Summary
            </h2>

            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.bookId} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Gift points</span>
                  <span>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddressId}
            >
              {loading ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a demo store — no real payments are processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
