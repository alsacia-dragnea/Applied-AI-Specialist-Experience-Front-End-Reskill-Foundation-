import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/books/add-to-cart-button'

// Deterministic pastel palette for cover placeholders — cycles by title
const COVER_PALETTES = [
  { bg: '#2C1810', text: '#F5F0E8' },
  { bg: '#1a3a4a', text: '#e8f4f0' },
  { bg: '#2d3a1e', text: '#eef5e8' },
  { bg: '#3a1e2d', text: '#f5e8f0' },
  { bg: '#1e2d3a', text: '#e8f0f5' },
  { bg: '#3a2d1e', text: '#f5f0e8' },
  { bg: '#1e3a2d', text: '#e8f5f0' },
  { bg: '#2d1e3a', text: '#f0e8f5' },
]

function getPalette(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return COVER_PALETTES[Math.abs(hash) % COVER_PALETTES.length]
}

function PlaceholderCover({ title, author }: { title: string; author: string }) {
  const { bg, text } = getPalette(title)
  const words = title.split(' ')
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
  const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-between p-3"
      style={{ backgroundColor: bg }}
      aria-label={`Cover of ${title}`}
    >
      <div className="w-full h-px mt-2" style={{ backgroundColor: `${text}40` }} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-1 gap-1">
        <p
          className="font-serif font-bold leading-tight"
          style={{ color: text, fontSize: 'clamp(9px, 2.2vw, 13px)', wordBreak: 'break-word' }}
        >
          {line1}
        </p>
        {line2 && (
          <p
            className="font-serif font-bold leading-tight"
            style={{ color: text, fontSize: 'clamp(9px, 2.2vw, 13px)', wordBreak: 'break-word' }}
          >
            {line2}
          </p>
        )}
      </div>
      <div className="w-full flex flex-col items-center gap-1 pb-1">
        <div className="w-full h-px" style={{ backgroundColor: `${text}40` }} />
        <p
          className="font-sans leading-tight text-center"
          style={{ color: `${text}b0`, fontSize: 'clamp(7px, 1.6vw, 10px)' }}
        >
          {author}
        </p>
      </div>
    </div>
  )
}

type BookCardProps = {
  id: string
  slug: string
  title: string
  author: string
  price: number
  compareAtPrice?: number | null
  coverUrl?: string | null
  bestseller?: boolean
  featured?: boolean
}

export function BookCard({
  id,
  slug,
  title,
  author,
  price,
  compareAtPrice,
  coverUrl,
  bestseller,
}: BookCardProps) {
  return (
    <Card className="group overflow-hidden book-card-hover border-border/50">
      <Link href={`/books/${slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Cover of ${title}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
              <PlaceholderCover title={title} author={author} />
            </div>
          )}
          {bestseller && (
            <Badge className="absolute top-2 left-2 bg-brand-warm text-white border-0 text-xs">
              Bestseller
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <div>
          <Link href={`/books/${slug}`}>
            <h3 className="font-serif font-semibold text-sm leading-tight line-clamp-2 hover:text-primary/80 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 truncate">{author}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
          <AddToCartButton
            bookId={id}
            slug={slug}
            title={title}
            author={author}
            price={price}
            coverUrl={coverUrl ?? null}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[2/3] bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}
