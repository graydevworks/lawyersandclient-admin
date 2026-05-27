import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
  role: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  const { public: { apiBase } } = useRuntimeConfig(event)

  console.log('Reset password request:', body)

  if (body.password !== body.passwordConfirmation) {
    return {
      status: 400,
      message: 'Passwords do not match',
      errMsg: { passwordConfirmation: ['Passwords do not match'] }
    }
  }

  try {
    const response = await $fetch(`${apiBase}/${body.role}/auth/reset-password`, {
      method: 'POST',
      body: {
        email: body.email,
        otp: body.otp,
        password: body.password,
        password_confirmation: body.passwordConfirmation
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    console.log('Reset password response:', response)

    return {
      status: 200,
      message: response?.message || 'Password reset successfully',
      data: response
    }
  } catch (error) {
    console.error('Reset password error:', error)

    let statusCode = 401
    let message = 'Failed to reset password'
    let data: any = {}

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || (err.data && Object.keys(err.data).length ? Object.values(err.data)[0][0] as string : 'Failed to reset password. Please check your code and try again.')
    }

    return {
      status: statusCode,
      message: message,
      errMsg: data
    }
  }
})
