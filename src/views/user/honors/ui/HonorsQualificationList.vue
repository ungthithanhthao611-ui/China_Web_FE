<script setup>
import HonorCard from './HonorCard.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  imageResolver: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <section id="page2" class="section section-certificate">
    <div class="section-bg"></div>
    <div class="stage">
      <header class="heading">
        <div class="heading-copy">
          <span class="eyebrow">NĂNG LỰC SẢN XUẤT</span>
          <h2>Hình ảnh nhà máy</h2>
          <p>Hình ảnh thực tế về nhà xưởng, kho bãi và hoạt động vận hành tại hiện trường.</p>
        </div>
      </header>
      <div v-if="!items.length" class="empty">Chưa có hình ảnh nhà máy để hiển thị.</div>
      <div v-else class="grid">
        <HonorCard
          v-for="item in items"
          :key="`qualification-${item.id}`"
          :item="item"
          :image-src="imageResolver(item.image_url)"
          variant="gallery"
        />
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
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(36, 25, 15, 0.92) 0%, rgba(77, 54, 31, 0.88) 40%, rgba(191, 167, 116, 0.76) 100%),
    url('https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/ee391405-cb7a-4434-91fa-fcf427544b97.jpg');
  background-size: cover;
  background-position: center right;
  filter: saturate(0.95);
}

.stage {
  position: relative;
  z-index: 1;
  width: min(1320px, calc(100% - 50px));
  margin: 0 auto;
}

.heading {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 22px;
}

.heading-copy {
  max-width: 760px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.heading h2 {
  margin: 0;
  color: #fff;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(2.2rem, 1.8rem + 1.55vw, 3.4rem);
  line-height: 1.1;
}

.heading p {
  margin: 12px 0 0;
  max-width: 640px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 16px;
  line-height: 1.65;
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
}

.empty {
  color: rgba(255, 255, 255, 0.86);
  text-align: left;
  padding: 22px 0 6px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .section {
    padding: 40px 0 28px;
  }

  .stage {
    width: calc(100% - 22px);
  }

  .heading p {
    font-size: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
