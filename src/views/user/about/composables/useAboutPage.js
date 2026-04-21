/**
 * useAboutPage.js
 *
 * Composable cho About page:
 * - Gọi API getPageDetail('about')
 * - Normalize response thành view model
 * - Quản lý loading / error / aboutView
 * - Cập nhật SEO tags
 */

import { onMounted, readonly, ref } from 'vue'
import { getPageDetail } from '@/views/user/services/publicApi'
import { normalizeAboutPage } from '../adapters/aboutPageNormalizer'

function applySeo(view) {
  const fallbackTitle = 'Giới Thiệu | China Decor'
  const fallbackDescription =
    'Tìm hiểu thêm về China Decor, lịch sử phát triển, văn hóa doanh nghiệp, ban lãnh đạo và các giá trị cốt lõi của chúng tôi.'

  document.title = view?.metaTitle || view?.title || fallbackTitle

  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute('content', view?.metaDescription || fallbackDescription)
  }
}

/**
 * @returns {{ loading, error, aboutView, refresh }}
 */
export function useAboutPage() {
  const loading = ref(true)
  const error = ref(null)
  const aboutView = ref(null)

  async function fetchAbout() {
    loading.value = true
    error.value = null

    try {
      const raw = await getPageDetail('about')
      aboutView.value = normalizeAboutPage(raw)

      if (!aboutView.value) {
        error.value = 'About page data is empty'
      }

      applySeo(aboutView.value)
    } catch (err) {
      console.error('[useAboutPage] Failed to load about page:', err)
      error.value = err?.message || 'Failed to load page data'
      aboutView.value = null
      applySeo(null)
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchAbout)

  return {
    loading: readonly(loading),
    error: readonly(error),
    aboutView: readonly(aboutView),
    refresh: fetchAbout,
  }
}
