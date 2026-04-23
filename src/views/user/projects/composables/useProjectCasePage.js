import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjects } from '@/views/user/services/publicApi'
import { uiState } from '@/shared/utils/uiState'

export function useProjectCasePage() {
  const route = useRoute()
  const router = useRouter()

  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const activeSectionId = ref('hero')
  const visibleSectionIds = ref(new Set(['hero']))
  
  // Dummy refs attributes to prevent breaking existing template bindings
  const sidebarOpen = ref(false)
  const activeCategoryId = ref('all')
  const activeCategoryIndex = ref(0)
  const expandedCategoryIds = ref([])
  const sidebarCategories = ref([])
  
  const heroSwiperRef = ref(null)
  const thumbsSwiperRef = ref(null)
  const sectionRefs = new Map()

  let revealObserver = null
  let scrollFrame = 0

  function normalizeUsedProduct(item = {}) {
    if (!item) return null
    return {
      id: String(item.product?.id || item.id || ''),
      name: item.product?.name || item.name || '',
      slug: item.product?.slug || item.slug || '',
      note: item.note || '',
      href: `/products/${item.product?.slug || item.slug || ''}`,
    }
  }

  const activeSections = computed(() => {
    return projects.value.map((project, index) => {
      const pId = String(project.id)
      const leftImgs = project.leftGallery || []
      const rightImgs = project.rightGallery || []
      
      const defaultImg = project.image?.url || project.hero_image?.url || ''
      const cover = defaultImg || leftImgs[0] || rightImgs[0] || ''
      const lIs = leftImgs.length > 0 ? leftImgs : (cover ? [cover] : [])
      const rIs = rightImgs.length > 0 ? rightImgs : (cover ? [cover] : [])
      
      const pattern = index % 2 === 0 ? 'feature' : 'standard'
      
      return {
        id: pId,
        slug: project.slug || '',
        title: project.title || '',
        summary: project.summary || '',
        coverImage: cover,
        leftImages: lIs,
        rightImages: rIs,
        moreLink: `/project/${project.slug}`,
        legacyMoreLink: '',
        layoutVariant: pattern,
        projectYear: project.project_year || null,
        location: project.location || '',
        usedProducts: Array.isArray(project.usedProducts) ? project.usedProducts.map(normalizeUsedProduct).filter(Boolean) : [],
        pattern
      }
    })
  })

  const heroSlides = computed(() => {
    if (!activeSections.value.length) return []
    return activeSections.value.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.location || 'Dự án',
      description: p.summary,
      images: [p.coverImage, p.coverImage].filter(Boolean)
    }))
  })

  function setSectionRef(sectionId, element) {
    if (element) {
      sectionRefs.set(sectionId, element)
      return
    }
    sectionRefs.delete(sectionId)
  }

  function revealSection(sectionId) {
    if (visibleSectionIds.value.has(sectionId)) return
    visibleSectionIds.value = new Set([...visibleSectionIds.value, sectionId])
  }

  function registerHeroSwiper(instance) {
    heroSwiperRef.value = instance
  }

  function registerThumbsSwiper(instance) {
    thumbsSwiperRef.value = instance
  }

  async function loadProjectData() {
    loading.value = true
    error.value = null
    try {
      const res = await getProjects({ limit: 100 })
      projects.value = res.items || []
    } catch (err) {
      error.value = err.message || 'Lỗi tải dự án'
    } finally {
      loading.value = false
    }
  }

  function scrollToSection(sectionId, behavior = 'smooth') {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior })
      return true
    }
    const target = sectionRefs.get(sectionId)
    if (!target?.isConnected) return false
    const top = window.scrollY + target.getBoundingClientRect().top
    window.scrollTo({ top, behavior })
    return true
  }

  function scheduleSectionScroll(sectionId, behavior = 'smooth') {
    requestAnimationFrame(() => {
      scrollToSection(sectionId, behavior)
    })
  }

  function reconnectRevealObserver() {
    revealObserver?.disconnect()
    if (typeof IntersectionObserver === 'undefined') return
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealSection(entry.target.dataset.sectionId)
          }
        })
      },
      { root: null, threshold: 0.18 }
    )
    sectionRefs.forEach((element) => revealObserver.observe(element))
  }

  function refreshActiveSection() {
    if (!sectionRefs.size) return
    const marker = window.innerHeight * 0.45
    let closestSection = 'hero'
    let closestDistance = Number.POSITIVE_INFINITY
    for (const [sectionId, element] of sectionRefs.entries()) {
      const distance = Math.abs(element.getBoundingClientRect().top - marker)
      if (distance < closestDistance) {
        closestDistance = distance
        closestSection = sectionId
      }
    }
    activeSectionId.value = closestSection
    revealSection(closestSection)
  }

  function handleScrollerScroll() {
    if (scrollFrame) return
    scrollFrame = window.requestAnimationFrame(() => {
      refreshActiveSection()
      scrollFrame = 0
    })
  }

  function handleHeroSlideChange(index) {
    activeCategoryIndex.value = index
  }
  
  function toggleCategory() {}
  function openAllCategories() {}
  function openCategory() {}
  function openProject() {}

  watch(
    () => route.hash,
    (hash) => {
      const sectionId = hash?.replace('#', '') || 'hero'
      activeSectionId.value = sectionId
      revealSection(sectionId)
      scheduleSectionScroll(sectionId, 'auto')
    }
  )

  watch(activeSectionId, (value) => {
    const isHero = value === 'hero'
    uiState.isHeaderHidden = !isHero
    uiState.isHeaderHovered = false
  }, { immediate: true })

  onMounted(async () => {
    uiState.isNavHidden = false
    uiState.isHeaderHidden = false
    uiState.isHeaderHovered = false
    // Hiển thị Footer để tương đồng các trang khác
    uiState.isFooterHidden = false

    await loadProjectData()
    reconnectRevealObserver()

    window.addEventListener('resize', handleScrollerScroll, { passive: true })
    window.addEventListener('scroll', handleScrollerScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    revealObserver?.disconnect()
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
    window.removeEventListener('resize', handleScrollerScroll)
    window.removeEventListener('scroll', handleScrollerScroll)
    uiState.isNavHidden = false
    uiState.isHeaderHidden = false
    uiState.isHeaderHovered = false
    uiState.isFooterHidden = false
  })

  return {
    sidebarOpen,
    activeCategoryId,
    activeCategoryIndex,
    activeSectionId,
    sidebarCategories,
    heroSlides,
    activeSections,
    expandedCategoryIds,
    visibleSectionIds,
    loading,
    error,
    registerHeroSwiper,
    registerThumbsSwiper,
    handleHeroSlideChange,
    setSectionRef,
    toggleCategory,
    openAllCategories,
    openCategory,
    openProject,
  }
}
