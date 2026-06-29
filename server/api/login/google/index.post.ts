import { z } from 'zod'

const bodySchema = z.object({
  credential: z.string().min(1),
  role: z.enum(['clients', 'lawyers'])
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const { role } = body

  const { appEnv, public: { apiBase } } = useRuntimeConfig(event)

  try {
    const response: {
      access_token: string
      refresh_token?: string
      client?: any
      lawyer?: any
      message?: string
    } = await $fetch(`${apiBase}/${role}/auth/login/google`, {
      method: 'POST',
      body: { credential: body.credential },
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

    await setUserSession(event, {
      user: {
        email: role === 'lawyers' ? response.lawyer?.email : response.client?.email,
        role,
        data: response?.lawyer ? response.lawyer : response?.client ? response.client : null
      }
    })

    if (response?.access_token) {
      setCookie(event, 'auth_token', response.access_token, {
        httpOnly: true,
        secure: appEnv === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    return {
      status: 200,
      message: response.message || 'Logged in successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Google login failed'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || message
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: { message }
    })
  }
})
