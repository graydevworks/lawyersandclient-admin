export default defineEventHandler(async (event) => {
  // Clear the user session
  await clearUserSession(event)

  return {
    status: 200,
    message: 'Logged out successfully'
  }
})
