<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ChevronDown } from 'lucide-vue-next'

const isSticky = ref(false)
const isMobileMenuOpen = ref(false)

const navItems = [
  { name: 'About Us', path: '/about', children: [
    { name: 'Company Introduction', path: '/about/company-introduction' },
    { name: 'Chairman\'s Speech', path: '/about/chairman-speech' },
    { name: 'Organization Chart', path: '/about/organization-chart' },
    { name: 'Corporate Culture', path: '/about/corporate-culture' },
    { name: 'Development Course', path: '/about/development-course' },
    { name: 'Leadership Care', path: '/about/leadership-care' }
  ]},
  { name: 'Business Areas', path: '/business-areas' },
  { name: 'Project Case', path: '/projects' },
  { name: 'Video', path: '/video' },
  { name: 'News Center', path: '/news', children: [
    { name: 'Enterprise News', path: '/news/enterprise' },
    { name: 'Industry Dynamics', path: '/news/industry' },
    { name: 'Social Responsibility', path: '/news/social-responsibility' }
  ]},
  { name: 'Social Responsibility', path: '/social-responsibility' },
  { name: 'Contact Us', path: '/contact' }
]

const handleScroll = () => {
  isSticky.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header :class="['header', { 'is-sticky': isSticky }]">
    <div class="container header-inner">
      <div class="logo">
        <router-link to="/">
          <div class="logo-placeholder">
            <span class="logo-text">SINO</span>
            <span class="logo-sub">DECORATION</span>
          </div>
        </router-link>
      </div>

      <!-- Desktop Nav -->
      <nav class="desktop-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.name" class="nav-item">
            <router-link :to="item.path" class="nav-link">
              {{ item.name }}
              <ChevronDown v-if="item.children" :size="14" />
            </router-link>
            
            <ul v-if="item.children" class="dropdown">
              <li v-for="child in item.children" :key="child.name">
                <router-link :to="child.path">{{ child.name }}</router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-toggle" @click="toggleMobileMenu">
        <Menu v-if="!isMobileMenuOpen" />
        <X v-else />
      </button>
    </div>

    <!-- Mobile Nav -->
    <div :class="['mobile-nav', { 'is-open': isMobileMenuOpen }]">
      <ul class="mobile-nav-list">
        <li v-for="item in navItems" :key="item.name" class="mobile-nav-item">
          <router-link :to="item.path" @click="isMobileMenuOpen = false">{{ item.name }}</router-link>
          <ul v-if="item.children" class="mobile-dropdown">
            <li v-for="child in item.children" :key="child.name">
              <router-link :to="child.path" @click="isMobileMenuOpen = false">{{ child.name }}</router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.header {
  height: 100px;
  background-color: $white;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;

  &.is-sticky {
    position: sticky;
    top: 0;
    height: 70px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .logo-placeholder {
    display: flex;
    flex-direction: column;
    line-height: 1;
    .logo-text {
      font-size: 28px;
      font-weight: 900;
      color: $primary-color;
      letter-spacing: -1px;
    }
    .logo-sub {
      font-size: 10px;
      font-weight: 600;
      color: $black;
      letter-spacing: 2px;
      margin-top: 2px;
    }
  }

  .desktop-nav {
    @media (max-width: 992px) {
      display: none;
    }
  }

  .nav-list {
    display: flex;
    gap: 30px;
  }

  .nav-item {
    position: relative;
    padding: 35px 0; // Padding to increase hover area

    &:hover {
      .dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .nav-link {
        color: $primary-color;
      }
    }
  }

  .nav-link {
    font-weight: 500;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 4px;
    color: $black;
    transition: color 0.3s;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 220px;
    background-color: $white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.3s ease;
    padding: 15px 0;

    li {
      a {
        display: block;
        padding: 10px 25px;
        font-size: 14px;
        &:hover {
          background-color: $bg-light;
          color: $primary-color;
        }
      }
    }
  }

  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    @media (max-width: 992px) {
      display: block;
    }
  }

  .mobile-nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    height: 100vh;
    background-color: $white;
    z-index: 2000;
    transition: right 0.3s ease-in-out;
    padding: 80px 30px;
    overflow-y: auto;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);

    &.is-open {
      right: 0;
    }

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .mobile-nav-item {
      font-weight: 600;
      font-size: 18px;
      
      .mobile-dropdown {
        margin-top: 10px;
        padding-left: 20px;
        font-weight: 400;
        font-size: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
}
</style>
