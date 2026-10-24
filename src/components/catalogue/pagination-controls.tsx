'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  currentPage: number
  totalPages: number
}

export function PaginationControls({ currentPage, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  )

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, idx) => {
        const prev = visiblePages[idx - 1]
        const showEllipsis = prev && page - prev > 1

        return (
          <span key={page} className="flex items-center">
            {showEllipsis && <span className="px-2 text-muted-foreground">…</span>}
            <Button
              variant={page === currentPage ? 'default' : 'ghost'}
              size="sm"
              onClick={() => goToPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          </span>
        )
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
