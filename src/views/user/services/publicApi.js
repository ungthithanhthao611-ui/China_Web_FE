import { env } from '@/shared/config/env'
import { fetchJson } from '@/shared/lib/http'

function withLanguage(query = {}) {
  return {
    language_code: env.languageCode,
    ...query,
  }
}

async function fetchWithLanguageFallback(path, queryBuilder, fallbackLanguages = ['vi']) {
  const languages = [env.languageCode, ...fallbackLanguages]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  let lastError = null

  for (const languageCode of languages) {
    try {
      return await fetchJson(path, {
        query: queryBuilder(languageCode),
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

/**
 * Giống fetchWithLanguageFallback nhưng cũng fallback khi response trả về
 * danh sách rỗng (items.length === 0). Hữu ích cho endpoint trả 200 OK
 * với items=[] khi không có dữ liệu ở language_code đó.
 */
async function fetchWithLanguageFallbackNonEmpty(path, queryBuilder, fallbackLanguages = ['vi']) {
  const seen = new Set()
  const languages = [env.languageCode, ...fallbackLanguages]
    .map((value) => String(value || '').trim())
    .filter((value) => {
      if (!value || seen.has(value)) return false
      seen.add(value)
      return true
    })

  let lastResult = null
  let lastError = null

  for (const languageCode of languages) {
    try {
      const result = await fetchJson(path, {
        query: queryBuilder(languageCode),
      })

      const items = result?.items
      if (Array.isArray(items) && items.length > 0) {
        return result
      }

      if (!lastResult) {
        lastResult = result
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastResult) return lastResult
  if (lastError) throw lastError

  return { items: [] }
}

/**
 * Gộp danh sách dự án từ nhiều ngôn ngữ để trang `/du-an` không bị thiếu
 * item khi admin tạo dự án rải ở nhiều language_id khác nhau.
 */
async function fetchMergedProjectsByLanguages(queryBuilder, languages = ['vi', 'en']) {
  const normalizedLanguages = [...new Set(
    languages
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )]

  const results = await Promise.allSettled(
    normalizedLanguages.map((languageCode) =>
      fetchJson('/public/projects', {
        query: queryBuilder(languageCode),
      })
    )
  )

  const mergedItems = []
  const seenKeys = new Set()
  let pagination = null
  let firstError = null

  for (const result of results) {
    if (result.status === 'rejected') {
      firstError ||= result.reason
      continue
    }

    const payload = result.value || {}
    const items = Array.isArray(payload.items) ? payload.items : []
    pagination ||= payload.pagination || null

    for (const item of items) {
      const dedupeKey = String(item?.slug || item?.id || '')
      if (!dedupeKey || seenKeys.has(dedupeKey)) continue
      seenKeys.add(dedupeKey)
      mergedItems.push(item)
    }
  }

  if (!mergedItems.length && firstError) {
    throw firstError
  }

  return {
    items: mergedItems,
    pagination: {
      ...(pagination || {}),
      total: mergedItems.length,
      skip: 0,
      limit: mergedItems.length || pagination?.limit || 0,
    },
  }
}

export function getHealth() {
  return fetchJson('/health')
}

export function getBootstrap(query = {}) {
  return fetchJson('/public/bootstrap', { query: withLanguage(query) })
}

export function getBanners({ bannerType, ...query } = {}) {
  return fetchWithLanguageFallback(
    '/public/banners',
    (languageCode) => ({
      language_code: languageCode,
      banner_type: bannerType,
      ...query,
    })
  )
}

export function getPageDetail(slug, query = {}) {
  return fetchJson(`/public/pages/${slug}`, { query: withLanguage(query) })
}

export function getProjects({ categorySlug, year, skip, limit, ...query } = {}) {
  return fetchMergedProjectsByLanguages(
    (languageCode) => ({
      language_code: languageCode,
      category_slug: categorySlug,
      year,
      skip,
      limit,
      ...query,
    }),
    [env.languageCode, 'vi', 'en']
  )
}

export function getProjectDetail(slug, query = {}) {
  return fetchWithLanguageFallback(
    `/public/projects/${slug}`,
    (languageCode) => ({
      language_code: languageCode,
      ...query,
    }),
    ['vi', 'en']
  )
}

export function getProjectCasePage(categoryId, query = {}) {
  const normalizedCategoryId = String(categoryId || '').trim()
  const isNumericCategoryId = /^\d+$/.test(normalizedCategoryId)

  const path = isNumericCategoryId
    ? `/public/project-case/${normalizedCategoryId}`
    : '/public/project-case'

  return fetchJson(path, {
    query: withLanguage({
      ...(isNumericCategoryId ? {} : {}),
      ...query,
    }),
  })
}

export function getHonors({ awardYear, ...query } = {}) {
  return fetchJson('/public/honors', {
    query: withLanguage({
      award_year: awardYear,
      ...query,
    }),
  })
}

export function getBranches({ branchType, ...query } = {}) {
  return fetchJson('/public/branches', {
    query: withLanguage({
      branch_type: branchType,
      ...query,
    }),
  })
}

export function getBranchDetail(slug, query = {}) {
  return fetchJson(`/public/branches/${slug}`, { query: withLanguage(query) })
}

export function getContacts(query = {}) {
  return fetchJson('/public/contacts', { query: withLanguage(query) })
}

export function getVideos(query = {}) {
  return fetchJson('/public/videos', { query: withLanguage(query) })
}

// ─── News ─────────────────────────────────────────────────────────────────

export function getNewsList({ skip, limit, keyword, ...query } = {}) {
  return fetchWithLanguageFallback(
    '/public/news',
    (languageCode) => ({
      language_code: languageCode,
      skip,
      limit,
      keyword,
      ...query,
    })
  )
}

export function getNewsDetail(slug, query = {}) {
  return fetchJson(`/public/news/${slug}`, { query: withLanguage(query) })
}
