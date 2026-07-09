import { z } from 'zod'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const { role } = body

  const { appEnv, public: { apiBase } } = useRuntimeConfig(event)

  if (role === 'lawyers' || role === 'clients' || role === 'admin') {
    const endpoint = role === 'admin' ? 'admin/auth/login' : `${role}/auth/login`
    console.log(`${apiBase}/${endpoint}`)

    try {
      const response: {
        access_token: string
        refresh_token: string
        client?: Record<string, unknown>
        lawyer?: Record<string, unknown>
        admin?: Record<string, unknown>
        message?: string
      } = await $fetch(`${apiBase}/${endpoint}`, {
        method: 'POST',
        body: {
          email: body.email,
          password: body.password
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Nuxt-Nitro-Server; Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Connection': 'keep-alive',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      })

      console.log('Login response:', response)

      const responseRecord = response as Record<string, unknown>
      const requires2fa = Boolean(
        responseRecord.requires_2fa
        || responseRecord.two_factor_required
        || responseRecord.requires_otp
      )

      if (requires2fa) {
        return {
          status: 200,
          message: response.message || 'Two-factor authentication required',
          data: response,
          requires_2fa: true
        }
      }

      // Set the user session with the response data
      const userData = response.user || response.lawyer || response.client || response.admin || null
      await setUserSession(event, {
        user: {
          email: body.email,
          role: role,
          data: userData
        }
      })

      setCookie(event, 'auth_token', response.access_token, {
        httpOnly: true,
        // Automatically false on localhost (http), true in production (https)
        secure: appEnv === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })

      return {
        status: 200,
        message: response.message || 'Logged in successfully',
        data: response
      }
    } catch (error) {
      throwApiError(error, 'Invalid email or password. Please check your credentials and try again.')
    }
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role specified. Please try again with the correct role.',
      data: { message: 'Invalid role specified. Please try again with the correct role.' }
    })
  }
})
