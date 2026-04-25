<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, MapPin, CalendarDays, Ruler, Building2, LayoutGrid } from 'lucide-vue-next'
import { getProjectDetail } from '@/views/user/services/publicApi'
import { uiState } from '@/shared/utils/uiState'

const route = useRoute()
const project = ref(null)
const loading = ref(true)
const error = ref(null)

const imageUrl = (media) => media?.url || ''

/* ── Gallery ──────────────────────────── */
const galleryImages = computed(() => {
  if (!project.value) return []
  const items = project.value.gallery || []
  return items.map((item) => ({
    id: item.id,
    url: item?.media?.url || item?.url || '',
    caption: item?.caption || '',
  })).filter((item) => item.url)
})

/* ── Sản phẩm sử dụng (vật liệu) ────── */
const usedProducts = computed(() => {
  if (!project.value) return []
  const raw = project.value.used_products || project.value.usedProducts || []
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    id: item?.id || item?.product_id || String(Math.random()),
    name: item?.name || item?.product?.name || 'Sản phẩm',
    slug: item?.slug || item?.product?.slug || '',
    image_url: item?.image_url || item?.product?.image_url || '',
    note: item?.note || '',
  }))
})

/* ── Sidebar info items ──────────────── */
const infoItems = computed(() => {
  if (!project.value) return []
  const result = []

  if (project.value.location) {
    result.push({ icon: 'map-pin', label: 'ĐỊA ĐIỂM', value: project.value.location })
  }
  if (project.value.project_year) {
    result.push({ icon: 'calendar', label: 'THỜI GIAN', value: `Năm ${project.value.project_year}` })
  }
  if (project.value.category?.name) {
    result.push({ icon: 'layout', label: 'HẠNG MỤC', value: project.value.category.name })
  }

  return result
})

/* ── Data loading ────────────────────── */
async function loadProject(slug) {
  loading.value = true
  error.value = null
  try {
    project.value = await getProjectDetail(slug)

    if (project.value?.meta_title) {
      document.title = project.value.meta_title
    } else if (project.value?.title) {
      document.title = `${project.value.title} | Thiên Đồng Việt Nam`
    }

    const desc = project.value?.meta_description || project.value?.summary || ''
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', desc)
  } catch (err) {
    error.value = err?.message || 'Không thể tải chi tiết dự án.'
    project.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  (slug) => { if (slug) loadProject(slug) },
  { immediate: true }
)

onMounted(() => {
  uiState.isHeaderHidden = false
  uiState.isFooterHidden = false
})
</script>

<template>
  <div class="pd">
    <!-- ── Loading ──────────────────────── -->
    <section v-if="loading" class="pd-state" aria-live="polite">
      <div class="pd-state__inner">
        <div class="pd-state__spinner" />
        <p>Đang tải thông tin dự án…</p>
      </div>
    </section>

    <!-- ── Error ────────────────────────── -->
    <section v-else-if="error" class="pd-state pd-state--error" aria-live="assertive">
      <div class="pd-state__inner">
        <h1>Dự án không tồn tại</h1>
        <p>{{ error }}</p>
        <router-link to="/du-an" class="pd-back">← Trở lại danh sách dự án</router-link>
      </div>
    </section>

    <!-- ── Detail ───────────────────────── -->
    <template v-else-if="project">
      <!-- Hero -->
      <section
        class="pd-hero"
        :style="{
          backgroundImage: (imageUrl(project.hero_image) || imageUrl(project.image))
            ? `url(${imageUrl(project.hero_image) || imageUrl(project.image)})`
            : 'none'
        }"
      >
        <div class="pd-hero__overlay" />
        <div class="pd-hero__content">
          <span v-if="project.category?.name" class="pd-hero__cat">
            {{ project.category.name }}
          </span>
          <h1 class="pd-hero__title">{{ project.title }}</h1>
        </div>
      </section>

      <!-- Main content -->
      <section class="pd-body">
        <div class="container">
          <router-link to="/du-an" class="pd-back">
            <ArrowLeft :size="16" />
            TRỞ LẠI DANH SÁCH DỰ ÁN
          </router-link>

          <div class="pd-layout">
            <!-- ─── Left: overview + gallery ─── -->
            <article class="pd-main">
              <h2 class="pd-section-title">Tổng quan dự án</h2>

              <div v-if="project.summary" class="pd-desc">
                {{ project.summary }}
              </div>

              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-if="project.body" class="pd-desc pd-desc--rich" v-html="project.body" />

              <!-- Gallery -->
              <div v-if="galleryImages.length" class="pd-gallery">
                <h3 class="pd-section-title pd-section-title--sub">Thư viện ảnh</h3>
                <div class="pd-gallery__grid">
                  <figure
                    v-for="img in galleryImages"
                    :key="img.id"
                    class="pd-gallery__item"
                  >
                    <img :src="img.url" :alt="img.caption || project.title" loading="lazy" />
                    <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
                  </figure>
                </div>
              </div>
            </article>

            <!-- ─── Right: sidebar ───────────── -->
            <aside class="pd-sidebar">
              <!-- Thông tin -->
              <div class="pd-info-card">
                <h3 class="pd-info-card__title">Thông tin</h3>
                <ul class="pd-info-list">
                  <li v-for="(item, index) in infoItems" :key="index" class="pd-info-item">
                    <span class="pd-info-item__icon">
                      <MapPin v-if="item.icon === 'map-pin'" :size="18" />
                      <CalendarDays v-else-if="item.icon === 'calendar'" :size="18" />
                      <Ruler v-else-if="item.icon === 'ruler'" :size="18" />
                      <Building2 v-else-if="item.icon === 'building'" :size="18" />
                      <LayoutGrid v-else :size="18" />
                    </span>
                    <div>
                      <span class="pd-info-item__label">{{ item.label }}</span>
                      <strong class="pd-info-item__value">{{ item.value }}</strong>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Vật liệu sử dụng -->
              <div v-if="usedProducts.length" class="pd-materials">
                <h3 class="pd-info-card__title">Vật liệu sử dụng</h3>
                <div class="pd-material-list">
                  <router-link
                    v-for="prod in usedProducts"
                    :key="prod.id"
                    :to="prod.slug ? `/products/${prod.slug}` : '#'"
                    class="pd-material-item"
                  >
                    <div class="pd-material-item__img">
                      <img v-if="prod.image_url" :src="prod.image_url" :alt="prod.name" />
                      <div v-else class="pd-material-item__placeholder" />
                    </div>
                    <div class="pd-material-item__info">
                      <strong>{{ prod.name }}</strong>
                      <span v-if="prod.note" class="pd-material-item__note">{{ prod.note }}</span>
                    </div>
                  </router-link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* ── Variables ─────────────────────────────────────────── */
.pd {
  --pd-font-serif: 'Cormorant Garamond', 'Times New Roman', Georgia, serif;
  min-height: 100vh;
  background: #fff;
}

/* ── State (loading / error) ───────────────────────────── */
.pd-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 140px 20px 60px;
}

.pd-state__inner {
  text-align: center;
  max-width: 540px;
}

.pd-state__inner h1 {
  margin: 0 0 12px;
  font-size: 1.6rem;
  color: #1d273a;
}

.pd-state__inner p {
  margin: 0;
  color: #667085;
  line-height: 1.8;
}

.pd-state--error p {
  color: #b42318;
}

.pd-state__spinner {
  width: 36px;
  height: 36px;
  margin: 0 auto 16px;
  border: 3px solid rgba(24, 39, 75, 0.12);
  border-top-color: #1d273a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Hero ──────────────────────────────────────────────── */
.pd-hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-color: #1a1a1a;
}

.pd-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 14, 22, 0.5) 0%,
    rgba(10, 14, 22, 0.35) 40%,
    rgba(10, 14, 22, 0.7) 100%
  );
}

.pd-hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 140px 24px 80px;
  max-width: 860px;
}

.pd-hero__cat {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

.pd-hero__title {
  margin: 0;
  font-family: var(--pd-font-serif);
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  font-weight: 600;
  color: #fff;
  line-height: 1.15;
}

/* ── Body section ──────────────────────────────────────── */
.pd-body {
  padding: 40px 0 80px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Back link ─────────────────────────────────────────── */
.pd-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  color: #475467;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}

.pd-back:hover {
  color: #1d273a;
}

/* ── Layout 2 columns ─────────────────────────────────── */
.pd-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
  align-items: start;
}

/* ── Main article ──────────────────────────────────────── */
.pd-section-title {
  margin: 0 0 20px;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: #1d273a;
  line-height: 1.25;
}

.pd-section-title--sub {
  margin-top: 40px;
  font-size: 1.35rem;
}

.pd-desc {
  color: #344054;
  font-size: 1rem;
  line-height: 1.9;
  margin-bottom: 12px;
}

.pd-desc--rich :deep(p + p) {
  margin-top: 14px;
}

.pd-desc--rich :deep(h2),
.pd-desc--rich :deep(h3) {
  margin-top: 24px;
  margin-bottom: 10px;
  color: #1d273a;
}

/* ── Gallery ───────────────────────────────────────────── */
.pd-gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.pd-gallery__item {
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #f2f4f7;
}

.pd-gallery__item img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.pd-gallery__item:hover img {
  transform: scale(1.04);
}

.pd-gallery__item figcaption {
  padding: 10px 14px;
  font-size: 0.88rem;
  color: #667085;
}

/* ── Sidebar ───────────────────────────────────────────── */
.pd-sidebar {
  position: sticky;
  top: 140px;
}

.pd-info-card {
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  padding: 28px 24px;
  background: #fff;
}

.pd-info-card__title {
  margin: 0 0 20px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1d273a;
}

.pd-info-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pd-info-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid #f2f4f7;
}

.pd-info-item:first-child {
  border-top: none;
  padding-top: 0;
}

.pd-info-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  background: #f9fafb;
  color: #667085;
}

.pd-info-item__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #667085;
  margin-bottom: 3px;
}

.pd-info-item__value {
  display: block;
  font-size: 0.95rem;
  color: #1d273a;
}

/* ── Materials ─────────────────────────────────────────── */
.pd-materials {
  margin-top: 28px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  padding: 28px 24px;
  background: #fff;
}

.pd-material-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pd-material-item {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.2s;
}

.pd-material-item:hover {
  background: #f9fafb;
}

.pd-material-item__img {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f2f4f7;
}

.pd-material-item__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-material-item__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e4e7ec, #d0d5dd);
}

.pd-material-item__info {
  display: flex;
  flex-direction: column;
}

.pd-material-item__info strong {
  font-size: 0.95rem;
  color: #1d273a;
}

.pd-material-item__note {
  font-size: 0.82rem;
  color: #667085;
  margin-top: 2px;
}

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 1024px) {
  .pd-layout {
    grid-template-columns: 1fr 280px;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .pd-hero {
    min-height: 380px;
  }

  .pd-hero__content {
    padding: 120px 20px 56px;
  }

  .pd-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .pd-sidebar {
    position: static;
  }

  .pd-gallery__grid {
    grid-template-columns: 1fr;
  }

  .pd-body {
    padding: 28px 0 56px;
  }
}
</style>
