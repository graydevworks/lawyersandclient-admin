export interface User {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  thumbnail?: string
  bio?: string
  gender: 'male' | 'female'
  status?: string
  password: string
  createdAt?: string
  updatedAt?: string
}

export const users = [] as User[]
