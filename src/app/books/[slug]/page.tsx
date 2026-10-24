import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Package, Calendar, BookOpen, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPrice, estimatedDelivery, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookCard } from '@/components/books/book-card'
import { AddToCartButton } from '@/components/books/add-to-cart-button'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug },
    include: { author: true },
  })
  if (!book) return { title: 'Book not found' }
  return {
    title: book.title,
    description: book.description.slice(0, 155),
    openGraph: { images: book.coverUrl ? [book.coverUrl] : [] },
  }
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      author: true,
      bookCategories: { include: { category: true } },
    },
  })

  if (!book) notFound()

  // Related books: same primary category, exclude this book
  const primaryCategoryId = book.bookCategories[0]?.categoryId
  const related = primaryCategoryId
    ? await prisma.book.findMany({
        where: {
          id: { not: book.id },
          bookCategories: { some: { categoryId: primaryCategoryId } },
        },
        include: { author: true },
        take: 4,
      })
    : []

  const savings =
    book.compareAtPrice && Number(book.compareAtPrice) > Number(book.price)
      ? Number(book.compareAtPrice) - Number(book.price)
      : null

  return (
    <div className="container-wide py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/catalogue" className="hover:text-foreground">Books</Link></li>
          {book.bookCategories[0] && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/catalogue?category=${book.bookCategories[0].category.slug}`}
                  className="hover:text-foreground"
                >
                  {book.bookCategories[0].category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="text-foreground truncate max-w-[200px]">{book.title}</li>
        </ol>
      </nav>

      {/* Main book section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Cover */}
        <div className="md:col-span-1 lg:col-span-2">
          <div className="relative aspect-[2/3] max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden shadow-lg bg-muted">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                fill
                sizes="(max-width: 768px) 80vw, 40vw"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center h-full gap-3 p-6"
                style={{ backgroundColor: '#2C1810' }}
              >
                <BookOpen className="h-16 w-16 opacity-20" style={{ color: '#F5F0E8' }} />
                <p className="font-serif text-center font-bold leading-tight" style={{ color: '#F5F0E8', fontSize: '1rem' }}>
                  {book.title}
                </p>
                <p className="text-xs text-center" style={{ color: '#F5F0E880' }}>
                  {book.author.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {book.bookCategories.map(({ category }) => (
              <Link key={category.id} href={`/catalogue?category=${category.slug}`}>
                <Badge variant="secondary" className="hover:bg-secondary/70 cursor-pointer">
                  {category.name}
                </Badge>
              </Link>
            ))}
            {book.bestseller && (
              <Badge className="bg-brand-warm text-white border-0">Bestseller</Badge>
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              by{' '}
              <span className="text-foreground font-medium">{book.author.name}</span>
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(Number(book.price))}</span>
            {book.compareAtPrice && Number(book.compareAtPrice) > Number(book.price) && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(Number(book.compareAtPrice))}
              </span>
            )}
            {savings && (
              <Badge variant="secondary" className="text-green-700 bg-green-50">
                Save {formatPrice(savings)}
              </Badge>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 text-sm">
            {book.stock > 0 ? (
              <span className="text-green-600 font-medium">✓ In stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </div>

          {/* Add to cart */}
          {book.stock > 0 && (
            <AddToCartButton
              bookId={book.id}
              slug={book.slug}
              title={book.title}
              author={book.author.name}
              price={Number(book.price)}
              coverUrl={book.coverUrl ?? null}
              size="lg"
              className="w-full sm:w-auto"
            />
          )}

          {/* Delivery estimate */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-brand-warm" />
              <span>
                <strong>Estimated delivery:</strong> {estimatedDelivery()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="ml-6">Free delivery on orders over £25</span>
            </div>
          </div>

          <Separator />

          {/* Book info */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-semibold">About this book</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{book.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {book.publisher && (
              <div>
                <span className="text-muted-foreground">Publisher</span>
                <p className="font-medium">{book.publisher}</p>
              </div>
            )}
            {book.publishedAt && (
              <div>
                <span className="text-muted-foreground">Published</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(book.publishedAt)}
                </p>
              </div>
            )}
            {book.pages && (
              <div>
                <span className="text-muted-foreground">Pages</span>
                <p className="font-medium flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {book.pages}
                </p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Language</span>
              <p className="font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {book.language}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related books */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {related.map((r) => (
              <BookCard
                key={r.id}
                id={r.id}
                slug={r.slug}
                title={r.title}
                author={r.author.name}
                price={Number(r.price)}
                compareAtPrice={r.compareAtPrice ? Number(r.compareAtPrice) : null}
                coverUrl={r.coverUrl}
                bestseller={r.bestseller}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
