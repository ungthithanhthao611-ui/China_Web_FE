<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade } from 'swiper/modules'
import { useI18n } from 'vue-i18n'

import { useBootstrapStore } from '@/views/user/stores/bootstrap'
import { getBanners } from '@/views/user/services/publicApi'
import { env } from '@/shared/config/env'

import 'swiper/css'
import 'swiper/css/effect-fade'

defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['scroll-next', 'slide-change'])

const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')
const bootstrapStore = useBootstrapStore()
const { locale } = useI18n({ useScope: 'global' })
const modules = [Autoplay, EffectFade]
const activeSlide = ref(0)
const swiperRef = ref(null)
const videoRefs = ref([])
const latestApiBanners = ref([])
const isFetchingLatestBanners = ref(false)

const defaultSlides = computed(() => [
  {
    type: 'image',
    src: '/images/bannenr.png',
    alt: 'Hero banner fallback',
  },
])

function resolveAssetUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

function cloudinaryVideoPoster(url) {
  const normalized = String(url || '').trim()
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//i.test(normalized)) {
    return ''
  }

  const [base, query = ''] = normalized.split('?')
  const posterBase = base
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.(mp4|webm|ogg|mov|m4v)$/i, '.jpg')

  return query ? `${posterBase}?${query}` : posterBase
}

function isVideoAsset(banner = {}) {
  if (String(banner?.image?.asset_type || '').toLowerCase() === 'video') {
    return true
  }

  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(banner?.image?.url || '').trim())
}

function clampBannerFocus(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 50
  return Math.min(100, Math.max(0, numeric))
}

async function refreshHeroBanners() {
  if (isFetchingLatestBanners.value) {
    return
  }

  isFetchingLatestBanners.value = true

  try {
    const payload = await getBanners({ bannerType: 'hero' })
    latestApiBanners.value = Array.isArray(payload) ? payload : payload?.items || []
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[hero-banner] Failed to refresh hero banners', error)
    }
  } finally {
    isFetchingLatestBanners.value = false
  }
}

const sourceBanners = computed(() => {
  if (latestApiBanners.value.length) {
    return latestApiBanners.value
  }

  const bootstrapBanners = bootstrapStore.heroBanners || []
  return bootstrapBanners
})

const slides = computed(() => {
  const banners = sourceBanners.value

  // Use default slides if no API data yet
  if (!banners.length) {
    return defaultSlides.value.map((slide, index) => ({
      ...slide,
      poster: slide.src,
      hasCopy: true,
      focusX: 50,
      focusY: 50,
      fallback: slide
    }))
  }

  return banners.map((banner, index) => {
    const fallbackSlide = defaultSlides.value[index % defaultSlides.value.length]
    const mediaUrl = resolveAssetUrl(banner.image?.url || fallbackSlide.src || '')
    const isVideo = banner.image?.url ? isVideoAsset(banner) : fallbackSlide.type === 'video'
    const posterUrl = isVideo
      ? resolveAssetUrl(banner.image?.thumbnail_url || banner.image?.poster || '') || cloudinaryVideoPoster(mediaUrl) || fallbackSlide.src || ''
      : mediaUrl

    return {
      type: isVideo ? 'video' : 'image',
      src: mediaUrl,
      poster: isVideo ? posterUrl : mediaUrl,
      alt: banner.image?.alt_text || banner.title || fallbackSlide.alt || `China Decor banner ${index + 1}`,
      focusX: clampBannerFocus(banner.focus_x),
      focusY: clampBannerFocus(banner.focus_y),
      fallback: fallbackSlide,
    }
  })
})

const slideIndicators = computed(() =>
  slides.value.map((_, index) => String(index + 1).padStart(2, '0'))
)

const setVideoRef = (element, index) => {
  if (!element) return
  videoRefs.value[index] = element
}

const syncVideos = () => {
  videoRefs.value.forEach((video, index) => {
    if (!video) return

    if (slides.value[index]?.type === 'video' && index === activeSlide.value) {
      const playAttempt = video.play()
      if (playAttempt?.catch) {
        playAttempt.catch(() => {})
      }
      return
    }

    video.pause()
    video.currentTime = 0
  })
}

const handleSwiper = (swiper) => {
  swiperRef.value = swiper
  activeSlide.value = swiper.realIndex
  emit('slide-change', swiper.realIndex)
  nextTick(syncVideos)
}

const handleSlideChange = (swiper) => {
  activeSlide.value = swiper.realIndex
  emit('slide-change', swiper.realIndex)
  nextTick(syncVideos)
}

const goToSlide = (index) => {
  if (!swiperRef.value) return

  if (slides.value.length > 1) {
    swiperRef.value.slideToLoop(index)
    return
  }

  swiperRef.value.slideTo(index)
}

watch(
  slides,
  () => {
    if (activeSlide.value >= slides.value.length) {
      activeSlide.value = 0
    }
    nextTick(syncVideos)
  },
  { deep: true }
)

watch(
  () => locale.value,
  () => {
    refreshHeroBanners()
  }
)

onMounted(refreshHeroBanners)

defineExpose({ goToSlide })
</script>

<template>
  <section class="hero-banner">
    <swiper
      v-if="slides.length"
      :modules="modules"
      :slides-per-view="1"
      :loop="slides.length > 1"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :autoplay="slides.length > 1 ? { delay: 5000, disableOnInteraction: false } : false"
      :speed="1800"
      class="hero-swiper"
      @swiper="handleSwiper"
      @slideChange="handleSlideChange"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="`${slide.src || 'banner'}-${index}`">
        <div class="hero-media">
          <img
            v-if="slide.type === 'image'"
            :src="slide.src"
            :alt="slide.alt"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            :style="{ objectPosition: `${slide.focusX ?? 50}% ${slide.focusY ?? 50}%` }"
          />
          <video
            v-else
            :ref="(element) => setVideoRef(element, index)"
            :src="slide.src"
            :poster="slide.poster || undefined"
            muted
            playsinline
            preload="metadata"
            loop
          ></video>
        </div>

        <div class="overlay"></div>
        <div class="overlay overlay--grain"></div>
      </swiper-slide>
    </swiper>
    <div v-if="slideIndicators.length" class="hero-indicators" aria-label="Hero banner slide indicators">
      <button
        v-for="(indicator, index) in slideIndicators"
        :key="indicator"
        type="button"
        class="hero-indicator"
        :class="{ 'hero-indicator--active': index === activeSlide }"
        :aria-label="`Đi tới banner ${indicator}`"
        @click="goToSlide(index)"
      >
        <span class="hero-indicator__number">{{ indicator }}</span>
        <span class="hero-indicator__dot"></span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero-banner,
.hero-banner-placeholder {
  position: relative;
  height: 100svh;
  min-height: min(720px, 100svh);
  width: 100%;
  overflow: hidden;
  background: #050b14;
}

.hero-swiper {
  height: 100%;
  width: 100%;
}

.hero-media,
.hero-media img,
.hero-media video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-media img,
.hero-media video {
  object-fit: cover;
  object-position: center;
  transition: transform 7s linear, filter 0.5s ease;
}

:deep(.swiper-slide-active) .hero-media img,
:deep(.swiper-slide-active) .hero-media video {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(180deg, rgba(2, 10, 23, 0.28) 0%, rgba(2, 10, 23, 0.08) 18%, rgba(2, 10, 23, 0.2) 60%, rgba(2, 10, 23, 0.4) 100%),
    radial-gradient(circle at 50% 100%, rgba(57, 149, 255, 0.28), rgba(57, 149, 255, 0) 27%);
}

.overlay--grain {
  background:
    radial-gradient(circle at 15% 22%, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0) 1px),
    radial-gradient(circle at 75% 32%, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0) 1px),
    radial-gradient(circle at 62% 72%, rgba(0, 170, 255, 0.18) 0, rgba(0, 170, 255, 0) 5px),
    radial-gradient(circle at 22% 82%, rgba(0, 170, 255, 0.14) 0, rgba(0, 170, 255, 0) 4px);
  background-size: 180px 180px, 220px 220px, auto, auto;
  mix-blend-mode: screen;
  opacity: 0.42;
}

.hero-indicators {
  position: absolute;
  top: 50%;
  right: clamp(12px, 2vw, 28px);
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: translateY(-50%);
}

.hero-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 244, 230, 0.55);
  cursor: pointer;
  transition: color 0.24s ease, transform 0.24s ease;
}

.hero-indicator:hover {
  color: rgba(255, 244, 230, 0.9);
  transform: translateX(-2px);
}

.hero-indicator--active {
  color: #ff3b30;
}

.hero-indicator__number {
  min-width: 24px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
}

.hero-indicator__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16);
}

@media (max-width: 768px) {
  .hero-indicators {
    right: 10px;
    gap: 6px;
  }

  .hero-indicator__number {
    font-size: 12px;
  }

  .hero-indicator__dot {
    width: 5px;
    height: 5px;
  }
}
</style>
