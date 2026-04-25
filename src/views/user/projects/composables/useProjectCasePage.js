import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjects } from '@/views/user/services/publicApi'
import { uiState } from '@/shared/utils/uiState'

const LIST_PAGE_PATH = '/du-an'

function resolveProjectImage(project = {}) {
  return project?.hero_image?.url || project?.image?.url || ''
}

function normalizeUsedProduct(item = {}) {
  if (!item) return null

  const slug = item.product?.slug || item.slug || ''

  return {
    id: String(item.product?.id || item.product_id || item.id || slug || ''),
    name: item.product?.name || item.name || 'Sản phẩm',
    slug,
    note: item.note || '',
    href: slug ? `/products/${slug}` : '/products',
  }
}

function normalizeProject(project = {}, index = 0) {
  const leftImages = Array.isArray(project.leftGallery) ? project.leftGallery.filter(Boolean) : []
  const rightImages = Array.isArray(project.rightGallery) ? project.rightGallery.filter(Boolean) : []
  const fallbackImage = resolveProjectImage(project)
  const coverImage = leftImages[0] || rightImages[0] || fallbackImage

  return {
    id: String(project.id || index + 1),
    slug: String(project.slug || '').trim(),
    title: project.title || 'Dự án đang cập nhật',
    summary: project.summary || 'Nội dung mô tả dự án đang được cập nhật từ hệ thống quản trị.',
    coverImage,
    leftImages: leftImages.length ? leftImages : coverImage ? [coverImage] : [],
    rightImages: rightImages.length ? rightImages : coverImage ? [coverImage] : [],
    moreLink: project.slug ? `/du-an/${project.slug}` : LIST_PAGE_PATH,
    legacyMoreLink: project.slug ? `/project/${project.slug}` : LIST_PAGE_PATH,
    layoutVariant: index % 2 === 0 ? 'feature' : 'standard',
    projectYear: project.project_year || null,
    location: project.location || '',
    categoryName: project.category?.name || '',
    usedProducts: Array.isArray(project.usedProducts)
      ? project.usedProducts.map(normalizeUsedProduct).filter(Boolean)
      : [],
  }
}

export function useProjectCasePage() {
  const route = useRoute()
  const router = useRouter()

  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)

  const activeSectionId = ref('hero')
  const visibleSectionIds = ref(new Set(['hero']))

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

  const activeSections = computed(() => projects.value.map(normalizeProject))

  const heroSlides = computed(() =>
    activeSections.value.slice(0, 5).map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.location || project.categoryName || 'Dự án tiêu biểu',
      description: project.summary,
      images: [project.coverImage, project.coverImage].filter(Boolean),
    }))
  )

  const hasProjects = computed(() => activeSections.value.length > 0)
  const emptyStateVisible = computed(() => !loading.value && !error.value && !hasProjects.value)

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
      const response = await getProjects({ limit: 100 })
      projects.value = Array.isArray(response?.items) ? response.items : []
      activeCategoryId.value = 'all'
      activeCategoryIndex.value = 0
      activeSectionId.value = 'hero'
      visibleSectionIds.value = new Set(['hero'])
    } catch (err) {
      projects.value = []
      error.value = err?.message || 'Không thể tải danh sách dự án lúc này.'
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

  function openProject(project) {
    if (!project?.slug) return
    router.push(`/du-an/${project.slug}`)
  }

  function toggleCategory() {}
  function openAllCategories() {}
  function openCategory() {}

  watch(
    () => route.hash,
    (hash) => {
      const sectionId = hash?.replace('#', '') || 'hero'
      activeSectionId.value = sectionId
      revealSection(sectionId)
      scheduleSectionScroll(sectionId, 'auto')
    }
  )

  watch(
    activeSections,
    () => {
      if (!activeSections.value.length) {
        activeSectionId.value = 'hero'
        visibleSectionIds.value = new Set(['hero'])
      }
    },
    { deep: true }
  )

  watch(
    activeSectionId,
    (value) => {
      const isHero = value === 'hero'
      uiState.isHeaderHidden = !isHero
      uiState.isHeaderHovered = false
    },
    { immediate: true }
  )

  onMounted(async () => {
    uiState.isNavHidden = false
    uiState.isHeaderHidden = false
    uiState.isHeaderHovered = false
    uiState.isFooterHidden = false

    document.title = 'Dự án tiêu biểu | China Decor'

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
    hasProjects,
    emptyStateVisible,
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
