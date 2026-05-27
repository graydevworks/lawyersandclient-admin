import { z } from 'zod'

const bodySchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(8),
  gender: z.enum(['male', 'female']),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
  barNumber: z.string().min(1).optional(),
  yearsOfExperience: z.string().min(1).optional(),
  role: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const { role } = body

  console.log(body)

  const { public: { apiBase } } = useRuntimeConfig(event)

  if (role === 'lawyers' || role === 'clients') {
    try {
      const response = await $fetch(`${apiBase}/${role}/auth/register`, {
        method: 'POST',
        body: {
          first_name: body.firstName,
          last_name: body.lastName,
          email: body.email,
          phone: body.phone,
          gender: body.gender,
          password: body.password,
          bar_number: body.barNumber ? body.barNumber : undefined,
          years_of_experience: body.yearsOfExperience ? body.yearsOfExperience : undefined,
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

      console.log('Register response:', response)

      return {
        status: 200,
        message: response?.message || 'Registered successfully',
        data: response
      }
    } catch (error) {
      console.error('Register error:', error)

      let statusCode = 401
      let message = 'Registration failed'
      let data: any = {}

      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>
        statusCode = (err.statusCode as number) || (err.status as number) || 401
        data = err.data as Record<string, unknown> | undefined
        message = (data?.message as string) || (err.data && Object.keys(err.data).length ? Object.values(err.data)[0][0] as string : 'Registration failed, Please check your input and try again')
      }

      return {
        status: statusCode,
        message: message,
        errMsg: data
      }
    }
  } else {
    return {
      status: 400,
      message: 'Invalid role specified'
    }
  }
})
