<script setup>
import { uiState } from '@/shared/utils/uiState'
</script>

<template>
  <div class="global-loading-system">
    <!-- Top Progress Bar (Consistent feedback) -->
    <div 
      class="top-progress-bar" 
      :class="{ 'is-loading': uiState.isLoading }"
      :style="{ width: uiState.isLoading ? '100%' : '0%' }"
    ></div>

    <!-- Centered Premium Spinner (Glassmorphism style) -->
    <transition name="fade-blur">
      <div v-if="uiState.isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="premium-loader">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-logo">
              <span class="dot"></span>
            </div>
          </div>
          <div class="loading-text-wrapper">
            <p class="loading-text">THIÊN ĐỒNG</p>
            <span class="loading-subtext">Đang kết nối cơ sở dữ liệu...</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.global-loading-system {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10001;
  pointer-events: none;
}

.top-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #df0019, #ffbaba, #df0019);
  background-size: 200% 100%;
  transition: width 0.4s ease, opacity 0.3s ease;
  width: 0;
  opacity: 0;
  z-index: 10003;

  &.is-loading {
    opacity: 1;
    animation: loading-bar-flow 2s linear infinite;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // Glassmorphism: Show web structure blurred behind
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 10002;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.premium-loader {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  .loader-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-top-color: #df0019;
    border-radius: 50%;
    animation: loader-spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;

    &:nth-child(2) {
      width: 70%;
      height: 70%;
      border-top-color: #333;
      animation-duration: 2s;
      animation-direction: reverse;
    }

    &:nth-child(3) {
      width: 40%;
      height: 40%;
      border-top-color: #df0019;
      animation-duration: 1s;
    }
  }

  .loader-logo {
    width: 12px;
    height: 12px;
    background: #df0019;
    border-radius: 50%;
    box-shadow: 0 0 15px #df0019;
    animation: loader-pulse 1.5s ease-in-out infinite;
  }
}

.loading-text-wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 4px;
  margin: 0;
  text-transform: uppercase;
}

.loading-subtext {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  letter-spacing: 1px;
}

@keyframes loader-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loader-pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
}

@keyframes loading-bar-flow {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

// Fade blur animation
.fade-blur-enter-active {
  transition: all 0.4s ease-out;
}
.fade-blur-leave-active {
  transition: all 0.5s ease-in;
}
.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
</style>
