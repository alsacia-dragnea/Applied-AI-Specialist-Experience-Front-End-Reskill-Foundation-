import Link from 'next/link'
import { ArrowRight, Star, Truck, Shield, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/books/book-card'
import { prisma } from '@/lib/prisma'

async function getFeaturedBooks() {
  return prisma.book.findMany({
    where: { featured: true },
    include: { author: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })
}

async function getBestsellers() {
  return prisma.book.findMany({
    where: { bestseller: true },
    include: { author: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { bookCategories: true } } },
    orderBy: { name: 'asc' },
    take: 8,
  })
}

export default async function HomePage() {
  const [featured, bestsellers, categories] = await Promise.all([
    getFeaturedBooks(),
    getBestsellers(),
    getCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative bg-brand-cream overflow-hidden">
        <div className="container-wide py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm">
              Curated just for you
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary leading-tight">
              Stories That<br />
              <span className="text-brand-warm">Stay With You</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Discover your next favourite book. Expertly curated fiction, non-fiction and everything in between — delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogue">
                <Button size="lg" className="gap-2">
                  Browse Books <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/catalogue?sort=bestseller">
                <Button size="lg" variant="outline" className="gap-2">
                  Bestsellers
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand-parchment/50 hidden lg:block" aria-hidden="true" />
      </section>

      {/* Trust Signals */}
      <section className="border-b bg-white">
        <div className="container-wide py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: Truck, label: 'Free delivery over £25' },
              { icon: Star, label: '100,000+ titles' },
              { icon: Shield, label: 'Secure checkout' },
              { icon: Gift, label: 'Gift points on every order' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 px-4 py-3">
                <Icon className="h-4 w-4 text-brand-warm flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      {featured.length > 0 && (
        <section className="section-spacing">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm mb-1">
                  Editorial picks
                </p>
                <h2 className="font-serif text-3xl font-bold text-primary">Featured Books</h2>
              </div>
              <Link href="/catalogue?featured=true" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((book) => (
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
                  featured={book.featured}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-spacing bg-brand-cream">
          <div className="container-wide">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm mb-1">
                Explore
              </p>
              <h2 className="font-serif text-3xl font-bold text-primary">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue?category=${cat.slug}`}
                  className="group flex flex-col items-center justify-center text-center rounded-xl border bg-white p-5 hover:border-brand-warm hover:shadow-md transition-all"
                >
                  <span className="font-serif text-base font-semibold text-primary group-hover:text-brand-warm transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {cat._count.bookCategories} books
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="section-spacing">
          <div className="container-wide">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm mb-1">
                  Most loved
                </p>
                <h2 className="font-serif text-3xl font-bold text-primary">Bestsellers</h2>
              </div>
              <Link href="/catalogue?sort=bestseller" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                See more <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.map((book) => (
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
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-narrow text-center space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Your next great read is waiting.
          </h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto">
            Join thousands of readers. Create a free account to save favourites, track orders and earn gift points.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" variant="warm" className="gap-2">
                Create free account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/catalogue">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Browse catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
