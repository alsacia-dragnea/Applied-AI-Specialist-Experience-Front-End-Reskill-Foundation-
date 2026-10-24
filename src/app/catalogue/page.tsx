import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { bookFilterSchema } from '@/lib/validations'
import { BookCard, BookCardSkeleton } from '@/components/books/book-card'
import { CatalogueFilters } from '@/components/catalogue/catalogue-filters'
import { PaginationControls } from '@/components/catalogue/pagination-controls'

export const metadata: Metadata = {
  title: 'Books',
  description: 'Browse our full catalogue of books.',
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getBooks(params: ReturnType<typeof bookFilterSchema.parse>) {
  const { search, categorySlug, authorId, minPrice, maxPrice, sort, page, limit } = params

  const where: Prisma.BookWhereInput = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { name: { contains: search, mode: 'insensitive' } } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categorySlug) {
    if (categorySlug === 'bestsellers') {
      where.bestseller = true
    } else {
      where.bookCategories = {
        some: { category: { slug: categorySlug } },
      }
    }
  }

  if (authorId) where.authorId = authorId
  if (minPrice !== undefined) where.price = { ...((where.price as object) || {}), gte: minPrice }
  if (maxPrice !== undefined) where.price = { ...((where.price as object) || {}), lte: maxPrice }

  const orderBy: Prisma.BookOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'price_asc': return { price: 'asc' as const }
      case 'price_desc': return { price: 'desc' as const }
      case 'newest': return { createdAt: 'desc' as const }
      case 'title_asc': return { title: 'asc' as const }
      case 'bestseller': return { bestseller: 'desc' as const }
      default: return { createdAt: 'desc' as const }
    }
  })()

  const skip = (page - 1) * limit

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { author: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ])

  return { books, total, pages: Math.ceil(total / limit) }
}

export default async function CataloguePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = bookFilterSchema.parse({
    search: sp.search,
    categorySlug: sp.category,
    authorId: sp.author,
    minPrice: sp.minPrice,
    maxPrice: sp.maxPrice,
    sort: sp.sort,
    page: sp.page,
    limit: sp.limit,
  })

  const [{ books, total, pages }, categories] = await Promise.all([
    getBooks(params),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const heading = params.categorySlug
    ? params.categorySlug === 'bestsellers'
      ? 'Bestsellers'
      : categories.find((c) => c.slug === params.categorySlug)?.name ?? 'Books'
    : params.search
    ? `Results for "${params.search}"`
    : 'All Books'

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 lg:w-64 shrink-0">
          <CatalogueFilters
            categories={categories}
            currentCategory={params.categorySlug}
            currentSort={params.sort}
            minPrice={params.minPrice}
            maxPrice={params.maxPrice}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">{heading}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {total} {total === 1 ? 'book' : 'books'}
              </p>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No books found.</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    slug={book.slug}
                    title={book.title}
                    author={book.author.name}
                    price={Number(book.price)}
                    compareAtPrice={book.compareAtPrice ? Number(book.compareAtPrice) : null}
                    coverUrl={book.coverUrl}
                    bestseller={book.bestseller}
                  />
                ))}
              </div>
            </Suspense>
          )}

          {pages > 1 && (
            <div className="mt-10">
              <PaginationControls
                currentPage={params.page}
                totalPages={pages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
