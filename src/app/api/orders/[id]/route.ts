import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      orderItems: { include: { book: { include: { author: true } } } },
      address: true,
      payment: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, userId },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
  }

  // Cancellation eligibility: within 48 hours of order creation
  const hoursSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60)
  if (hoursSinceOrder > 48) {
    return NextResponse.json(
      { error: 'Orders can only be cancelled within 48 hours of purchase.' },
      { status: 400 }
    )
  }

  const { action } = await request.json()
  if (action !== 'cancel') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Cancel the order and refund gift points if redeemed
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    })

    // Refund redeemed gift points
    if (order.giftPointsUsed > 0) {
      await tx.giftPointsTransaction.create({
        data: {
          userId: userId,
          orderId: order.id,
          type: 'REFUNDED',
          points: order.giftPointsUsed,
          description: `Refund for cancelled order ${order.reference}`,
        },
      })
    }

    // Restore stock
    const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } })
    for (const item of orderItems) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { increment: item.quantity } },
      })
    }

    return cancelled
  })

  return NextResponse.json({ order: updatedOrder })
}
