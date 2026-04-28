<script setup>
import { onMounted, ref } from 'vue'

import { env } from '@/shared/config/env'
import { useSectionReveal } from '@/views/user/home/composables/useSectionReveal'
import { getProjects } from '@/views/user/services/publicApi'

const loading = ref(true)
const items = ref([])
const { rootRef, isVisible } = useSectionReveal({ threshold: 0.24 })
const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')

function resolveAssetUrl(url) {
  const normalized = String(url || '').trim()
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

function resolveProjectImage(project) {
  return resolveAssetUrl(
    project?.hero_image?.url ||
      project?.image?.url ||
      project?.image_url ||
      '',
  )
}

async function loadProjects() {
  loading.value = true
  try {
    const payload = await getProjects({ skip: 0, limit: 4 })
    const rows = Array.isArray(payload?.items) ? payload.items : []
    items.value = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary || '',
      location: row.location || '',
      image: resolveProjectImage(row),
    }))
  } catch (error) {
    console.warn('[home] failed to load projects:', error?.message || error)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)
</script>

<template>
  <section class="home-projects" ref="rootRef">
    <div class="container shell home-reveal" :class="{ 'is-visible': isVisible }">
      <header class="section-head" data-reveal-item>
        <p>Dự án tiêu biểu</p>
        <span class="head-line"></span>
        <h2>Dự án mới nhất</h2>
        <span class="sub-head">Khám phá những công trình nổi bật với vật liệu hiện đại, bền đẹp và tinh tế.</span>
      </header>

      <div v-if="items.length" class="grid">
        <article v-for="(item, index) in items" :key="item.id" class="card" data-reveal-item>
          <router-link :to="`/du-an/${item.slug}`" class="visual-link">
            <div class="visual">
              <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
              <div v-else class="placeholder">C</div>
            </div>
          </router-link>

          <div class="body">
            <span class="index-badge">{{ String(index + 1).padStart(2, '0') }}</span>
            <p class="location">📍 {{ item.location || 'TP.HCM, Việt Nam' }}</p>
            <h3>
              <router-link :to="`/du-an/${item.slug}`">{{ item.title }}</router-link>
            </h3>
            <p class="summary">{{ item.summary || 'Thông tin dự án đang được cập nhật.' }}</p>
            <router-link :to="`/du-an/${item.slug}`" class="detail-link">
              <span class="dot-arrow">→</span>
              <span>Xem chi tiết</span>
            </router-link>
          </div>
        </article>
      </div>

      <div v-else class="empty" data-reveal-item>
        <p>{{ loading ? 'Đang tải dự án...' : 'Chưa có dữ liệu dự án.' }}</p>
      </div>

      <div class="section-action" data-reveal-item>
        <router-link to="/du-an" class="btn-all">Xem tất cả dự án</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-projects {
  padding: var(--home-section-pad, clamp(64px, 8vw, 108px)) 0;
  background:
    radial-gradient(circle at left bottom, rgba(178, 14, 23, 0.08), transparent 40%),
    var(--home-surface-soft, #f8f9fb);
}

.shell {
  width: min(1080px, calc(100% - 40px));
  margin: 0 auto;
}

.section-head {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 10px;
}

.section-head p {
  margin: 0;
  color: var(--home-accent, #b20e17);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.head-line {
  width: 58px;
  height: 4px;
  border-radius: 999px;
  background: var(--home-accent, #b20e17);
}

.section-head h2 {
  margin: 4px 0 0;
  color: var(--home-text-strong, #151f31);
  font-size: clamp(1.5rem, 1.5vw, 2.1rem);
  line-height: 1.1;
  font-family: var(--home-font-body, 'Manrope', 'Segoe UI', Arial, sans-serif);
  font-weight: 800;
  text-transform: uppercase;
}

.sub-head {
  max-width: 58ch;
  color: #667085;
  font-size: clamp(11px, 0.62vw, 13px);
  line-height: 1.45;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(9px, 0.82vw, 12px);
  margin-top: 28px;
}

.card {
  display: grid;
  grid-template-columns: minmax(240px, 49%) minmax(0, 1fr);
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
}

.visual {
  width: 100%;
  height: 100%;
  min-height: 180px;
  background: linear-gradient(160deg, #eef1f5, #e7ebf1);
}

.visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #a0a8b6;
  font-size: 38px;
  font-weight: 700;
}

.body {
  position: relative;
  padding: 12px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
}

.index-badge {
  position: absolute;
  right: 10px;
  top: 10px;
  display: inline-flex;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.location {
  margin: 0;
  color: #7c8596;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  padding-right: 32px;
}

.body h3 {
  margin: 0;
  font-size: clamp(16px, 0.86vw, 20px);
  line-height: 1.25;
  font-family: var(--home-font-body, 'Manrope', 'Segoe UI', Arial, sans-serif);
  font-weight: 800;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.body h3 a {
  color: var(--home-text-strong, #151f31);
  text-decoration: none;
}

.summary {
  margin: 0;
  color: #4b5563;
  font-size: 12.5px;
  line-height: 1.56;
  font-family: var(--home-font-body, 'Segoe UI', Arial, sans-serif);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-link {
  margin-top: 0;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px 0 0;
  border-radius: 999px;
  color: #d11a27;
  text-decoration: none;
  font-weight: 700;
}

.dot-arrow {
  display: inline-flex;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e25a63;
  color: #d11a27;
  line-height: 1;
  font-size: 14px;
}

.empty {
  margin-top: 18px;
  padding: 18px 20px;
  border-radius: 14px;
  background: #eef1f6;
  color: var(--home-text-muted, #4d596d);
}

.section-action {
  margin-top: 26px;
  display: flex;
  justify-content: center;
}

.btn-all {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 28px;
  border-radius: 999px;
  background: var(--home-accent, #b20e17);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 1200px) {
  .shell {
    width: calc(100% - 24px);
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .card {
    grid-template-columns: minmax(250px, 45%) minmax(0, 1fr);
  }
}

@media (max-width: 1023px) {
  .body h3 {
    font-size: clamp(17px, 1.6vw, 20px);
  }
}

@media (max-width: 767px) {
  .home-projects {
    padding: 44px 0 54px;
  }

  .shell {
    width: calc(100% - 24px);
  }

  .section-head {
    gap: 6px;
  }

  .section-head p {
    font-size: 10px;
  }

  .section-head h2 {
    font-size: 27px;
    line-height: 1.02;
  }

  .sub-head {
    font-size: 12px;
    line-height: 1.4;
    max-width: 34ch;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
  }

  .card {
    grid-template-columns: 1fr;
    border-radius: 14px;
  }

  .visual {
    min-height: auto;
    aspect-ratio: 1.08;
  }

  .body {
    padding: 10px 10px 11px;
    gap: 5px;
  }

  .index-badge {
    width: 22px;
    height: 22px;
    right: 8px;
    top: 8px;
    font-size: 10px;
  }

  .location {
    font-size: 9px;
  }

  .body h3 {
    font-size: 15px;
    line-height: 1.2;
  }

  .summary {
    font-size: 11px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
    min-height: calc(1.4em * 4);
  }

  .detail-link {
    gap: 6px;
    font-size: 12px;
    min-height: 28px;
  }

  .dot-arrow {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }

  .btn-all {
    min-height: 40px;
    font-size: 13px;
    padding: 0 18px;
  }
}

@media (max-width: 480px) {
  .section-head h2 {
    font-size: 24px;
  }

  .summary {
    -webkit-line-clamp: 4;
    min-height: calc(1.45em * 4);
  }
}
</style>
