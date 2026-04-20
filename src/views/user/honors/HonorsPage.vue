<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { env } from '@/shared/config/env'
import { getContacts } from '@/views/user/services/publicApi'
import { getHonorsPageData } from '@/views/user/services/honorsApi'
import HonorsAwardsTabs from '@/views/user/honors/ui/HonorsAwardsTabs.vue'
import HonorsHeroSection from '@/views/user/honors/ui/HonorsHeroSection.vue'
import HonorsQualificationList from '@/views/user/honors/ui/HonorsQualificationList.vue'
import HonorCard from '@/views/user/honors/ui/HonorCard.vue'

const route = useRoute()
const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')

const honorSections = [
  { id: 'page1', label: 'Top' },
  { id: 'page2', label: 'Hình ảnh nhà máy' },
  { id: 'page2b', label: 'Địa chỉ nhà máy' },
  { id: 'page2c', label: 'Công suất' },
  { id: 'page2d', label: 'Công nghệ sản xuất' },
  { id: 'page3', label: 'Chứng nhận & Năng lực' },
]

const activeSection = ref('page1')
const loading = ref(false)

const hero = ref({
  title: 'NĂNG LỰC',
  description: 'Hình ảnh nhà máy, công nghệ sản xuất, công suất thực tế và các chứng nhận ISO, CE.',
  background:
    'https://res.cloudinary.com/db1b15yn4/image/upload/v1776695465/width_1600_1_kqfqbl.png',
  mobile_background:
    'https://res.cloudinary.com/db1b15yn4/image/upload/v1776695465/width_1600_1_kqfqbl.png',
  accent:
    'https://omo-oss-image.thefastimg.com/portal-saas/ngc202303290005/cms/image/53e45437-3eaa-453a-87e7-5d86b6f29064.png',
})
const qualificationItems = ref([])
const factoryLocationItems = ref([])
const outputItems = ref([])
const technologyItems = ref([])
const corporateItems = ref([])
const projectItems = ref([])
const contacts = ref([])
const primaryContact = ref(null)

const fallbackFactoryImages = [
  {
    id: 'factory-1',
    title: 'Hình ảnh nhà máy',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776693986/Image_20260418142412_7_3_umh4bn.jpg',
    year: null,
    issued_by: null,
  },
  {
    id: 'factory-2',
    title: 'Hình ảnh nhà máy',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776694010/Image_20260418142413_8_3_jzz2fe.jpg',
    year: null,
    issued_by: null,
  },
  {
    id: 'factory-3',
    title: 'Hình ảnh nhà máy',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776694034/Image_20260418142413_9_3_m65uzj.jpg',
    year: null,
    issued_by: null,
  },
  {
    id: 'factory-4',
    title: 'Hình ảnh nhà máy',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776694061/Image_20260418142414_10_3_rj9klh.jpg',
    year: null,
    issued_by: null,
  },
]

const fallbackFactoryLocation = [
  {
    id: 'factory-location',
    title: 'Địa chỉ nhà máy',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776693986/Image_20260418142412_7_3_umh4bn.jpg',
    short_description: 'Beijing / Industrial zone / China',
    issued_by: 'Factory location',
  },
]

const fallbackOutputItems = [
  {
    id: 'factory-output',
    title: 'Công suất',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776694010/Image_20260418142413_8_3_jzz2fe.jpg',
    short_description: 'Năng lực sản xuất ổn định cho đơn hàng số lượng lớn.',
    issued_by: 'Output',
  },
]

const fallbackTechnologyItems = [
  {
    id: 'factory-tech',
    title: 'Công nghệ sản xuất',
    image_url: 'https://res.cloudinary.com/db1b15yn4/image/upload/v1776694061/Image_20260418142414_10_3_rj9klh.jpg',
    short_description: 'Máy móc, quy trình và dây chuyền hiện đại.',
    issued_by: 'Production technology',
  },
]

const outputMetrics = [
  { id: 'output-1', value: '30,000+', label: 'm2 / tháng' },
  { id: 'output-2', value: '24', label: 'giờ vận hành' },
  { id: 'output-3', value: '3', label: 'dây chuyền chính' },
  { id: 'output-4', value: '98%', label: 'độ ổn định đơn hàng' },
]

function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

function buildOsmEmbedUrl(latitude, longitude) {
  const latitudeDelta = 0.0018
  const longitudeDelta = 0.0031
  const minLongitude = encodeURIComponent((longitude - longitudeDelta).toFixed(6))
  const minLatitude = encodeURIComponent((latitude - latitudeDelta).toFixed(6))
  const maxLongitude = encodeURIComponent((longitude + longitudeDelta).toFixed(6))
  const maxLatitude = encodeURIComponent((latitude + latitudeDelta).toFixed(6))
  const marker = encodeURIComponent(`${latitude.toFixed(6)},${longitude.toFixed(6)}`)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLongitude}%2C${minLatitude}%2C${maxLongitude}%2C${maxLatitude}&layer=mapnik&marker=${marker}`
}

function parseCoordinate(value, axis) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return null
  if (axis === 'lat' && (parsed < -90 || parsed > 90)) return null
  if (axis === 'lng' && (parsed < -180 || parsed > 180)) return null
  return parsed
}

const factoryMapEmbed = ref('')
const factoryAddressText = ref('')

function handleScroll() {
  const scrollCenter = window.scrollY + window.innerHeight * 0.45
  for (const item of honorSections) {
    const element = document.getElementById(item.id)
    if (!element) continue
    const top = element.offsetTop
    const bottom = top + element.offsetHeight
    if (scrollCenter >= top && scrollCenter < bottom) {
      activeSection.value = item.id
      break
    }
  }
}

function scrollToSection(id) {
  const section = document.getElementById(id)
  if (!section) return
  const top = section.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'smooth' })
  window.history.replaceState(null, '', `/honors#${id}`)
}

async function syncHashSection() {
  await nextTick()
  const hash = route.hash?.replace('#', '')
  if (hash && honorSections.some((item) => item.id === hash)) {
    scrollToSection(hash)
    return
  }
  handleScroll()
}

async function loadHonors() {
  loading.value = true
  try {
    const contactsPayload = await getContacts()
    contacts.value = Array.isArray(contactsPayload?.items) ? contactsPayload.items : []
    primaryContact.value = contacts.value.find((item) => item?.is_primary) || contacts.value[0] || null

    if (primaryContact.value) {
      const lat = parseCoordinate(primaryContact.value.latitude, 'lat')
      const lng = parseCoordinate(primaryContact.value.longitude, 'lng')
      factoryMapEmbed.value =
        lat !== null && lng !== null
          ? buildOsmEmbedUrl(lat, lng)
          : String(primaryContact.value.map_url || '').trim()
      factoryAddressText.value =
        [primaryContact.value.name, primaryContact.value.address, primaryContact.value.phone]
          .filter(Boolean)
          .join(' • ')
    }

    const payload = await getHonorsPageData()
    hero.value = {
      ...hero.value,
      ...(payload?.hero || {}),
    }
    qualificationItems.value = (payload?.sections?.qualification_certificates || []).length
      ? payload.sections.qualification_certificates
      : fallbackFactoryImages
    factoryLocationItems.value = fallbackFactoryLocation
    outputItems.value = fallbackOutputItems
    technologyItems.value = fallbackTechnologyItems
    corporateItems.value = payload?.sections?.corporate_honors || []
    projectItems.value = payload?.sections?.project_honors || []
  } finally {
    loading.value = false
  }
}

watch(
  () => route.hash,
  () => {
    syncHashSection()
  },
)

watch(activeSection, (value) => {
  if (route.path === '/honors') {
    window.history.replaceState(null, '', `/honors#${value}`)
  }
})

onMounted(async () => {
  await loadHonors()
  handleScroll()
  syncHashSection()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <main class="honors-page">
    <aside class="dots" aria-label="Honors section navigation">
      <button
        v-for="item in honorSections"
        :key="item.id"
        class="dots__item"
        :class="{ active: activeSection === item.id }"
        type="button"
        :aria-label="`Go to ${item.label}`"
        @click="scrollToSection(item.id)"
      >
        <span></span>
      </button>
    </aside>

    <HonorsHeroSection :hero="hero" @go-section="scrollToSection" />
    <HonorsQualificationList :items="qualificationItems" :image-resolver="resolveImageUrl" />
    <section id="page2b" class="capability-section capability-section--light capability-section--full">
      <div class="stage capability-stage">
        <header class="capability-heading">
          <span class="eyebrow">NĂNG LỰC SẢN XUẤT</span>
          <h2>Địa chỉ nhà máy</h2>
          <p>Thông tin vị trí nhà xưởng và khu vận hành chính của doanh nghiệp.</p>
        </header>
        <div class="location-layout">
          <div class="location-map">
            <iframe :src="factoryMapEmbed || 'https://www.openstreetmap.org/export/embed.html?bbox=116.4378%2C39.9087%2C116.4439%2C39.9124&layer=mapnik&marker=39.910466%2C116.44079'" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div class="location-copy">
            <div class="location-meta">Location</div>
            <h3>{{ primaryContact?.name || 'Factory location' }}</h3>
            <p>{{ primaryContact?.address || 'Đang cập nhật địa chỉ nhà máy.' }}</p>
            <div class="location-chip" v-if="factoryAddressText">{{ factoryAddressText }}</div>
          </div>
        </div>
      </div>
    </section>
    <section id="page2c" class="capability-section capability-section--dark capability-section--full">
      <div class="stage capability-stage">
        <header class="capability-heading">
          <span class="eyebrow">NĂNG LỰC SẢN XUẤT</span>
          <h2>Công suất</h2>
          <p>Thể hiện năng lực output và khả năng đáp ứng đơn hàng.</p>
        </header>
        <div class="output-grid">
          <div v-for="metric in outputMetrics" :key="metric.id" class="output-card">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>
      </div>
    </section>
    <section id="page2d" class="capability-section capability-section--light capability-section--full">
      <div class="stage capability-stage">
        <header class="capability-heading">
          <span class="eyebrow">NĂNG LỰC SẢN XUẤT</span>
          <h2>Công nghệ sản xuất</h2>
          <p>Máy móc, dây chuyền và quy trình sản xuất thực tế.</p>
        </header>
        <div class="capability-grid">
          <HonorCard
            v-for="item in technologyItems"
            :key="item.id"
            :item="item"
            :image-src="resolveImageUrl(item.image_url)"
            variant="gallery"
          />
        </div>
      </div>
    </section>
    <HonorsAwardsTabs
      :corporate-items="corporateItems"
      :project-items="projectItems"
      :image-resolver="resolveImageUrl"
    />

    <div v-if="loading" class="loading-mask">Loading honors...</div>
  </main>
</template>

<style scoped>
.honors-page {
  position: relative;
  background: #1e1408;
  color: #fff;
}

.dots {
  position: fixed;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dots__item {
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.dots__item span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
}

.dots__item.active span,
.dots__item:hover span {
  width: 12px;
  height: 12px;
  background: #df0019;
}

.loading-mask {
  position: fixed;
  inset: auto 20px 20px auto;
  z-index: 40;
  background: rgba(11, 23, 39, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 8px 14px;
  color: #fff;
  font-size: 13px;
}

@media (max-width: 767px) {
  .dots {
    right: 8px;
    gap: 8px;
  }
}

.capability-section {
  position: relative;
  min-height: 100vh;
  padding: 72px 0 56px;
  display: flex;
  align-items: center;
}

.capability-section--light {
  background: linear-gradient(180deg, rgba(255, 250, 244, 0.98), rgba(248, 241, 230, 0.98));
}

.capability-section--dark {
  background: linear-gradient(180deg, rgba(31, 21, 11, 0.98), rgba(58, 41, 23, 0.98));
}

.capability-stage {
  width: min(1320px, calc(100% - 50px));
  margin: 0 auto;
}

.capability-heading {
  margin-bottom: 22px;
}

.capability-heading .eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.capability-heading h2 {
  margin: 0;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 1.7rem + 1vw, 3rem);
  line-height: 1.1;
}

.capability-section--light .capability-heading h2 {
  color: #1f2735;
}

.capability-section--dark .capability-heading h2,
.capability-section--dark .capability-heading p,
.capability-section--dark .capability-heading .eyebrow {
  color: rgba(255, 255, 255, 0.9);
}

.capability-heading p {
  margin: 10px 0 0;
  max-width: 700px;
  font-size: 15px;
  line-height: 1.65;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 18px;
}

.location-layout {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 22px;
  align-items: stretch;
}

.location-map {
  min-height: 560px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 44px rgba(18, 12, 6, 0.18);
}

.location-map iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.location-copy {
  border-radius: 28px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  color: #1f2735;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.location-meta {
  color: #d90017;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.location-copy h3 {
  margin: 0;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
}

.location-copy p {
  margin: 0;
  color: rgba(31, 39, 53, 0.82);
  line-height: 1.7;
}

.location-chip {
  display: inline-flex;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(215, 0, 15, 0.1);
  color: #9e0011;
  font-size: 13px;
  font-weight: 600;
}

.output-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.output-card {
  padding: 24px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  text-align: left;
  box-shadow: 0 16px 34px rgba(19, 12, 6, 0.16);
}

.output-card strong {
  display: block;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 1.5rem + 1.8vw, 3.4rem);
  line-height: 1;
}

.output-card span {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

@media (min-width: 900px) {
  .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .location-layout {
    grid-template-columns: 1.35fr 0.65fr;
  }
}

@media (max-width: 767px) {
  .capability-section {
    min-height: auto;
    padding: 40px 0 28px;
  }

  .capability-stage {
    width: calc(100% - 22px);
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }

  .location-layout,
  .output-grid {
    grid-template-columns: 1fr;
  }

  .location-map {
    min-height: 360px;
  }
}
</style>


