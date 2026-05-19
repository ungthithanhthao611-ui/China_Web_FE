<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { useHomeBootstrap } from '@/views/user/home/composables/useHomeBootstrap'
import { useSectionReveal } from '@/views/user/home/composables/useSectionReveal'

const router = useRouter()
const { locale, t } = useI18n({ useScope: 'global' })
const { rootRef, isVisible } = useSectionReveal({ threshold: 0.1 })
const { data: homeBootstrap, loading } = useHomeBootstrap()
const newsList = ref([])
const MAX_NEWS_ITEMS = 4

function goTo(path) {
  if (!path) return
  router.push(path)
}

function formatDate(dateStr) {
  if (!dateStr) return { day: '01', month: 'JAN', year: '2026' }

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return { day: '01', month: 'JAN', year: '2026' }

  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    year: String(date.getFullYear()),
  }
}

function resolveCategory(item) {
  return (
    item?.category_name ||
    item?.category?.name ||
    item?.topic ||
    item?.tag ||
    t('user.home.newsCategory')
  )
}

function resolveSummary(item) {
  return (
    item?.short_desc ||
    item?.summary ||
    item?.excerpt ||
    t('user.home.newsSubtitle')
  )
}

function resolveImage(item) {
  return item?.thumbnail_url || item?.image?.url || item?.image || ''
}

function syncNews() {
  const rows = Array.isArray(homeBootstrap.value?.news?.items) ? homeBootstrap.value.news.items : []

  newsList.value = rows.slice(0, MAX_NEWS_ITEMS).map((item) => {
    const dateParts = formatDate(item?.published_at || item?.created_at)

    return {
      ...item,
      ...dateParts,
      category: resolveCategory(item),
      summary: resolveSummary(item),
      image: resolveImage(item),
      link: `/news/${item.slug}`,
    }
  })
}

watch([homeBootstrap, locale], syncNews, { immediate: true })
</script>

<template>
  <section ref="rootRef" class="news-section">
    <div class="news-shell home-reveal" :class="{ 'is-visible': isVisible }">
      <header class="news-header content" data-reveal-item>
        <div class="header-copy">
          <span class="header-eyebrow">{{ t('user.home.newsEyebrow') }}</span>
          <h2 class="section-title">{{ t('user.home.newsTitle') }}</h2>
          <p class="section-subtitle">{{ t('user.home.newsSubtitle') }}</p>
        </div>

        <router-link to="/news" class="title-arrow" :aria-label="t('user.home.viewAllNews')">
          <span>{{ t('user.home.viewAllNews') }}</span>
          <ArrowRight :size="18" />
        </router-link>
      </header>

      <div v-if="loading" class="news-grid news-grid--loading visual" data-reveal-item>
        <div v-for="index in 4" :key="`loading-${index}`" class="news-skeleton">
          <div class="skeleton-media"></div>
          <div class="skeleton-body">
            <div class="skeleton-line skeleton-line--sm"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--lg"></div>
          </div>
        </div>
      </div>

      <div v-else-if="newsList.length" class="news-grid visual" data-reveal-item>
        <article
          v-for="item in newsList"
          :key="item.id"
          class="news-item"
          @click="goTo(item.link)"
        >
          <div class="item-media">
            <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
            <div v-else class="item-media-fallback">{{ t('user.home.newsFallbackTitle') }}</div>
            <div class="item-date-badge">
              <strong>{{ item.day }}</strong>
              <span>{{ item.month }}</span>
            </div>
            <div class="item-overlay"></div>
          </div>

          <div class="item-content">
            <div class="item-top">
              <span class="item-tag">{{ item.category }}</span>
            </div>

            <h3 class="item-title">{{ item.title }}</h3>
            <p v-if="item.summary" class="item-summary">{{ item.summary }}</p>

            <div class="item-footer">
              <span class="item-year">{{ item.year }}</span>
              <span class="read-more">
                {{ t('user.home.viewMore') }}
                <ArrowRight :size="16" />
              </span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="news-empty">
        <p>{{ t('user.home.newsEmpty') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.news-section {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100%;
  padding: clamp(48px, 5vh, 72px) 0;
  background:
    radial-gradient(circle at top left, rgba(201, 157, 74, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(31, 58, 114, 0.1), transparent 24%),
    linear-gradient(180deg, #fffdf9 0%, #ffffff 48%, #f8f9fc 100%);
  color: #182033;
  overflow: hidden;
}

.news-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(17, 24, 39, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(17, 24, 39, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 88%);
  pointer-events: none;
}

.news-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 40px);
}

.news-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(24px, 3vh, 34px);
}

.header-copy {
  max-width: 720px;
}

.header-eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #c89232;
}

.section-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.8rem);
  font-weight: 300;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  color: #121826;
}

.section-subtitle {
  margin: 14px 0 0;
  max-width: 620px;
  font-size: 0.98rem;
  line-height: 1.72;
  color: rgba(24, 32, 51, 0.68);
}

.title-arrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 999px;
  border: 1px solid rgba(20, 28, 45, 0.12);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  color: #1a2135;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(16px);
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease,
    border-color 0.32s ease,
    color 0.32s ease;
}

.title-arrow:hover {
  transform: translateY(-3px);
  color: #b51f2d;
  border-color: rgba(181, 31, 45, 0.26);
  box-shadow: 0 20px 36px rgba(181, 31, 45, 0.14);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(18px, 1.8vw, 24px);
}

.news-item,
.news-skeleton {
  min-height: 220px;
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.1);
}

.news-item {
  display: grid;
  grid-template-columns: minmax(190px, 36%) minmax(0, 1fr);
  cursor: pointer;
  transition:
    transform 0.45s ease,
    box-shadow 0.45s ease,
    border-color 0.45s ease;
}

.news-item:hover {
  transform: translateY(-8px);
  border-color: rgba(200, 146, 50, 0.28);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.16);
}

.news-item:hover .item-media img {
  transform: scale(1.08);
}

.news-item:hover .item-title {
  color: #b11f2a;
}

.item-media {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: linear-gradient(160deg, #eff3fa 0%, #dfe6f5 100%);
}

.item-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s cubic-bezier(0.2, 1, 0.2, 1);
}

.item-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(12, 18, 30, 0.2) 100%);
  pointer-events: none;
}

.item-date-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(11, 19, 35, 0.78);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(11, 19, 35, 0.22);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.item-date-badge strong {
  font-size: 1.3rem;
  line-height: 1;
}

.item-date-badge span {
  margin-top: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.item-media-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: rgba(24, 32, 51, 0.42);
  text-transform: uppercase;
}

.item-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-width: 0;
  padding: 22px 24px;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.item-tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(181, 31, 45, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #b11f2a;
  text-transform: uppercase;
}

.item-title {
  margin: 0;
  font-size: clamp(1.06rem, 1.05vw, 1.3rem);
  font-weight: 700;
  line-height: 1.42;
  color: #182033;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.item-summary {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.68;
  color: rgba(24, 32, 51, 0.68);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.item-year {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: rgba(24, 32, 51, 0.44);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #182033;
}

.news-grid--loading .news-skeleton {
  display: grid;
  grid-template-columns: minmax(190px, 36%) minmax(0, 1fr);
}

.skeleton-media {
  min-height: 100%;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.18), rgba(148, 163, 184, 0.08));
}

.skeleton-body {
  padding: 22px 24px;
}

.skeleton-line {
  height: 12px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.04));
}

.skeleton-line--sm {
  width: 32%;
}

.skeleton-line--lg {
  width: 72%;
  margin-top: 26px;
}

.news-empty {
  display: grid;
  place-items: center;
  min-height: 260px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(20, 28, 45, 0.08);
  color: rgba(24, 32, 51, 0.68);
  text-align: center;
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1200px) {
  .news-item,
  .news-grid--loading .news-skeleton {
    grid-template-columns: minmax(172px, 34%) minmax(0, 1fr);
  }

  .item-content,
  .skeleton-body {
    padding: 20px;
  }
}

@media (max-width: 992px) {
  .news-section {
    min-height: auto;
    padding: 72px 0;
  }

  .news-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-arrow {
    align-self: flex-start;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .news-shell {
    padding: 0 18px;
  }

  .section-title {
    font-size: 2.1rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .news-item,
  .news-grid--loading .news-skeleton {
    grid-template-columns: 1fr;
    min-height: unset;
  }

  .item-media,
  .skeleton-media {
    min-height: 220px;
  }

  .item-content,
  .skeleton-body {
    padding: 20px;
  }

  .item-summary {
    -webkit-line-clamp: 4;
  }

  .item-footer {
    flex-wrap: wrap;
  }
}
</style>
