import { z } from 'zod'

export const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one symbol'),
  password_confirmation: z.string().min(1, 'Password confirmation is required'),
  role: z.enum(['operations_admin', 'support_admin'], {
    errorMap: () => ({ message: 'Role must be operations_admin or support_admin' })
  })
}).refine(data => data.password === data.password_confirmation, {
  message: 'Passwords must match',
  path: ['password_confirmation']
})

export const adminUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),

  // On update, password is optional.
  // If provided, it must satisfy the password rules and match confirmation.
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one symbol')
    .optional()
    .or(z.literal('')),

  password_confirmation: z.string().optional().or(z.literal('')),

  role: z.enum(['operations_admin', 'support_admin'], {
    errorMap: () => ({ message: 'Role must be operations_admin or support_admin' })
  })
}).superRefine((data, ctx) => {
  const hasPassword = typeof data.password === 'string' && data.password.length > 0
  const hasConfirmation = typeof data.password_confirmation === 'string' && data.password_confirmation.length > 0

  if (hasPassword || hasConfirmation) {
    if (!hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Password is required when updating.'
      })
    }

    if (!hasConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password_confirmation'],
        message: 'Password confirmation is required when updating.'
      })
    }

    if (hasPassword && hasConfirmation && data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password_confirmation'],
        message: 'Passwords must match'
      })
    }
  }
})

export type AdminFormData = z.infer<typeof adminSchema>
