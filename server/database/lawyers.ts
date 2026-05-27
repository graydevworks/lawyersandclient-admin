import type { User } from './users'

export interface Lawyer extends User {
  specialization?: string
  experience?: number
  rating?: number
  numberOfReviews?: number
}

export const lawyers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    gender: 'male',
    thumbnail: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.',
    status: 'active',
    password: 'password',
    createdAt: '2023-04-01T12:00:00.000Z',
    updatedAt: '2023-04-01T12:00:00.000Z',
    specialization: 'Criminal Law',
    experience: 10,
    rating: 4.5,
    numberOfReviews: 120
  }
] as Lawyer[]
