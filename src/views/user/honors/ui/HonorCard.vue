<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'frame',
  },
})

const frameImage =
  'https://en.sinodecor.com/repository/portal-local/ngc202304190002/cms/image/e936f2ab-1a31-4886-93cf-1a067c709aa5.png'
</script>

<template>
  <article :class="['honor-card', `honor-card--${variant}`]">
    <div class="honor-card__visual">
      <div class="honor-card__image-shell">
        <template v-if="variant === 'frame'">
          <img class="honor-card__frame" :src="frameImage" alt="" aria-hidden="true" />
          <div class="honor-card__inner">
            <img v-if="imageSrc" :src="imageSrc" :alt="item.title" />
          </div>
        </template>
        <template v-else>
          <div class="honor-card__gallery">
            <img v-if="imageSrc" :src="imageSrc" :alt="item.title" />
            <div class="honor-card__gallery-overlay">
              <span>Factory Space</span>
              <strong>{{ item.title }}</strong>
            </div>
          </div>
        </template>
      </div>
      <div class="honor-card__badge" :class="{ 'honor-card__badge--gallery': variant === 'gallery' }">
        <span>{{ variant === 'gallery' ? 'Factory' : 'Certificate' }}</span>
      </div>
    </div>
    <div v-if="variant !== 'gallery'" class="honor-card__content">
      <h3>{{ item.title }}</h3>
      <p v-if="item.year || item.issued_by" class="meta">
        <span v-if="item.year">{{ item.year }}</span>
        <span v-if="item.issued_by">{{ item.issued_by }}</span>
      </p>
      <p v-if="item.short_description || item.description" class="summary">
        {{ item.short_description || item.description }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.honor-card {
  display: grid;
  gap: 16px;
}

.honor-card__visual {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: grid;
  place-items: center;
}

.honor-card__image-shell {
  position: relative;
  width: 100%;
  max-width: 320px;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.honor-card--frame .honor-card__image-shell {
  padding: 12px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98)),
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 36%);
  border: 1px solid rgba(226, 232, 240, 0.96);
  box-shadow:
    0 12px 24px rgba(15, 23, 42, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.honor-card:hover .honor-card__image-shell {
  transform: translateY(-3px);
}

.honor-card--frame:hover .honor-card__image-shell {
  box-shadow:
    0 16px 28px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.98);
}

.honor-card--gallery .honor-card__image-shell {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.07);
  border: 1px solid rgba(226, 232, 240, 0.96);
}

.honor-card--gallery:hover .honor-card__image-shell {
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.1);
}

.honor-card__frame {
  display: none;
}

.honor-card__inner {
  position: relative;
  aspect-ratio: 1.08 / 0.82;
  overflow: hidden;
  border-radius: 15px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(226, 232, 240, 0.98));
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.96);
}

.honor-card__gallery {
  position: relative;
  width: 100%;
  aspect-ratio: 0.84;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.98);
}

.honor-card__gallery img,
.honor-card__inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.honor-card__gallery-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 3px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(15, 23, 42, 0.68));
}

.honor-card__gallery-overlay span {
  color: rgba(255, 244, 230, 0.92);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.honor-card__gallery-overlay strong {
  color: #fff;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.28;
}

.honor-card__badge {
  position: absolute;
  left: 12px;
  top: 12px;
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.96);
}

.honor-card__badge--gallery {
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border-color: transparent;
}

.honor-card__content {
  display: grid;
  gap: 6px;
  padding: 0 3px;
}

.honor-card h3 {
  margin: 0;
  color: #0f172a;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.92rem, 0.88rem + 0.16vw, 1rem);
  line-height: 1.3;
  text-align: left;
}

.meta {
  margin: 0;
  color: #64748b;
  text-align: left;
  font-size: 10px;
  display: flex;
  justify-content: flex-start;
  gap: 5px;
  flex-wrap: wrap;
}

.meta span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
}

.summary {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.65;
}
</style>
