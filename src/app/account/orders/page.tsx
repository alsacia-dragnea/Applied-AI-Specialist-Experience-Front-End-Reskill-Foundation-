import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

const statusColours: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      orderItems: { include: { book: { include: { author: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container-narrow py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-primary">Order History</h1>
        <Link href="/account">
          <Button variant="ghost" size="sm">← Account</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Link href="/catalogue"><Button>Browse Books</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-5 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm">Order #{order.reference.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.orderItems.reduce((s, i) => s + i.quantity, 0)} items
                </p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-semibold">{formatPrice(Number(order.total))}</p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColours[order.status] ?? ''}`}>
                  {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
