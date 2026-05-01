/**
 * useAboutPage.js
 *
 * Composable cho About page:
 * - Gọi API getPageDetail('about')
 * - Normalize response thành view model
 * - Quản lý loading / error / aboutView
 * - Cập nhật SEO tags
 */

import { onMounted, readonly, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPageDetail, getBanners } from '@/views/user/services/publicApi'
import { normalizeAboutPage } from '../adapters/aboutPageNormalizer'

function applySeo(view) {
  const fallbackTitle = 'Giới Thiệu | THIÊN ĐỒNG VIỆT NAM'
  const fallbackDescription =
    'Tìm hiểu về Công ty TNHH Thương mại Quốc tế Thiên Đông Việt Nam, lịch sử phát triển, văn hóa doanh nghiệp và tầm nhìn chiến lược của chúng tôi.'

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
  const { locale } = useI18n()
  const loading = ref(true)
  const error = ref(null)
  const aboutView = ref(null)

  async function fetchAbout() {
    loading.value = true
    error.value = null

    try {
      const [raw, banners] = await Promise.all([
        getPageDetail('about'),
        getBanners({ bannerType: 'hero' })
      ])
      aboutView.value = normalizeAboutPage(raw, banners)

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
  watch(locale, fetchAbout)

  return {
    loading: readonly(loading),
    error: readonly(error),
    aboutView: readonly(aboutView),
    refresh: fetchAbout,
  }
}
