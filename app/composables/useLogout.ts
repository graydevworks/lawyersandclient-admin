/**
 * useLogout — convenience wrapper around useAuth().logout().
 * Kept for backward compatibility; all logout logic lives in useAuth.
 */
export const useLogout = async () => {
  const { logout } = useAuth()
  await logout()
}
