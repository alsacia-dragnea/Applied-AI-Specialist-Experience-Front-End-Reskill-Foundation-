import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactions = await prisma.giftPointsTransaction.findMany({
    where: { userId: session.user.id },
  })

  const balance = transactions.reduce((sum, t) => {
    if (t.type === 'EARNED' || t.type === 'REFUNDED') return sum + t.points
    return sum - t.points
  }, 0)

  return NextResponse.json({ balance, transactions })
}
