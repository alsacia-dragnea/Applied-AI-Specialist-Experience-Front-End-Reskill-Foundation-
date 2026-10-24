import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const addressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().length(2),
  isDefault: z.boolean().optional(),
})

export const checkoutSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.enum(['DEMO_CARD', 'GIFT_POINTS']),
  cardLast4: z.string().length(4).optional(),
  giftPointsToRedeem: z.number().int().min(0).optional(),
})

export const cartItemSchema = z.object({
  bookId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
})

export const bookFilterSchema = z.object({
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  authorId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'title_asc', 'bestseller'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type BookFilterInput = z.infer<typeof bookFilterSchema>
