<script setup>
import { ref } from 'vue'
import HonorCard from './HonorCard.vue'

defineProps({
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
</script>

<template>
  <section id="page3" class="section section-awards">
    <div class="section-bg"></div>
    <div class="stage">
      <header class="section-top">
        <div class="section-top__copy">
          <span class="eyebrow">CÔNG NGHỆ - CHỨNG NHẬN</span>
          <h2>Chứng nhận & Năng lực</h2>
          <p>Máy móc, quy trình sản xuất, công suất vận hành và các chứng chỉ ISO, CE theo tiêu chuẩn dự án.</p>
        </div>

        <div class="tabs" role="tablist" aria-label="Honor awards tabs">
          <button
            type="button"
            :class="{ active: activeTab === 'corporate' }"
            role="tab"
            :aria-selected="activeTab === 'corporate'"
            @click="activeTab = 'corporate'"
          >
            Công nghệ sản xuất
          </button>
          <button
            type="button"
            :class="{ active: activeTab === 'project' }"
            role="tab"
            :aria-selected="activeTab === 'project'"
            @click="activeTab = 'project'"
          >
            ISO & CE
          </button>
        </div>
      </header>

      <div v-if="activeTab === 'corporate'">
        <div v-if="!corporateItems.length" class="empty">Chưa có nội dung công nghệ sản xuất.</div>
        <div v-else class="grid">
          <HonorCard
            v-for="item in corporateItems"
            :key="`corporate-${item.id}`"
            :item="item"
            :image-src="imageResolver(item.image_url)"
            variant="frame"
          />
        </div>
      </div>

      <div v-else>
        <div v-if="!projectItems.length" class="empty">Chưa có chứng nhận ISO & CE.</div>
        <div v-else class="grid">
          <HonorCard
            v-for="item in projectItems"
            :key="`project-${item.id}`"
            :item="item"
            :image-src="imageResolver(item.image_url)"
            variant="frame"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  position: relative;
  min-height: 100vh;
  padding: 56px 0 46px;
}

.section-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(28, 21, 14, 0.94) 0%, rgba(61, 50, 36, 0.88) 38%, rgba(164, 142, 105, 0.7) 100%),
    url('https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/ee391405-cb7a-4434-91fa-fcf427544b97.jpg');
  background-size: cover;
  background-position: center right;
  filter: saturate(0.92);
}

.stage {
  position: relative;
  z-index: 1;
  width: min(1320px, calc(100% - 50px));
  margin: 0 auto;
}

.section-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px 24px;
  align-items: end;
  margin-bottom: 16px;
}

.section-top__copy {
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

.section-top h2 {
  margin: 0;
  color: #fff;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.9rem, 1.55rem + 1vw, 2.7rem);
  line-height: 1.1;
}

.section-top p {
  margin: 12px 0 0;
  max-width: 660px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 16px;
  line-height: 1.65;
}

.tabs {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.tabs button {
  min-width: 150px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.tabs button.active {
  background: linear-gradient(135deg, #d90017, #9e0011);
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(217, 0, 23, 0.22);
}

.tabs button:hover {
  transform: translateY(-1px);
}

.grid {
  display: grid;
  gap: 18px;
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
    padding: 38px 0 28px;
  }

  .stage {
    width: calc(100% - 22px);
  }

  .tabs button {
    min-width: 140px;
  }

  .section-top p {
    font-size: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
