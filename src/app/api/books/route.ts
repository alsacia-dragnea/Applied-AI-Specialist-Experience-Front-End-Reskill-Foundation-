import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { bookFilterSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params = bookFilterSchema.parse({
    search: searchParams.get('search') ?? undefined,
    categorySlug: searchParams.get('category') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const where: Prisma.BookWhereInput = {}

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { author: { name: { contains: params.search, mode: 'insensitive' } } },
    ]
  }

  if (params.categorySlug === 'bestsellers') {
    where.bestseller = true
  } else if (params.categorySlug) {
    where.bookCategories = { some: { category: { slug: params.categorySlug } } }
  }

  const orderBy: Prisma.BookOrderByWithRelationInput = (() => {
    switch (params.sort) {
      case 'price_asc': return { price: 'asc' as const }
      case 'price_desc': return { price: 'desc' as const }
      case 'newest': return { createdAt: 'desc' as const }
      case 'title_asc': return { title: 'asc' as const }
      default: return { createdAt: 'desc' as const }
    }
  })()

  const skip = (params.page - 1) * params.limit

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { author: true, bookCategories: { include: { category: true } } },
      orderBy,
      skip,
      take: params.limit,
    }),
    prisma.book.count({ where }),
  ])

  return NextResponse.json({
    books,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.ceil(total / params.limit),
    },
  })
}
