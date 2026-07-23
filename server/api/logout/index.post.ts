/**
 * POST /api/logout
 * Clears the auth_token cookie and user session.
 * Called by useAuth().logout() composable before clearing the client session.
 */
export default defineEventHandler(async (event) => {
  // Clear the auth token cookie
  deleteCookie(event, 'auth_token', {
    path: '/'
  })

  // Clear the user session (nuxt-auth-utils)
  await clearUserSession(event)

  return {
    status: 200,
    message: 'Logged out successfully'
  }
})
