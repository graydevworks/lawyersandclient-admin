const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
])

export type VerificationDocType = 'bar-certificate' | 'govt-id'

export const VERIFICATION_FILE_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/gif'

export function validateVerificationFile(file: File): string | null {
  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/.test(name)

  if (!isPdf && !isImage) {
    return 'Only PDF or image files are allowed.'
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type) && !isPdf && !isImage) {
    return 'Only PDF or image files are allowed.'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File must be 5MB or less.'
  }

  return null
}

export const useVerificationDocument = () => {
  const toast = useToast()
  const { user } = useUserSession()

  const getUserSlug = () => {
    const first = user.value?.data?.first_name?.trim()
    if (first) {
      return first.toLowerCase().replace(/\s+/g, '-')
    }
    const email = user.value?.email?.split('@')[0]
    return email?.toLowerCase().replace(/\s+/g, '-') || 'user'
  }

  const getCookieName = (docType: VerificationDocType) => {
    return `${getUserSlug()}-${docType}`
  }

  const isSubmitted = (docType: VerificationDocType) => {
    const cookie = useCookie(getCookieName(docType))
    return cookie.value === 'submitted'
  }

  const markSubmitted = (docType: VerificationDocType) => {
    const cookie = useCookie(getCookieName(docType), {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    })
    cookie.value = 'submitted'
  }

  const validateFile = (file: File): boolean => {
    const error = validateVerificationFile(file)
    if (error) {
      toast.add({
        title: 'Invalid file',
        description: error,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 4000
      })
      return false
    }
    return true
  }

  return {
    getUserSlug,
    getCookieName,
    isSubmitted,
    markSubmitted,
    validateFile,
    maxFileSizeLabel: '5MB'
  }
}
