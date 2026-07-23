function isAuthenticated(): boolean {
  const { loggedIn } = useUserSession()
  return loggedIn.value
}
// ---cut---
export default defineNuxtRouteMiddleware((to, _from) => {
  // isAuthenticated() is an example method verifying if a user is authenticated

  const { user }: { user: any } = useUserSession()

  const role = user && user.value ? user.value.role : 'auth'

  if (to.meta.role == 'auth') {
    if (isAuthenticated()) {
      return role && role == 'admin' ? navigateTo('/dashboard') : navigateTo('/login')
    }
  } else {
    if (!isAuthenticated()) {
      return navigateTo('/login')
    }
  }
})
