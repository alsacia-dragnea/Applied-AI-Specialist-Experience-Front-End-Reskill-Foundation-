'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type Category = { id: string; name: string; slug: string }

type Props = {
  categories: Category[]
  currentCategory?: string
  currentSort?: string
  minPrice?: number
  maxPrice?: number
}

const sortOptions = [
  { value: '', label: 'Relevance' },
  { value: 'bestseller', label: 'Bestsellers first' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'A–Z' },
]

export function CatalogueFilters({
  categories,
  currentCategory,
  currentSort,
  minPrice,
  maxPrice,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const clearAll = () => {
    startTransition(() => router.push(pathname))
  }

  const hasFilters = currentCategory || currentSort || minPrice || maxPrice

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sort by</Label>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                (currentSort ?? '') === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
              !currentCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => updateParam('category', 'bestsellers')}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
              currentCategory === 'bestsellers' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            Bestsellers
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price (£)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minPrice" className="sr-only">Min price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min"
              defaultValue={minPrice ?? ''}
              onBlur={(e) => updateParam('minPrice', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="sr-only">Max price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max"
              defaultValue={maxPrice ?? ''}
              onBlur={(e) => updateParam('maxPrice', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
