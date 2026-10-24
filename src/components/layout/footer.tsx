import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  Browse: [
    { href: '/catalogue', label: 'All Books' },
    { href: '/catalogue?category=fiction', label: 'Fiction' },
    { href: '/catalogue?category=non-fiction', label: 'Non-Fiction' },
    { href: '/catalogue?category=bestsellers', label: 'Bestsellers' },
  ],
  Account: [
    { href: '/auth/login', label: 'Sign In' },
    { href: '/auth/register', label: 'Create Account' },
    { href: '/account/orders', label: 'Order History' },
    { href: '/account', label: 'My Account' },
  ],
  Help: [
    { href: '#', label: 'FAQ' },
    { href: '#', label: 'Delivery & Returns' },
    { href: '#', label: 'Contact Us' },
    { href: '#', label: 'Privacy Policy' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-warm" />
              <span className="font-serif text-lg font-bold">
                Chapter <span className="text-brand-warm">&amp;</span> Co.
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              A curated online bookstore with a premium editorial aesthetic. Free delivery on orders over £25.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-primary-foreground/10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Chapter &amp; Co. All rights reserved.</p>
          <p>Built with IBM Bob · Next.js · Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
