import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container-narrow py-32 text-center space-y-6">
      <p className="font-serif text-8xl font-bold text-primary/10">404</p>
      <h1 className="font-serif text-3xl font-bold text-primary">Page not found</h1>
      <p className="text-muted-foreground">
        Sorry, we couldn&apos;t find what you were looking for.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/catalogue">
          <Button variant="outline">Browse books</Button>
        </Link>
      </div>
    </div>
  )
}
