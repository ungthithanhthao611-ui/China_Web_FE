<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRight, Home, ZoomIn, X, ChevronLeft, Send, Download, Play, Package } from 'lucide-vue-next'
import { uiState } from '@/shared/utils/uiState'
import { getProduct } from '@/client/services/productsApi'
import InquiryModal from './components/InquiryModal.vue'

const props = defineProps({ slug: { type: String, required: true } })
const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const activeImageIndex = ref(0)
const lightboxOpen = ref(false)
const showInquiry = ref(false)

const currentImage = computed(() => product.value?.images?.[activeImageIndex.value] || null)
const hasVideo = computed(() => !!product.value?.video_url)
const hasPdf = computed(() => !!product.value?.catalog_pdf_url)

async function fetchProduct() {
  loading.value = true
  error.value = null
  try {
    const data = await getProduct(props.slug)
    product.value = data
    activeImageIndex.value = 0
  } catch (err) {
    error.value = err.message || 'Không thể tải sản phẩm'
    product.value = null
  } finally {
    loading.value = false
  }
}

function openLightbox(index) {
  activeImageIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function prevImage() {
  const total = product.value?.images?.length || 0
  activeImageIndex.value = (activeImageIndex.value - 1 + total) % total
}

function nextImage() {
  const total = product.value?.images?.length || 0
  activeImageIndex.value = (activeImageIndex.value + 1) % total
}

// Mở inquiry modal nếu có query param
watch(() => route.query.inquiry, (val) => {
  if (val === '1') showInquiry.value = true
}, { immediate: true })

watch(() => props.slug, fetchProduct)

onMounted(() => {
  uiState.isHeaderHidden = false
  uiState.isFooterHidden = false
  fetchProduct()
})
</script>

<template>
  <div class="prod-detail">
    <!-- Loading -->
    <div v-if="loading" class="prod-detail__loading">
      <div class="loading-spinner" />
      <p>Đang tải sản phẩm...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="prod-detail__error">
      <Package :size="48" stroke-width="1.2" />
      <h2>{{ error }}</h2>
      <router-link to="/products" class="back-btn">← Quay lại danh sách</router-link>
    </div>

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="prod-detail__breadcrumb">
        <router-link to="/"><Home :size="14" />Trang Chủ</router-link>
        <ChevronRight :size="13" />
        <router-link to="/products">Sản Phẩm</router-link>
        <ChevronRight :size="13" />
        <span v-if="product.category_name">
          <router-link :to="`/products?category=${product.category_id}`">{{ product.category_name }}</router-link>
          <ChevronRight :size="13" />
        </span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <!-- Main content -->
      <div class="prod-detail__shell">
        <!-- Gallery -->
        <div class="prod-gallery">
          <!-- Main image -->
          <div class="prod-gallery__main" @click="openLightbox(activeImageIndex)">
            <img
              v-if="currentImage"
              :src="currentImage.url"
              :alt="currentImage.alt || product.name"
            />
            <div class="prod-gallery__zoom-hint"><ZoomIn :size="20" />Nhấn để phóng to</div>
          </div>
          <!-- Thumbnails -->
          <div v-if="product.images?.length > 1" class="prod-gallery__thumbs">
            <button
              v-for="(img, index) in product.images"
              :key="index"
              :class="['thumb-btn', { active: activeImageIndex === index }]"
              @click="activeImageIndex = index"
              :aria-label="`Xem ảnh ${index + 1}`"
            >
              <img :src="img.url" :alt="img.alt || `Ảnh ${index + 1}`" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="prod-info">
          <div class="prod-info__category" v-if="product.category_name">{{ product.category_name }}</div>
          <h1 class="prod-info__name">{{ product.name }}</h1>
          <p class="prod-info__sku">Mã SKU: <strong>{{ product.sku }}</strong></p>
          <div class="prod-info__divider" />
          <p class="prod-info__short-desc">{{ product.short_desc }}</p>

          <!-- Specs -->
          <div class="prod-specs">
            <h3 class="prod-specs__title">Thông Số Kỹ Thuật</h3>
            <dl class="prod-specs__list">
              <template v-if="product.size">
                <dt>Kích thước</dt><dd>{{ product.size }}</dd>
              </template>
              <template v-if="product.material">
                <dt>Chất liệu</dt><dd>{{ product.material }}</dd>
              </template>
              <template v-if="product.color">
                <dt>Màu sắc</dt><dd>{{ product.color }}</dd>
              </template>
              <template v-if="product.use_case">
                <dt>Ứng dụng</dt><dd>{{ product.use_case }}</dd>
              </template>
            </dl>
          </div>

          <!-- Actions -->
          <div class="prod-actions">
            <button class="btn-inquiry" @click="showInquiry = true">
              <Send :size="16" />
              Gửi Yêu Cầu Báo Giá
            </button>
            <a
              v-if="hasPdf"
              :href="product.catalog_pdf_url"
              target="_blank"
              rel="noopener"
              class="btn-catalog"
            >
              <Download :size="16" />
              Tải Catalog PDF
            </a>
          </div>
        </div>
      </div>

      <!-- Full description -->
      <div v-if="product.full_desc" class="prod-detail__desc">
        <div class="prod-detail__desc-inner">
          <h2>Mô Tả Chi Tiết</h2>
          <div class="prod-detail__desc-line" />
          <p>{{ product.full_desc }}</p>
        </div>
      </div>

      <!-- Video -->
      <div v-if="hasVideo" class="prod-video-section">
        <div class="prod-video-inner">
          <div class="section-label"><Play :size="16" />Video Demo</div>
          <div class="prod-video-wrap">
            <iframe
              :src="product.video_url"
              title="Product Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <!-- Related products -->
      <div v-if="product.related_products?.length" class="prod-related">
        <div class="prod-related__header">
          <h2>Sản Phẩm Liên Quan</h2>
          <div class="prod-detail__desc-line" />
        </div>
        <div class="prod-related__grid">
          <article v-for="rel in product.related_products" :key="rel.id" class="rel-card">
            <router-link :to="`/products/${rel.slug}`" class="rel-card__img">
              <img :src="rel.images?.[0]?.url" :alt="rel.name" loading="lazy" />
            </router-link>
            <div class="rel-card__body">
              <p class="rel-card__sku">{{ rel.sku }}</p>
              <router-link :to="`/products/${rel.slug}`" class="rel-card__name">{{ rel.name }}</router-link>
            </div>
          </article>
        </div>
      </div>
    </template>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox__close" @click="closeLightbox" aria-label="Đóng"><X :size="28" /></button>
        <button class="lightbox__prev" @click="prevImage" aria-label="Ảnh trước"><ChevronLeft :size="32" /></button>
        <div class="lightbox__img-wrap">
          <img :src="currentImage?.url" :alt="currentImage?.alt || product?.name" />
        </div>
        <button class="lightbox__next" @click="nextImage" aria-label="Ảnh tiếp"><ChevronRight :size="32" /></button>
        <div class="lightbox__counter">{{ activeImageIndex + 1 }} / {{ product?.images?.length }}</div>
      </div>
    </Teleport>

    <!-- Inquiry Modal -->
    <InquiryModal
      v-if="showInquiry"
      :product-name="product?.name"
      :product-sku="product?.sku"
      @close="showInquiry = false; router.replace({ query: {} })"
    />
  </div>
</template>

<style scoped>
.prod-detail {
  min-height: 100vh;
  background: #faf8f5;
}

/* Loading / Error */
.prod-detail__loading,
.prod-detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  color: #9ca3af;
}

.loading-spinner {
  width: 42px; height: 42px;
  border: 3px solid #f0ebe3;
  border-top-color: #c40011;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.prod-detail__error h2 { margin: 0; color: #4a5568; }
.back-btn {
  padding: 10px 20px;
  border: 1.5px solid #ddd5c8;
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}
.back-btn:hover { border-color: #1d283d; color: #1d283d; }

/* Breadcrumb */
.prod-detail__breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 1480px;
  margin: 0 auto;
  padding: 20px 24px 0;
  color: #9ca3af;
  font-size: 13px;
}

.prod-detail__breadcrumb a {
  display: inline-flex; align-items: center; gap: 4px;
  color: #9ca3af; text-decoration: none; transition: color 0.2s;
}
.prod-detail__breadcrumb a:hover { color: #c40011; }
.prod-detail__breadcrumb .current { color: #4a5568; font-weight: 500; }

/* Main shell */
.prod-detail__shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  max-width: 1480px;
  margin: 0 auto;
  padding: 32px 24px 0;
}

/* Gallery */
.prod-gallery__main {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: #f0ebe3;
  cursor: zoom-in;
  box-shadow: 0 4px 20px rgba(29,40,61,0.1);
}
.prod-gallery__main img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.prod-gallery__main:hover img { transform: scale(1.03); }
.prod-gallery__zoom-hint {
  position: absolute;
  bottom: 14px; right: 14px;
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(29,40,61,0.65);
  color: rgba(255,255,255,0.85);
  font-size: 12px;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.prod-gallery__thumbs {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.thumb-btn {
  width: 72px; height: 56px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.2s;
  background: #f0ebe3;
}
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
.thumb-btn.active { border-color: #c40011; }
.thumb-btn:hover:not(.active) { border-color: #ddd5c8; }

/* Product Info */
.prod-info__category {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(196,0,17,0.1);
  color: #c40011;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.prod-info__name {
  margin: 0 0 8px;
  color: #1d283d;
  font-family: 'Times New Roman', serif;
  font-size: clamp(1.6rem, 2vw, 2.2rem);
  font-weight: 700;
  line-height: 1.3;
}
.prod-info__sku {
  margin: 0 0 4px;
  color: #9ca3af;
  font-size: 13px;
}
.prod-info__sku strong { color: #6b7280; }
.prod-info__divider {
  width: 40px; height: 3px;
  background: #c40011;
  margin: 18px 0;
  border-radius: 2px;
}
.prod-info__short-desc {
  margin: 0 0 24px;
  color: #4a5568;
  font-size: 15px;
  line-height: 1.7;
}

/* Specs */
.prod-specs { margin-bottom: 28px; }
.prod-specs__title {
  margin: 0 0 14px;
  color: #1d283d;
  font-size: 15px;
  font-weight: 600;
}
.prod-specs__list {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px 16px;
  margin: 0;
  padding: 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9e3db;
}
.prod-specs__list dt {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}
.prod-specs__list dd {
  margin: 0;
  color: #1d283d;
  font-size: 13px;
  line-height: 1.5;
}

/* Actions */
.prod-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-inquiry, .btn-catalog {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.22s;
}
.btn-inquiry {
  background: #c40011;
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(196,0,17,0.3);
}
.btn-inquiry:hover {
  background: #a8000e;
  box-shadow: 0 6px 18px rgba(196,0,17,0.4);
  transform: translateY(-1px);
}
.btn-catalog {
  border: 1.5px solid #1d283d;
  color: #1d283d;
  background: transparent;
}
.btn-catalog:hover {
  background: #1d283d;
  color: #fff;
}

/* Full Description */
.prod-detail__desc {
  margin-top: 52px;
  padding: 48px 0;
  background: #fff;
}
.prod-detail__desc-inner {
  max-width: 1480px;
  margin: 0 auto;
  padding: 0 24px;
}
.prod-detail__desc-inner h2 {
  margin: 0 0 10px;
  color: #1d283d;
  font-family: 'Times New Roman', serif;
  font-size: 1.8rem;
}
.prod-detail__desc-line {
  width: 40px; height: 3px;
  background: #c40011;
  margin-bottom: 20px;
  border-radius: 2px;
}
.prod-detail__desc-inner p {
  color: #4a5568;
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  white-space: pre-line;
}

/* Video */
.prod-video-section {
  padding: 48px 0;
  background: #1d283d;
}
.prod-video-inner {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 24px;
}
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #d6b888;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.prod-video-wrap {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  border-radius: 12px;
  overflow: hidden;
}
.prod-video-wrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Related */
.prod-related {
  max-width: 1480px;
  margin: 0 auto;
  padding: 52px 24px 60px;
}
.prod-related__header {
  margin-bottom: 28px;
}
.prod-related__header h2 {
  margin: 0 0 10px;
  color: #1d283d;
  font-family: 'Times New Roman', serif;
  font-size: 1.8rem;
}
.prod-related__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.rel-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(29,40,61,0.07);
  transition: transform 0.22s, box-shadow 0.22s;
}
.rel-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(29,40,61,0.12);
}
.rel-card__img {
  display: block;
  aspect-ratio: 4/3;
  overflow: hidden;
}
.rel-card__img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.3s;
}
.rel-card:hover .rel-card__img img { transform: scale(1.05); }
.rel-card__body { padding: 12px 14px; }
.rel-card__sku {
  margin: 0 0 4px;
  color: #9ca3af;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.rel-card__name {
  display: block;
  color: #1d283d;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  line-height: 1.4;
  transition: color 0.2s;
}
.rel-card__name:hover { color: #c40011; }

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}
.lightbox__img-wrap {
  max-width: 90vw;
  max-height: 88vh;
}
.lightbox__img-wrap img {
  max-width: 100%;
  max-height: 88vh;
  object-fit: contain;
  border-radius: 4px;
}
.lightbox__close {
  position: fixed;
  top: 20px; right: 20px;
  border: none;
  background: rgba(255,255,255,0.12);
  color: #fff;
  width: 46px; height: 46px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.lightbox__close:hover { background: rgba(255,255,255,0.24); }
.lightbox__prev,
.lightbox__next {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(255,255,255,0.1);
  color: #fff;
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.lightbox__prev { left: 20px; }
.lightbox__next { right: 20px; }
.lightbox__prev:hover,
.lightbox__next:hover { background: rgba(255,255,255,0.2); }
.lightbox__counter {
  position: fixed;
  bottom: 24px; left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.72);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 900px) {
  .prod-detail__shell {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
