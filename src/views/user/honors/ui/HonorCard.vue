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
          </div>
        </template>
      </div>
      <div class="honor-card__badge" :class="{ 'honor-card__badge--gallery': variant === 'gallery' }">
        <span>Factory</span>
      </div>
    </div>
    <h3>{{ item.title }}</h3>
    <p v-if="item.year || item.issued_by" class="meta">
      <span v-if="item.year">{{ item.year }}</span>
      <span v-if="item.issued_by">{{ item.issued_by }}</span>
    </p>
  </article>
  <p v-if="item.short_description" class="summary">{{ item.short_description }}</p>
</template>

<style scoped>
.honor-card {
  display: grid;
  gap: 14px;
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
  max-width: 360px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.honor-card--frame .honor-card__image-shell {
  padding: 18px;
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(251, 248, 241, 0.92)),
    radial-gradient(circle at top left, rgba(215, 0, 15, 0.09), transparent 36%);
  border: 1px solid rgba(255, 255, 255, 0.34);
  box-shadow:
    0 16px 34px rgba(28, 18, 5, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.honor-card--frame:hover .honor-card__image-shell {
  transform: translateY(-4px);
  box-shadow:
    0 22px 40px rgba(28, 18, 5, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.honor-card--gallery .honor-card__image-shell {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 34px rgba(19, 14, 5, 0.16);
}

.honor-card--gallery:hover .honor-card__image-shell {
  transform: translateY(-3px);
  box-shadow: 0 20px 38px rgba(19, 14, 5, 0.2);
}

.honor-card__frame {
  display: none;
}

.honor-card__inner {
  position: relative;
  aspect-ratio: 1.08 / 0.82;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 241, 232, 0.96));
  box-shadow: inset 0 0 0 1px rgba(218, 204, 184, 0.44);
}

.honor-card--gallery .honor-card__inner {
  aspect-ratio: 4 / 3;
  border-radius: 0;
  box-shadow: none;
}

.honor-card__gallery {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.honor-card__gallery img,
.honor-card__inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.honor-card__badge {
  position: absolute;
  left: 18px;
  top: 18px;
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(18, 28, 42, 0.72);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.honor-card__badge--gallery {
  background: rgba(215, 0, 15, 0.82);
}

.honor-card h3 {
  margin: 0;
  color: #1f2735;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(1rem, 0.96rem + 0.18vw, 1.1rem);
  line-height: 1.35;
  text-align: left;
  padding: 0 6px;
}

.meta {
  margin: 0;
  color: rgba(31, 39, 53, 0.72);
  text-align: left;
  font-size: 12px;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 6px;
}

.summary {
  margin: -4px 0 0;
  padding: 0 6px;
  color: rgba(31, 39, 53, 0.78);
  font-size: 13px;
  line-height: 1.55;
}
</style>
