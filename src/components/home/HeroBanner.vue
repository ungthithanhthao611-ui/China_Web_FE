<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { ArrowRight } from 'lucide-vue-next'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1541976844346-f18aeac57b06?q=80&w=2070', // Ảnh đại diện kiến trúc 1
    title: 'Precision in Construction',
    subtitle: 'Creating Architectural Masterpieces Since 1983',
    cta: 'Explore Projects'
  },
  {
    image: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2070', // Ảnh đại diện nội thất 2
    title: 'Innovative Interior Solutions',
    subtitle: 'Redefining the standards of modern living spaces',
    cta: 'Our Services'
  },
  {
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070', // Ảnh đại diện tòa nhà 3
    title: 'Public Space Design',
    subtitle: 'Connecting communities through functional landmarks',
    cta: 'View Portfolio'
  }
]

const modules = [Navigation, Pagination, Autoplay, EffectFade]
</script>

<template>
  <div class="hero-banner">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :pagination="{ clickable: true }"
      :navigation="true"
      :autoplay="{ delay: 6000, disableOnInteraction: false }"
      :speed="1500"
      class="hero-swiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index">
        <div 
          class="zoom-bg" 
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
        
        <div class="overlay"></div>

        <div class="slide-content">
          <div class="container slide-inner">
            <h2 class="animate-down">{{ slide.subtitle }}</h2>
            <h1 class="animate-up">{{ slide.title }}</h1>
            
            <div class="cta-wrap animate-zoom">
              <router-link to="/projects" class="btn-china">
                <span>{{ slide.cta }}</span>
                <ArrowRight class="icon" :size="20" />
              </router-link>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
/* Reset & Base */
.hero-banner {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
  font-family: sans-serif; /* Thêm font cơ bản */
}

.hero-swiper {
  height: 100%;
  width: 100%;
}

/* Hiệu ứng Ken Burns (Zoom ảnh nền) */
.zoom-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 7s linear; /* Zoom rất chậm trong 7 giây */
  z-index: 1;
}

/* Chỉ zoom khi slide đang hiển thị */
:deep(.swiper-slide-active) .zoom-bg {
  transform: scale(1.15);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2;
}

/* Nội dung chữ */
.slide-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-align: center;
  padding: 0 20px;
}

.slide-inner h2 {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-bottom: 20px;
  opacity: 0;
}

.slide-inner h1 {
  font-size: clamp(32px, 5vw, 64px); /* Tự động scale cỡ chữ theo màn hình */
  font-weight: 700;
  margin-bottom: 35px;
  line-height: 1.2;
  opacity: 0;
}

/* Animation khi slide active */
:deep(.swiper-slide-active) .animate-down {
  animation: fadeDown 1s ease forwards 0.5s;
}

:deep(.swiper-slide-active) .animate-up {
  animation: fadeUp 1s ease forwards 0.8s;
}

:deep(.swiper-slide-active) .animate-zoom {
  animation: zoomIn 1s ease forwards 1.2s;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Nút bấm phong cách China Decor */
.btn-china {
  display: inline-flex;
  align-items: center;
  padding: 14px 45px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-china:hover {
  background: #ffffff;
  color: #000000;
}

.btn-china .icon {
  margin-left: 12px;
  transition: transform 0.3s ease;
}

.btn-china:hover .icon {
  transform: translateX(8px);
}

/* Tùy chỉnh Pagination (Dấu gạch ngang dài) */
:deep(.swiper-pagination-bullet) {
  width: 35px;
  height: 2px;
  border-radius: 0;
  background: #fff;
  opacity: 0.4;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  width: 55px;
  background: #e11d48; /* Màu đỏ nổi bật */
}

/* Navigation buttons (Ẩn trên mobile cho sạch) */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #fff;
  transform: scale(0.6);
}

@media (max-width: 768px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none;
  }
}
</style>