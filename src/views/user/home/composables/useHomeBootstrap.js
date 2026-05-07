import { computed, ref, watch } from 'vue'

import i18n from '@/i18n'
import { getHomeBootstrap } from '@/views/user/services/publicApi'

const createEmptyPayload = () => ({
  products: { items: [], pagination: { skip: 0, limit: 4, total: 0 } },
  projects: { items: [], pagination: { skip: 0, limit: 4, total: 0 } },
  news: { items: [], total: 0, skip: 0, limit: 8 },
  honors: {
    hero_banner: null,
    factory_overview: null,
    production_capabilities: [],
    factory_gallery: [],
    certificates: [],
    contact_info: null,
    hero: null,
    sections: {
      qualification_certificates: [],
      corporate_honors: [],
      project_honors: [],
    },
  },
})

const sharedData = ref(createEmptyPayload())
const sharedLoading = ref(false)
const sharedError = ref(null)
const payloadCache = new Map()
const inflightCache = new Map()
const CACHE_KEY_PREFIX = 'home_bootstrap_'

function getStoredCache(lang) {
  try {
    const data = localStorage.getItem(CACHE_KEY_PREFIX + lang)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

function setStoredCache(lang, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + lang, JSON.stringify(data))
  } catch (e) {}
}

function getCurrentLanguageCode() {
  const locale = i18n.global.locale
  return typeof locale === 'string' ? locale : locale.value
}

function normalizePayload(payload) {
  const fallback = createEmptyPayload()

  return {
    ...fallback,
    ...payload,
    products: payload?.products || fallback.products,
    projects: payload?.projects || fallback.projects,
    news: payload?.news || fallback.news,
    honors: {
      ...fallback.honors,
      ...(payload?.honors || {}),
      sections: {
        ...fallback.honors.sections,
        ...(payload?.honors?.sections || {}),
      },
    },
  }
}

async function loadHomeBootstrap(force = false) {
  const languageCode = getCurrentLanguageCode()

  // 1. In-memory cache hit
  if (!force && payloadCache.has(languageCode)) {
    sharedData.value = payloadCache.get(languageCode)
    return sharedData.value
  }

  // 2. LocalStorage hydration (Instant-load strategy)
  if (!force && !sharedLoading.value && sharedData.value.products.items.length === 0) {
    const cached = getStoredCache(languageCode)
    if (cached) {
      const normalized = normalizePayload(cached)
      sharedData.value = normalized
      payloadCache.set(languageCode, normalized)
      // Continue to fetch fresh data in background
    }
  }

  // 3. Prevent duplicate requests
  if (!force && inflightCache.has(languageCode)) {
    return inflightCache.get(languageCode)
  }

  sharedLoading.value = true
  sharedError.value = null

  const request = getHomeBootstrap()
    .then((payload) => {
      const normalized = normalizePayload(payload)
      payloadCache.set(languageCode, normalized)
      setStoredCache(languageCode, normalized)
      sharedData.value = normalized
      return normalized
    })
    .catch((error) => {
      sharedError.value = error
      // Keep existing data if fetch fails
      if (sharedData.value.products.items.length === 0) {
        sharedData.value = createEmptyPayload()
      }
      throw error
    })
    .finally(() => {
      inflightCache.delete(languageCode)
      sharedLoading.value = false
    })

  inflightCache.set(languageCode, request)
  return request
}

watch(
  () => getCurrentLanguageCode(),
  () => {
    loadHomeBootstrap(true).catch(() => {})
  }
)

export function useHomeBootstrap() {
  return {
    data: computed(() => sharedData.value),
    loading: computed(() => sharedLoading.value),
    error: computed(() => sharedError.value),
    ensureLoaded: loadHomeBootstrap,
  }
}
