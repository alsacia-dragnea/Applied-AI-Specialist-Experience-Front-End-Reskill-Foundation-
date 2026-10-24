'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Search, BookOpen, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/catalogue', label: 'Books' },
  { href: '/catalogue?category=fiction', label: 'Fiction' },
  { href: '/catalogue?category=non-fiction', label: 'Non-Fiction' },
  { href: '/catalogue?category=bestsellers', label: 'Bestsellers' },
]

export function Header() {
  const { data: session } = useSession()
  const totalItems = useCartStore((s) => s.totalItems())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-shadow',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-brand-warm group-hover:text-primary transition-colors" />
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              Chapter <span className="text-brand-warm">&amp;</span> Co.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label={`Cart, ${totalItems} items`}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-warm text-white text-xs flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/account">
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Join free</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border" />
          {session ? (
            <>
              <Link href="/account" onClick={() => setMobileOpen(false)} className="block text-sm py-2">
                My Account
              </Link>
              <button
                className="text-sm text-muted-foreground py-2"
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                <Button size="sm">Join free</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
