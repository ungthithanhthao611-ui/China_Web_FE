<script setup>
defineProps({
  sections: {
    type: Array,
    required: true
  },
  activeSection: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const navigate = (index) => {
  emit('navigate', index)
}
</script>

<template>
  <div class="home-nav">
    <ul>
      <li v-for="(section, index) in sections" :key="index">
        <button 
          :class="{ 'active': activeSection === index }"
          @click="navigate(index)"
        >
          <span class="dot"></span>
          <span class="label">{{ section.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.home-nav {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;

  ul {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  li {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &:hover {
      .label {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }

  button {
    background: none;
    border: none;
    padding: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;
    flex-direction: row-reverse;

    .dot {
      width: 10px;
      height: 10px;
      background-color: #999;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .label {
      font-size: 11px;
      font-weight: 700;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
      white-space: nowrap;
      pointer-events: none;
    }

    &.active {
      .dot {
        background-color: $primary-color;
        transform: scale(1.5);
      }
    }
  }
}

@media (max-width: 768px) {
  .home-nav {
    display: none;
  }
}
</style>
