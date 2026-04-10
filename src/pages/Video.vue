<script setup>
import PageBanner from '../components/common/PageBanner.vue'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import { Play } from 'lucide-vue-next'

const breadcrumbs = [{ name: 'Video' }]

const videos = [
  { id: 1, title: 'Corporate Image Video 2024', date: '2024-01-01', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Decoration 4.0: Intelligent Construction', date: '2023-11-15', thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Grand Hyatt Shenzhen Project Review', date: '2023-09-20', thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Social Responsibility: Green Building', date: '2023-06-10', thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800' }
]
</script>

<template>
  <div class="video-page">
    <PageBanner title="Video Center" subtitle="Explore our projects and corporate culture through the lens" />
    <Breadcrumb :paths="breadcrumbs" />

    <div class="container section-padding">
      <div class="video-grid">
        <div v-for="video in videos" :key="video.id" class="video-card" data-aos="fade-up">
          <div class="thumb-wrap">
            <img :src="video.thumbnail" :alt="video.title">
            <div class="play-overlay">
              <div class="play-btn"><Play fill="white" /></div>
            </div>
          </div>
          <div class="video-info">
            <span class="date">{{ video.date }}</span>
            <h3>{{ video.title }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.video-card {
  cursor: pointer;
  &:hover {
    .play-btn {
      transform: scale(1.1);
      background-color: $primary-color;
    }
    img {
      transform: scale(1.05);
    }
  }

  .thumb-wrap {
    position: relative;
    height: 300px;
    overflow: hidden;
    border-radius: 4px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
    }
    
    .play-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .play-btn {
      width: 70px;
      height: 70px;
      background-color: rgba(204, 0, 0, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $white;
      transition: all 0.3s;
      padding-left: 5px;
    }
  }

  .video-info {
    padding: 20px 0;
    .date {
      font-size: 13px;
      color: #999;
      margin-bottom: 8px;
      display: block;
    }
    h3 {
      font-size: 18px;
      &:hover {
        color: $primary-color;
      }
    }
  }
}
</style>
