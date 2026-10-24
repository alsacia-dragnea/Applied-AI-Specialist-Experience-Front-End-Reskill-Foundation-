'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    startTransition(() => {
      router.push(`/catalogue?search=${encodeURIComponent(query.trim())}`)
    })
  }

  return (
    <div className="container-narrow py-20 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-primary">Search Books</h1>
        <p className="text-muted-foreground">Search by title, author or description</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. One Hundred Years of Solitude…"
            className="pl-9"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>
    </div>
  )
}
