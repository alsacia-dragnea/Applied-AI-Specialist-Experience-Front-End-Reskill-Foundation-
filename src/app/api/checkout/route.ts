import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const checkoutBodySchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(['DEMO_CARD', 'GIFT_POINTS']),
  cardLast4: z.string().optional(),
  giftPointsToRedeem: z.number().int().min(0).default(0),
  items: z.array(
    z.object({
      bookId: z.string(),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const { addressId, paymentMethod, cardLast4, giftPointsToRedeem, items } = checkoutBodySchema.parse(body)

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    })
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Fetch books server-side for authoritative pricing
    const bookIds = items.map((i) => i.bookId)
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
    })

    if (books.length !== bookIds.length) {
      return NextResponse.json({ error: 'One or more books not found' }, { status: 404 })
    }

    // Check stock
    for (const item of items) {
      const book = books.find((b) => b.id === item.bookId)!
      if (book.stock < item.quantity) {
        return NextResponse.json({ error: `"${book.title}" has insufficient stock` }, { status: 409 })
      }
    }

    // Calculate subtotal using server-side prices
    const subtotal = items.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.bookId)!
      return sum + Number(book.price) * item.quantity
    }, 0)

    const shippingCost = subtotal >= 25 ? 0 : 3.99

    // Validate gift points
    let giftDiscount = 0
    if (giftPointsToRedeem > 0) {
      const pointsTransactions = await prisma.giftPointsTransaction.findMany({
        where: { userId: session.user.id },
      })
      const balance = pointsTransactions.reduce((sum, t) => {
        if (t.type === 'EARNED' || t.type === 'REFUNDED') return sum + t.points
        return sum - t.points
      }, 0)

      if (giftPointsToRedeem > balance) {
        return NextResponse.json({ error: 'Insufficient gift points' }, { status: 400 })
      }
      giftDiscount = giftPointsToRedeem / 100
    }

    const total = Math.max(0, subtotal + shippingCost - giftDiscount)

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          addressId,
          status: 'CONFIRMED',
          subtotal: new Prisma.Decimal(subtotal),
          shippingCost: new Prisma.Decimal(shippingCost),
          giftPointsUsed: giftPointsToRedeem,
          giftPointsDiscount: new Prisma.Decimal(giftDiscount),
          total: new Prisma.Decimal(total),
          orderItems: {
            create: items.map((item) => {
              const book = books.find((b) => b.id === item.bookId)!
              return {
                bookId: item.bookId,
                quantity: item.quantity,
                unitPrice: book.price,
                totalPrice: new Prisma.Decimal(Number(book.price) * item.quantity),
              }
            }),
          },
        },
      })

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: paymentMethod,
          status: 'COMPLETED',
          amount: new Prisma.Decimal(total),
          demoCardLast4: cardLast4 ?? '4242',
          transactionRef: `DEMO-${Date.now()}`,
        },
      })

      // Deduct stock
      for (const item of items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Award gift points (1 point per £1 spent)
      const pointsEarned = Math.floor(total)
      if (pointsEarned > 0) {
        await tx.giftPointsTransaction.create({
          data: {
            userId: userId,
            orderId: newOrder.id,
            type: 'EARNED',
            points: pointsEarned,
            description: `Points earned on order ${newOrder.reference}`,
          },
        })
      }

      // Deduct redeemed points
      if (giftPointsToRedeem > 0) {
        await tx.giftPointsTransaction.create({
          data: {
            userId: userId,
            orderId: newOrder.id,
            type: 'REDEEMED',
            points: giftPointsToRedeem,
            description: `Points redeemed on order ${newOrder.reference}`,
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({ orderId: order.id, reference: order.reference }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
