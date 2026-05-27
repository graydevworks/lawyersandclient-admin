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

  if (role === 'lawyers' || role === 'clients') {
    try {
      const response: {
        access_token: string
        refresh_token: string
        client?: object | any
        lawyer?: object | any
        message?: string
      } = await $fetch(`${apiBase}/${role}/auth/login`, {
        method: 'POST',
        body: {
          email: body.email,
          password: body.password
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

      console.log('Login response:', response)

      // Set the user session with the response data
      await setUserSession(event, {
        user: {
          email: body.email,
          role: role,
          data: response && response.lawyer ? response.lawyer : response && response.client ? response.client : null
        }
      })

      setCookie(event, 'auth_token', response.access_token, {
        httpOnly: true,
        // Automatically false on localhost (http), true in production (https)
        secure: appEnv === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })

      return {
        status: 200,
        message: response.message || 'Logged in successfully',
        data: response
      }
    } catch (error) {
      let statusCode = 401
      let message = 'Invalid credentials'

      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>
        statusCode = (err.statusCode as number) || (err.status as number) || 401
        const data = err.data as Record<string, unknown> | undefined
        message = (data?.message as string) || 'Invalid credentials'
      }

      return {
        status: statusCode,
        message: message
      }
    }
  } else {
    return {
      status: 400,
      message: 'Invalid role specified'
    }
  }
})
