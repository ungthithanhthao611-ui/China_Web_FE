<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Boxes, ChevronLeft, ChevronRight, Cog, Factory, ShieldCheck } from 'lucide-vue-next'
import HonorCard from './HonorCard.vue'

const { t } = useI18n()

const props = defineProps({
  corporateItems: {
    type: Array,
    default: () => [],
  },
  projectItems: {
    type: Array,
    default: () => [],
  },
  imageResolver: {
    type: Function,
    required: true,
  },
})

const activeTab = ref('corporate')
const corporatePage = ref(0)
const projectPage = ref(0)
const activeProjectCategory = ref('all')
const PAGE_SIZE = 6

const corporateTotalPages = computed(() => Math.max(1, Math.ceil(props.corporateItems.length / PAGE_SIZE)))
const filteredProjectItems = computed(() => {
  if (activeProjectCategory.value === 'all') return props.projectItems
  return props.projectItems.filter((item) => categoryKey(certificateCategoryLabel(item)) === activeProjectCategory.value)
})
const projectTotalPages = computed(() => Math.max(1, Math.ceil(filteredProjectItems.value.length / PAGE_SIZE)))
const pagedCorporateItems = computed(() => {
  const startIndex = corporatePage.value * PAGE_SIZE
  return props.corporateItems.slice(startIndex, startIndex + PAGE_SIZE)
})
const pagedProjectItems = computed(() => {
  const startIndex = projectPage.value * PAGE_SIZE
  return filteredProjectItems.value.slice(startIndex, startIndex + PAGE_SIZE)
})
const showCorporatePagination = computed(() => props.corporateItems.length > PAGE_SIZE)
const showProjectPagination = computed(() => filteredProjectItems.value.length > PAGE_SIZE)
const isCorporateFirstPage = computed(() => corporatePage.value === 0)
const isCorporateLastPage = computed(() => corporatePage.value >= corporateTotalPages.value - 1)
const isProjectFirstPage = computed(() => projectPage.value === 0)
const isProjectLastPage = computed(() => projectPage.value >= projectTotalPages.value - 1)
const projectCategoryOptions = computed(() => {
  const categoryMap = new Map([
    ['iso', { key: 'iso', label: 'ISO', count: 0, defaultOrder: 0 }],
    ['ce', { key: 'ce', label: 'CE', count: 0, defaultOrder: 1 }],
  ])
  props.projectItems.forEach((item) => {
    const label = certificateCategoryLabel(item)
    const key = categoryKey(label)
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { key, label, count: 0 })
    }
    categoryMap.get(key).count += 1
  })

  return [
    {
      key: 'all',
      label: t('user.capability.allCategories'),
      count: props.projectItems.length,
    },
    ...Array.from(categoryMap.values()).sort((left, right) => {
      if (Number.isFinite(left.defaultOrder) || Number.isFinite(right.defaultOrder)) {
        return Number(left.defaultOrder ?? 99) - Number(right.defaultOrder ?? 99)
      }
      return left.label.localeCompare(right.label)
    }),
  ]
})
const activeProjectCategoryLabel = computed(() => {
  return projectCategoryOptions.value.find((item) => item.key === activeProjectCategory.value)?.label
    || t('user.capability.allCategories')
})

function prevCorporatePage() {
  if (isCorporateFirstPage.value) return
  corporatePage.value -= 1
}

function nextCorporatePage() {
  if (isCorporateLastPage.value) return
  corporatePage.value += 1
}

function prevProjectPage() {
  if (isProjectFirstPage.value) return
  projectPage.value -= 1
}

function nextProjectPage() {
  if (isProjectLastPage.value) return
  projectPage.value += 1
}

function iconComponent(icon) {
  const normalized = String(icon || '').toLowerCase()
  if (normalized.includes('cog') || normalized.includes('gear')) return Cog
  if (normalized.includes('shield') || normalized.includes('quality')) return ShieldCheck
  if (normalized.includes('box') || normalized.includes('capacity')) return Boxes
  return Factory
}

function certificateCategoryLabel(item) {
  const label = String(item?.category || item?.category_name || item?.group_name || '').trim()
  const normalized = label.toLowerCase()
  if (
    !label
    || normalized === 'iso & ce'
    || normalized === 'qualification certificate'
    || normalized === 'nhà máy sx'
    || normalized === 'chứng chỉ năng lực'
  ) {
    return 'ISO'
  }
  return label
}

function categoryKey(label) {
  return String(label || 'iso-ce')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'iso-ce'
}

function selectProjectCategory(key) {
  activeProjectCategory.value = key
  projectPage.value = 0
}

watch(
  () => props.corporateItems,
  () => {
    corporatePage.value = 0
  },
  { deep: true },
)

watch(
  () => props.projectItems,
  () => {
    if (!projectCategoryOptions.value.some((item) => item.key === activeProjectCategory.value)) {
      activeProjectCategory.value = 'all'
    }
    projectPage.value = 0
  },
  { deep: true },
)

watch(activeTab, () => {
  if (activeTab.value === 'corporate') {
    corporatePage.value = Math.min(corporatePage.value, corporateTotalPages.value - 1)
    return
  }

  projectPage.value = Math.min(projectPage.value, projectTotalPages.value - 1)
})
</script>

<template>
  <section id="page3" class="section section-awards">
    <div class="section-bg"></div>
    <div class="stage">
      <header class="section-top reveal-item">
        <div class="section-top__copy">
          <span class="eyebrow">{{ t('user.capability.techTitle') }}</span>
          <h2>{{ t('user.capability.honorsAwards') }}</h2>
          <p>
            {{ t('user.capability.honorsAwardsDesc') || 'Máy móc, quy trình sản xuất, công suất vận hành và các chứng chỉ ISO, CE.' }}
          </p>
        </div>

        <div class="section-top__aside">
          <div class="tabs" role="tablist" aria-label="Honor awards tabs">
            <button
              type="button"
              :class="{ active: activeTab === 'corporate' }"
              role="tab"
              :aria-selected="activeTab === 'corporate'"
              @click="activeTab = 'corporate'"
            >
              {{ t('user.capability.techTitle') }}
            </button>
            <button
              type="button"
              :class="{ active: activeTab === 'project' }"
              role="tab"
              :aria-selected="activeTab === 'project'"
              @click="activeTab = 'project'"
            >
              {{ t('user.capability.certifications') || 'ISO & CE' }}
            </button>
          </div>
        </div>
      </header>

      <div v-if="activeTab === 'corporate'">
        <div v-if="!corporateItems.length" class="empty">{{ t('user.capability.emptyTechnology') }}</div>
        <template v-else>
          <div class="section-toolbar">
            <div class="section-toolbar__summary">
              <strong>{{ corporateItems.length }}</strong>
              <span>{{ t('user.capability.itemsCount') }} {{ t('user.capability.techTitle').toLowerCase() }}</span>
            </div>

            <div v-if="showCorporatePagination" class="pager" aria-label="Phân trang công nghệ sản xuất">
              <button
                type="button"
                class="pager__btn"
                :disabled="isCorporateFirstPage"
                :aria-label="t('user.capability.prevPageTechnology')"
                @click="prevCorporatePage"
              >
                <ChevronLeft :size="18" />
              </button>
              <span class="pager__status">{{ corporatePage + 1 }} / {{ corporateTotalPages }}</span>
              <button
                type="button"
                class="pager__btn"
                :disabled="isCorporateLastPage"
                :aria-label="t('user.capability.nextPageTechnology')"
                @click="nextCorporatePage"
              >
                <ChevronRight :size="18" />
              </button>
            </div>
          </div>

          <div class="tech-grid">
            <article
              v-for="(item, index) in pagedCorporateItems"
              :key="`corporate-${item.id}`"
              class="tech-card reveal-item"
              :style="{ '--i': index }"
            >
              <div
                v-if="item.image_url || item.image"
                class="tech-card__media"
              >
                <img :src="imageResolver(item.image_url || item.image)" :alt="item.title" />
              </div>
              <div class="tech-card__icon">
                <component :is="iconComponent(item.icon)" :size="22" />
              </div>
              <div class="tech-card__body">
                <h3>{{ item.title }}</h3>
                <p>{{ item.short_description || item.description }}</p>
              </div>
            </article>
          </div>
        </template>
      </div>

      <div v-else>
        <div v-if="!projectItems.length" class="empty">{{ t('user.capability.emptyCertifications') }}</div>
        <template v-else>
          <div v-if="projectCategoryOptions.length > 2" class="certificate-category-tabs" aria-label="Danh mục chứng chỉ">
            <button
              v-for="category in projectCategoryOptions"
              :key="category.key"
              type="button"
              :class="{ active: activeProjectCategory === category.key }"
              @click="selectProjectCategory(category.key)"
            >
              <span>{{ category.label }}</span>
              <strong>{{ category.count }}</strong>
            </button>
          </div>

          <div class="section-toolbar">
            <div class="section-toolbar__summary">
              <strong>{{ filteredProjectItems.length }}</strong>
              <span>{{ activeProjectCategoryLabel }}</span>
            </div>

            <div v-if="showProjectPagination" class="pager" :aria-label="t('user.capability.paginationCertifications')">
              <button
                type="button"
                class="pager__btn"
                :disabled="isProjectFirstPage"
                :aria-label="t('user.capability.prevPageCertifications')"
                @click="prevProjectPage"
              >
                <ChevronLeft :size="18" />
              </button>
              <span class="pager__status">{{ projectPage + 1 }} / {{ projectTotalPages }}</span>
              <button
                type="button"
                class="pager__btn"
                :disabled="isProjectLastPage"
                :aria-label="t('user.capability.nextPageCertifications')"
                @click="nextProjectPage"
              >
                <ChevronRight :size="18" />
              </button>
            </div>
          </div>

          <div v-if="!filteredProjectItems.length" class="empty">{{ t('user.capability.emptyCertifications') }}</div>
          <div v-else class="grid">
            <HonorCard
              v-for="(item, index) in pagedProjectItems"
              :key="`project-${item.id}`"
              :item="item"
              :image-src="imageResolver(item.image_url || item.image)"
              variant="frame"
              class="reveal-item"
              :style="{ '--i': index }"
            />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  position: relative;
  min-height: 100vh;
  padding: 72px 0 56px;
}

.section-bg {
  display: none;
}

.stage {
  position: relative;
  z-index: 1;
  width: min(1080px, calc(100% - 44px));
  margin: 0 auto;
}

.section-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 16px;
  align-items: end;
  margin-bottom: 16px;
}

.section-top__copy {
  max-width: 620px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  color: #c2410c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.section-top h2 {
  margin: 0;
  color: #0f172a;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.7rem, 1.45rem + 0.8vw, 2.45rem);
  line-height: 1.1;
}

.section-top p {
  margin: 8px 0 0;
  max-width: 560px;
  color: #475569;
  font-size: 13px;
  line-height: 1.58;
}

.section-top__aside {
  display: grid;
  gap: 10px;
}

.tabs {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs button {
  min-width: 132px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  cursor: pointer;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.tabs button.active {
  background: linear-gradient(135deg, #dc2626, #f97316);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.14);
}

.tabs button:hover {
  transform: translateY(-1px);
  border-color: rgba(239, 68, 68, 0.18);
}

.grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
}

.tech-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.tech-card {
  min-height: 190px;
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 22px;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.tech-card__media {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: #f8fafc;
}

.tech-card__media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.tech-card__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.tech-card h3 {
  margin: 0;
  color: #0f172a;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 1.3;
}

.tech-card p {
  margin: 8px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.68;
}

.empty {
  color: #475569;
  text-align: left;
  padding: 14px 0 2px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tech-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-top {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .tabs {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .section {
    padding: 40px 0 28px;
  }

  .stage {
    width: calc(100% - 16px);
  }

  .tabs button {
    width: 100%;
    min-width: 0;
  }

  .section-top p {
    font-size: 12px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.section-toolbar__summary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #475569;
}

.section-toolbar__summary strong {
  color: #0f172a;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 28px;
  line-height: 1;
}

.section-toolbar__summary span {
  color: #64748b;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.pager {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.pager__btn {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.pager__btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(239, 68, 68, 0.22);
  background: rgba(254, 242, 242, 0.98);
}

.pager__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager__status {
  min-width: 68px;
  text-align: center;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.certificate-category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 18px;
}

.certificate-category-tabs button {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  border-radius: 999px;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
}

.certificate-category-tabs button.active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #dc2626, #f97316);
}

.certificate-category-tabs strong {
  min-width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  font-size: 11px;
}

.certificate-category-tabs button.active strong {
  background: rgba(255, 255, 255, 0.22);
}

/* ── Reveal Animations ── */
.reveal-item {
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.is-active .reveal-item {
  opacity: 1;
  transform: translateY(0);
}

.is-active .grid .reveal-item {
  transition-delay: calc(var(--i, 0) * 0.1s + 0.3s);
}

.is-active .section-top.reveal-item {
  transition-delay: 0.1s;
}
</style>
