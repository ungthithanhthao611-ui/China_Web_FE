<script setup>
import { useSectionReveal } from '@/views/user/home/composables/useSectionReveal'

const { rootRef, isVisible } = useSectionReveal({ threshold: 0.26 })

const highlights = [
  {
    id: 'integration',
    title: 'Integrated Solution',
    description:
      'Material, construction workflow, and application guidance are aligned for homes, showrooms, and commercial spaces.',
  },
  {
    id: 'quality',
    title: 'Reliable Quality',
    description:
      'Soft-stone portfolio is curated for visual consistency, durability, and real-world fit for local climate conditions.',
  },
  {
    id: 'support',
    title: 'Fast Project Support',
    description:
      'Quick response for pricing, sample suggestion, and solution recommendation matching project schedule.',
  },
]
</script>

<template>
  <section class="home-highlights" ref="rootRef">
    <div class="container shell home-reveal" :class="{ 'is-visible': isVisible }">
      <header class="section-head" data-reveal-item>
        <p>Brand Promise</p>
        <h2>Reliable Foundation For Modern Surface Design</h2>
      </header>

      <div class="grid">
        <article v-for="item in highlights" :key="item.id" class="card" data-reveal-item>
          <span class="dot"></span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-highlights {
  padding: var(--home-section-pad, clamp(64px, 8vw, 108px)) 0;
  background:
    radial-gradient(circle at right top, rgba(194, 23, 30, 0.06), transparent 40%),
    var(--home-surface-soft, #f7f8fa);
}

.shell {
  width: min(var(--home-content-max, 1260px), calc(100% - 40px));
  margin: 0 auto;
}

.section-head p {
  margin: 0;
  color: var(--home-accent, #b20e17);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-head h2 {
  margin: 14px 0 0;
  max-width: 20ch;
  color: var(--home-text-strong, #151f31);
  font-size: clamp(2rem, 1.7rem + 1vw, 2.8rem);
  line-height: 1.12;
  font-family: var(--home-font-display, 'Merriweather', Georgia, serif);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--home-grid-gap, 18px);
  margin-top: 34px;
}

.card {
  position: relative;
  padding: 24px;
  border-radius: var(--home-radius-md, 20px);
  border: 1px solid var(--home-border-soft, rgba(19, 25, 35, 0.08));
  background: linear-gradient(180deg, #ffffff, #f2f4f7);
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.06);
}

.dot {
  display: inline-flex;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--home-accent, #b20e17);
}

.card h3 {
  margin: 16px 0 10px;
  color: var(--home-text-strong, #151f31);
  font-size: 20px;
  font-family: var(--home-font-display, 'Merriweather', Georgia, serif);
}

.card p {
  margin: 0;
  color: var(--home-text-muted, #4d596d);
  line-height: 1.75;
  font-family: var(--home-font-body, 'Segoe UI', Arial, sans-serif);
}

@media (max-width: 991px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
