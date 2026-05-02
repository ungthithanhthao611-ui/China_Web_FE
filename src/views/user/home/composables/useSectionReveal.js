import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useSectionReveal(options = {}) {
  const rootRef = ref(null)
  const isVisible = ref(false)

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -10% 0px',
  } = options

  let observer = null

  onMounted(() => {
    if (!rootRef.value || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        isVisible.value = Boolean(entry?.isIntersecting)
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(rootRef.value)
  })

  onBeforeUnmount(() => {
    if (observer && rootRef.value) {
      observer.unobserve(rootRef.value)
    }
    observer?.disconnect()
    observer = null
  })

  return {
    rootRef,
    isVisible,
  }
}
