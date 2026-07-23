/**
 * useLogin — backward-compatible wrapper around useAuth().login().
 * All login logic lives in useAuth.
 */
export const useLogin = async (credentials: { email: string, password: string, role: string }) => {
  const { login } = useAuth()
  const result = await login(credentials)
  return useState('login', () => result)
}
