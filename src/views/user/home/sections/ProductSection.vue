<script setup>
import { ref, onMounted } from 'vue'
import { listProductCategories } from '@/views/user/services/productsApi'

const props = defineProps({
  active: Boolean
})

const categories = ref([])
const loading = ref(true)

async function loadData() {
  try {
    const res = await listProductCategories()
    const all = res.items || []
    // Lấy 6 danh mục đầu tiên đang hoạt động
    categories.value = all.filter(c => c.is_active).slice(0, 6)
    
    // Hiện dữ liệu thật, nếu không có thì không hiện gì
    if (!categories.value.length) {
      categories.value = []
    }
  } catch (e) {
    console.error('Failed to load categories', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="product-section" :class="{ 'is-active': active }">
    <div class="container content-grid">
      <div class="header-content">
        <div class="title-wrap">
          <p class="subtitle animate-fade-up">DANH MỤC HỆ THỐNG</p>
          <h2 class="main-title animate-fade-up">SẢN PHẨM <span class="accent">CHÍNH</span></h2>
        </div>
        <p class="description animate-fade-up">
          China Decor cung cấp danh mục sản phẩm hoàn thiện nội thất đa dạng, từ sàn gỗ tự nhiên, hệ tường trần thông minh đến trang thiết bị vệ sinh cao cấp, đáp ứng mọi quy chuẩn kiến trúc hiện đại.
        </p>
        <router-link to="/products" class="view-all animate-fade-up">
          <span>Tất Cả Sản Phẩm</span>
          <div class="btn-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </router-link>
      </div>

      <div class="categories-grid">
        <div 
          v-for="(cat, idx) in categories" 
          :key="cat.slug" 
          class="cat-card animate-stagger"
          :style="{ '--idx': idx }"
        >
          <div class="card-image">
            <img :src="cat.image_url || 'https://placehold.co/600x800?text=Category'" :alt="cat.name">
            <div class="overlay"></div>
          </div>
          <div class="card-info">
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.description }}</p>
            <router-link :to="`/products?category=${cat.slug}`" class="explore-btn">
              Khám Phá
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$accent: #bf9253; // Gold accent
$text-dark: #121212;
$text-gray: #666;

.product-section {
  position: relative;
  width: 100%;
  padding: 100px 0;
  background-color: #fff;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 80px;
  align-items: flex-start;
  position: relative;
  z-index: 5;
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
    gap: 60px;
  }
}

.header-content {
  .subtitle {
    font-size: 14px;
    font-weight: 700;
    color: $accent;
    letter-spacing: 0.2em;
    margin-bottom: 15px;
    display: block;
  }

  .main-title {
    font-size: 56px;
    font-weight: 900;
    color: $text-dark;
    line-height: 1.1;
    margin-bottom: 30px;
    letter-spacing: -0.02em;

    .accent {
      color: $accent;
      display: block;
    }
  }

  .description {
    font-size: 16px;
    line-height: 1.7;
    color: $text-gray;
    margin-bottom: 40px;
    max-width: 360px;
  }
}

.view-all {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  font-weight: 800;
  color: $text-dark;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: 0.3s;

  .btn-arrow {
    width: 54px;
    height: 54px;
    background: $text-dark;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;

    svg { width: 20px; transition: 0.3s; }
  }

  &:hover {
    color: $accent;
    .btn-arrow {
      background: $accent;
      transform: translateX(10px);
    }
  }
}

// Categories Grid
.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.cat-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 4/5;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);

  .card-image {
    position: absolute;
    inset: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%);
      transition: 0.4s;
    }
  }

  .card-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 30px;
    color: #fff;
    transform: translateY(40px);
    transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);

    h3 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      line-height: 1.5;
      margin-bottom: 20px;
      opacity: 0;
      transition: 0.3s;
    }

    .explore-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      text-decoration: none;
      opacity: 0;
      transition: 0.3s;

      svg { width: 18px; color: $accent; }
    }
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(191, 146, 83, 0.2);

    .card-image img {
      transform: scale(1.1);
    }

    .card-info {
      transform: translateY(0);
      p { opacity: 1; }
      .explore-btn { opacity: 1; }
    }
  }
}

// Background
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.1;
  }

  .circle-1 {
    width: 500px; height: 500px;
    background: $accent;
    top: -200px; right: -100px;
  }

  .circle-2 {
    width: 400px; height: 400px;
    background: #000;
    bottom: -150px; left: -100px;
  }
}

// Animations
.animate-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: 1s cubic-bezier(0.23, 1, 0.32, 1);
}

.animate-stagger {
  opacity: 0;
  transform: translateY(40px);
  transition: 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: calc(var(--idx) * 0.15s);
}

.is-active {
  .animate-fade-up, .animate-stagger {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
