type GoogleAuthRole = 'clients' | 'lawyers'
type GoogleAuthMode = 'login' | 'register'

declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

const loadGoogleScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Google auth is client-only'))

    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      if ((existing as any).dataset.loaded === 'true') resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })
}

export const useGoogleAuth = () => {
  const toast = useToast()
  const runtimeConfig = useRuntimeConfig()
  const loading = ref(false)

  const getRole = (): GoogleAuthRole => {
    const raw = window.localStorage.getItem('role')
    return raw === 'lawyers' ? 'lawyers' : 'clients'
  }

  const getEndpoint = (mode: GoogleAuthMode, role: GoogleAuthRole) => {
    if (mode === 'login') return `/api/login/google?role=${role}`
    return `/api/register/google?role=${role}`
  }

  const signInWithGoogle = async (mode: GoogleAuthMode, roleOverride?: GoogleAuthRole) => {
    loading.value = true
    try {
      const clientId = runtimeConfig.public.googleClientId as string | undefined
      if (!clientId) {
        toast.add({
          title: 'Google login unavailable',
          description: 'Missing Google client ID configuration.',
          icon: 'i-lucide-alert-circle',
          color: 'error',
          duration: 4000
        })
        return { success: false }
      }

      await loadGoogleScript()

      const role = roleOverride || getRole()
      const endpoint = getEndpoint(mode, role)

      const credential: string = await new Promise((resolve, reject) => {
        try {
          window.google?.accounts?.id?.initialize({
            client_id: clientId,
            callback: (response: { credential?: string }) => {
              if (!response?.credential) {
                reject(new Error('No Google credential received'))
                return
              }
              resolve(response.credential)
            }
          })

          window.google?.accounts?.id?.prompt((notification: any) => {
            if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
              reject(new Error('Google prompt was cancelled'))
            }
          })
        } catch (e) {
          reject(e)
        }
      })

      const res: any = await $fetch(endpoint, {
        method: 'POST',
        body: { credential, role }
      })

      if (res?.status === 200) return { success: true, data: res }

      toast.add({
        title: 'Error',
        description: res?.message || 'Google sign-in failed.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 4000
      })
      return { success: false, data: res }
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.message || 'Google sign-in failed.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 4000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    signInWithGoogle
  }
}

