<script setup>
import { ref } from 'vue'
import PageBanner from '../../components/common/PageBanner.vue'
import Breadcrumb from '../../components/common/Breadcrumb.vue'

const breadcrumbs = [{ name: 'News Center' }]

const categories = ['All', 'Enterprise News', 'Industry Dynamics', 'Social Responsibility']
const activeTab = ref('All')

const news = [
  { id: 1, title: 'Shenzhen Sino-Decoration Architecture Gold Award', date: '2024-03-25', category: 'Enterprise News' },
  { id: 2, title: 'Singapore Branch Opening Ceremony', date: '2024-03-12', category: 'Enterprise News' },
  { id: 3, title: '2024 Smart Decoration Industry Report', date: '2024-02-28', category: 'Industry Dynamics' },
  { id: 4, title: 'Sino-Decoration Green Forest Initiative', date: '2024-02-15', category: 'Social Responsibility' }
]
</script>

<template>
  <div class="news-page">
    <PageBanner title="News Center" subtitle="Keeping you updated with our latest achievements and industry trends" />
    <Breadcrumb :paths="breadcrumbs" />

    <div class="container section-padding">
      <div class="news-tabs">
        <button v-for="cat in categories" :key="cat" :class="{ active: activeTab === cat }" @click="activeTab = cat">
          {{ cat }}
        </button>
      </div>

      <div class="news-list">
        <div v-for="item in news" :key="item.id" class="news-item" data-aos="fade-up">
          <div class="news-date">
            <span class="day">{{ item.date.split('-')[2] }}</span>
            <span class="month">{{ item.date.split('-')[0] }}.{{ item.date.split('-')[1] }}</span>
          </div>
          <div class="news-content">
            <span class="cat">{{ item.category }}</span>
            <router-link :to="`/news/${item.id}`"><h3>{{ item.title }}</h3></router-link>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.news-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #eee;
  margin-bottom: 50px;
  
  button {
    background: none;
    border: none;
    padding: 15px 25px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    &.active {
      color: $primary-color;
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: $primary-color;
      }
    }
  }
}

.news-item {
  display: flex;
  gap: 40px;
  padding: 30px 0;
  border-bottom: 1px solid #f0f0f0;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 20px;
  }

  .news-date {
    width: 80px;
    height: 80px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .day {
      font-size: 24px;
      font-weight: 800;
      color: $black;
    }
    .month {
      font-size: 12px;
      color: #999;
    }
  }

  .news-content {
    .cat {
      font-size: 11px;
      color: $primary-color;
      font-weight: 700;
      text-transform: uppercase;
    }
    h3 {
      font-size: 20px;
      margin: 10px 0;
      &:hover {
        color: $primary-color;
      }
    }
    p {
      color: #777;
      font-size: 15px;
    }
  }
}
</style>
