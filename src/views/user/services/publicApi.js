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
  return fetchJson('/public/projects', {
    query: withLanguage({
      category_slug: categorySlug,
      year,
      skip,
      limit,
      ...query,
    }),
  })
}

export function getProjectDetail(slug, query = {}) {
  return fetchJson(`/public/projects/${slug}`, { query: withLanguage(query) })
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
