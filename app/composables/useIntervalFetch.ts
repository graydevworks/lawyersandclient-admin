import { ref, onUnmounted } from 'vue'

/**
 * Reusable composable for periodic background data fetching.
 * - Runs `fetchFn` immediately on call
 * - Then re-runs every `intervalMs` milliseconds (silent, no UI disruption)
 * - Auto-cleans up the interval when the component unmounts
 */
export const useIntervalFetch = (fetchFn: () => Promise<void>, intervalMs: number = 30000) => {
  const isRefreshing = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    stop() // clear any existing timer first
    timer = setInterval(async () => {
      if (isRefreshing.value) return // skip if already in progress
      isRefreshing.value = true
      try {
        await fetchFn()
      } catch {
        // silent — background refresh should not show errors
      } finally {
        isRefreshing.value = false
      }
    }, intervalMs)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isRefreshing,
    start,
    stop
  }
}
