import { onMounted, ref } from 'vue'

export function useScrollReveal() {
  const revealElements = ref<HTMLElement[]>([])

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = onMounted(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          // Once revealed, we can stop observing it
          intersectionObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    return intersectionObserver
  })

  const registerElement = (el: HTMLElement | null) => {
    if (el) {
      el.classList.add('reveal-hidden')
      const obs = (window as any)._revealObserver
      if (obs) {
        obs.observe(el)
      } else {
        // Fallback if mounted hook hasn't run yet or other issues
        onMounted(() => {
          ;(window as any)._revealObserver?.observe(el)
        })
      }
    }
  }

  onMounted(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          obs.unobserve(entry.target)
        }
      })
    }, observerOptions)
    ;(window as any)._revealObserver = obs
  })

  return {
    registerElement
  }
}
