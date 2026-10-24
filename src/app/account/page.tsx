import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User, Package, Gift, MapPin } from 'lucide-react'

const statusColours: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [user, orders, pointsData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { orderItems: { include: { book: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.giftPointsTransaction.findMany({ where: { userId: session.user.id } }),
  ])

  const giftBalance = pointsData.reduce((sum, t) => {
    if (t.type === 'EARNED' || t.type === 'REFUNDED') return sum + t.points
    return sum - t.points
  }, 0)

  return (
    <div className="container-narrow py-10 space-y-10">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">{user?.name}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <Package className="h-5 w-5 mx-auto text-brand-warm" />
          <p className="font-serif text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Orders</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <Gift className="h-5 w-5 mx-auto text-brand-warm" />
          <p className="font-serif text-2xl font-bold">{giftBalance}</p>
          <p className="text-xs text-muted-foreground">Gift Points</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <MapPin className="h-5 w-5 mx-auto text-brand-warm" />
          <Link href="/account/orders" className="block">
            <p className="font-serif text-2xl font-bold">→</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </Link>
        </div>
      </div>

      <Separator />

      {/* Recent Orders */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Recent Orders</h2>
          <Link href="/account/orders">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
            <Link href="/catalogue" className="block mt-3">
              <Button size="sm">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">#{order.reference.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold">{formatPrice(Number(order.total))}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColours[order.status] ?? ''}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
