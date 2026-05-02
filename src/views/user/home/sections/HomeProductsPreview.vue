<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { env } from '@/shared/config/env'
import { useSectionReveal } from '@/views/user/home/composables/useSectionReveal'
import { listProducts } from '@/views/user/services/productsApi'

const loading = ref(true)
const items = ref([])
const { locale, t } = useI18n({ useScope: 'global' })
const { rootRef, isVisible } = useSectionReveal({ threshold: 0.1 })
const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')

function resolveAssetUrl(url) {
  const normalized = String(url || '').trim()
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')

function resolveProductImage(product) {
  const primary = String(product?.image_url || '').trim()
  if (primary) return resolveAssetUrl(primary)

  const gallery = Array.isArray(product?.images) ? product.images : []
  return resolveAssetUrl(gallery[0]?.url || '')
}

async function loadProducts() {
  loading.value = true
  try {
    const payload = await listProducts({ skip: 0, limit: 4 })
    const rows = Array.isArray(payload?.items) ? payload.items : []
    items.value = rows.map((row) => {
      let category = row.category_name
      let name = row.name

      if (locale.value !== 'vi') {
        // Category mapping
        const nCat = normalizeText(category).toUpperCase()
        if (nCat.includes('VAN DA')) category = t('user.products.catStone') || 'Stone Texture'
        else if (nCat.includes('VAN VAI')) category = t('user.products.catFabric') || 'Fabric Texture'
        else if (nCat.includes('3D')) category = t('user.products.cat3D') || '3D Texture'
        else if (nCat.includes('XI MANG')) category = t('user.products.catCement') || 'Cement Texture'
        else if (nCat.includes('GACH THE')) category = t('user.products.catBrick') || 'Brick Texture'
        else if (nCat.includes('LINH HOAT')) category = t('user.products.catFlexible') || 'Flexible Cladding'
        
        // Robust Product name mapping
        const n = normalizeText(name)
        let prefix = ''
        if (n.includes('da phien')) prefix = locale.value === 'en' ? 'Slate' : '石板'
        else if (n.includes('da travertine')) prefix = locale.value === 'en' ? 'Travertine' : '洞石'
        else if (n.includes('da xe ranh')) prefix = locale.value === 'en' ? 'Grooved Stone' : '开槽石材'
        else if (n.includes('da van song')) prefix = locale.value === 'en' ? 'Wave Stone' : '波浪纹石材'
        else if (n.includes('da nuoc chay')) prefix = locale.value === 'en' ? 'Water Flow Stone' : '流水石材'
        else if (n.includes('da dacit')) prefix = locale.value === 'en' ? 'Dacite Stone' : '安山岩'
        else if (n.includes('da ') || n.startsWith('da ')) prefix = locale.value === 'en' ? 'Stone' : '石材'
        else if (n.includes('dat nen')) prefix = locale.value === 'en' ? 'Earth Texture' : '地表纹理'
        else if (n.includes('dan tre')) prefix = locale.value === 'en' ? 'Bamboo Woven' : '竹编纹理'
        else if (n.includes('van vai')) prefix = locale.value === 'en' ? 'Fabric Texture' : '织物纹理'
        else if (n.includes('van soi')) prefix = locale.value === 'en' ? 'Fiber Texture' : '纤维纹理'
        else if (n.includes('be tong')) prefix = locale.value === 'en' ? 'Concrete' : '混凝土'

        if (prefix) {
          if (n.includes('3d')) name = prefix + ' 3D'
          else name = prefix
        } else if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(name)) {
          name = normalizeText(name).toUpperCase()
        }
      }
      
      return {
        id: row.id,
        name: name,
        slug: row.slug,
        category: category,
        summary: locale.value === 'vi' ? (row.short_desc || '') : t('user.home.productDescriptionFallback'),
        image: resolveProductImage(row),
      }
    })
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

watch(locale, loadProducts)
onMounted(loadProducts)
</script>

<template>
  <section class="home-products" ref="rootRef">
    <div class="shell home-reveal" :class="{ 'is-visible': isVisible }">
      <header class="section-head" data-reveal-item>
        <p>{{ t('user.home.productEyebrow') }}</p>
        <h2>{{ t('user.home.productsTitle') }}</h2>
        <span class="sub-head">{{ t('user.home.productSubtitle') }}</span>
      </header>

      <div v-if="items.length" class="grid">
        <article v-for="item in items" :key="item.id" class="card" data-reveal-item>
          <router-link :to="`/products/${item.slug}`" class="visual-link">
            <div class="visual">
              <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
              <span class="cat-badge">{{ item.category || t('user.home.products') }}</span>
              <div v-if="!item.image" class="placeholder">P</div>
            </div>
          </router-link>

          <div class="body">
            <p class="category">{{ item.category || 'Product' }}</p>
            <h3>
              <router-link :to="`/products/${item.slug}`">{{ item.name }}</router-link>
            </h3>
            <p class="summary">{{ item.summary || t('user.home.aboutEmpty') }}</p>
            <div class="meta">
              <router-link :to="`/products/${item.slug}`" class="more">
                <span>{{ t('user.home.viewMore') }}</span>
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <div class="foot-actions" data-reveal-item>
        <router-link to="/products" class="btn-primary">
          {{ t('user.home.viewAllProducts') }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Keeping styles as they were */
.home-products {
  padding: 20px 0 80px 0;
  background: #f8faff;
  position: relative;
  overflow: hidden;
}

.section-head {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 64px;
}

.section-head p {
  color: #ee1324;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.section-head h2 {
  color: #1d283d;
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.sub-head {
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.visual {
  position: relative;
  aspect-ratio: 4/5;
  background: #f1f5f9;
  overflow: hidden;
}

.visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.card:hover .visual img {
  transform: scale(1.1);
}

.cat-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: #fff;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  color: #1d283d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.category {
  font-size: 12px;
  color: #ee1324;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.body h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1d283d;
  margin-bottom: 12px;
  line-height: 1.4;
}

.body h3 a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease;
}

.body h3 a:hover {
  color: #ee1324;
}

.summary {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.meta {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.more {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d283d;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: gap 0.3s ease;
}

.more:hover {
  gap: 12px;
}

.foot-actions {
  margin-top: 64px;
  text-align: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background: #ee1324;
  color: #fff;
  padding: 16px 40px;
  border-radius: 100px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(238, 19, 36, 0.2);
}

.btn-primary:hover {
  background: #d0101f;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(238, 19, 36, 0.3);
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .section-head h2 {
    font-size: 32px;
  }
}

@media (max-width: 576px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
