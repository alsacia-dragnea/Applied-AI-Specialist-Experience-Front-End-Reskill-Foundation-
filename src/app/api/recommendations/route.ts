import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Recommendations algorithm:
 * 1. Find categories the user has purchased from
 * 2. Find authors they've bought from
 * 3. Return books from those categories/authors they haven't bought yet
 * 4. Fall back to featured books if no history
 */
export async function GET(_request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    // Unauthenticated: return featured books
    const books = await prisma.book.findMany({
      where: { featured: true },
      include: { author: true },
      take: 6,
    })
    return NextResponse.json({ books, reason: 'featured' })
  }

  const purchasedItems = await prisma.orderItem.findMany({
    where: { order: { userId: session.user.id, status: { not: 'CANCELLED' } } },
    include: {
      book: { include: { bookCategories: true } },
    },
  })

  const purchasedBookIds = purchasedItems.map((i) => i.bookId)
  const purchasedCategoryIds = Array.from(
    new Set(purchasedItems.flatMap((i) => i.book.bookCategories.map((bc) => bc.categoryId)))
  )
  const purchasedAuthorIds = Array.from(new Set(purchasedItems.map((i) => i.book.authorId)))

  if (purchasedBookIds.length === 0) {
    const books = await prisma.book.findMany({
      where: { featured: true },
      include: { author: true },
      take: 6,
    })
    return NextResponse.json({ books, reason: 'featured' })
  }

  const recommendations = await prisma.book.findMany({
    where: {
      id: { notIn: purchasedBookIds },
      OR: [
        { bookCategories: { some: { categoryId: { in: purchasedCategoryIds } } } },
        { authorId: { in: purchasedAuthorIds } },
      ],
    },
    include: { author: true },
    take: 6,
    orderBy: { bestseller: 'desc' },
  })

  return NextResponse.json({ books: recommendations, reason: 'personalized' })
}
