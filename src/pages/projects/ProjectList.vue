<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import PageBanner from '../../components/common/PageBanner.vue'
import Breadcrumb from '../../components/common/Breadcrumb.vue'

const route = useRoute()

const categories = [
  'All', 'Star Hotel', 'Terminal Space', 'Public Venues', 'Office Space', 'Medical Engineering', 'Residential'
]

const activeCategory = ref(route.params.category || 'All')

const projects = [
  { id: 1, title: 'Grand Hyatt Shenzhen', category: 'Star Hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Beijing Terminal 3', category: 'Terminal Space', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Central Hospital', category: 'Medical Engineering', image: 'https://images.unsplash.com/photo-1538108197017-c1a966b95df3?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Huawei HQ Office', category: 'Office Space', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800' },
  { id: 5, title: 'Olympic Stadium', category: 'Public Venues', image: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?auto=format&fit=crop&q=80&w=800' },
  { id: 6, title: 'Banyan Tree Resort', category: 'Star Hotel', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&q=80&w=800' }
]

const filteredProjects = computed(() => {
  if (activeCategory.value === 'All') return projects
  return projects.filter(p => p.category === activeCategory.value)
})

const breadcrumbs = [
  { name: 'Projects', link: '/projects' }
]
</script>

<template>
  <div class="projects-page">
    <PageBanner title="Project Case" subtitle="Showcasing our global architectural achievements" />
    <Breadcrumb :paths="breadcrumbs" />
    
    <div class="container section-padding">
      <!-- Filter -->
      <div class="filter-wrap" data-aos="fade-up">
        <ul class="filter-list">
          <li v-for="cat in categories" :key="cat">
            <button 
              :class="{ 'active': activeCategory === cat }" 
              @click="activeCategory = cat"
            >
              {{ cat }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Grid -->
      <div class="project-grid">
        <transition-group name="list">
          <div v-for="project in filteredProjects" :key="project.id" class="project-card">
            <router-link :to="`/project/${project.id}`" class="card-inner">
              <div class="image-box">
                <img :src="project.image" :alt="project.title">
              </div>
              <div class="info-box">
                <span class="cat">{{ project.category }}</span>
                <h3>{{ project.title }}</h3>
              </div>
            </router-link>
          </div>
        </transition-group>
      </div>
      
      <div v-if="filteredProjects.length === 0" class="no-results">
        <p>No projects found in this category.</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.filter-wrap {
  margin-bottom: 50px;
  .filter-list {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    
    button {
      background: none;
      border: 1px solid #ddd;
      padding: 10px 25px;
      font-weight: 600;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
      
      &.active {
        background-color: $primary-color;
        border-color: $primary-color;
        color: $white;
      }
    }
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.project-card {
  .card-inner {
    display: block;
    background-color: $white;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transform: translateY(-5px);
      .image-box img {
        transform: scale(1.05);
      }
    }
  }

  .image-box {
    height: 250px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
    }
  }

  .info-box {
    padding: 25px;
    .cat {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: $primary-color;
      font-weight: 700;
      margin-bottom: 10px;
      display: block;
    }
    h3 {
      font-size: 18px;
      color: $black;
    }
  }
}

.no-results {
  text-align: center;
  padding: 50px;
  color: #999;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
