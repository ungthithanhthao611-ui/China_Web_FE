<script setup>
import PageBanner from '../../components/common/PageBanner.vue'
import Breadcrumb from '../../components/common/Breadcrumb.vue'

const breadcrumbs = [{ name: 'Join Us' }]

const jobs = [
  { id: 1, title: 'Senior Project Manager', location: 'Shenzhen', department: 'Project Management Dept.', type: 'Social Recruitment' },
  { id: 2, title: 'BIM Engineer', location: 'Shenzhen', department: 'R&D Center', type: 'Social Recruitment' },
  { id: 3, title: 'Interior Designer', location: 'Singapore', department: 'Design Institute', type: 'Social Recruitment' },
  { id: 4, title: 'Assistant Accountant', location: 'Shenzhen', department: 'Financial Dept.', type: 'Campus Recruitment' }
]
</script>

<template>
  <div class="jobs-page">
    <PageBanner title="Join Us" subtitle="Build your career with the industry leader in decoration engineering" />
    <Breadcrumb :paths="breadcrumbs" />

    <div class="container section-padding">
      <div class="job-list-header">
        <h2 class="section-title">Open Positions</h2>
      </div>

      <div class="job-grid">
        <div v-for="job in jobs" :key="job.id" class="job-card" data-aos="fade-up">
          <div class="job-header">
            <span class="type">{{ job.type }}</span>
            <h3>{{ job.title }}</h3>
          </div>
          <div class="job-details">
            <p><span>Location:</span> {{ job.location }}</p>
            <p><span>Department:</span> {{ job.department }}</p>
          </div>
          <div class="job-footer">
            <router-link :to="`/join-us/${job.id}`" class="btn btn-primary btn-sm">View Details</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.section-title {
  font-size: 32px;
  margin-bottom: 50px;
  text-align: center;
}

.job-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.job-card {
  padding: 40px;
  background-color: $white;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    border-color: $primary-color;
  }

  .job-header {
    margin-bottom: 25px;
    .type {
      font-size: 11px;
      font-weight: 700;
      color: $primary-color;
      background-color: rgba(204, 0, 0, 0.05);
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 10px;
    }
    h3 {
      font-size: 22px;
    }
  }

  .job-details {
    margin-bottom: 30px;
    p {
      color: #666;
      font-size: 15px;
      margin-bottom: 8px;
      span {
        font-weight: 700;
        color: $black;
        margin-right: 5px;
      }
    }
  }

  .btn-sm {
    padding: 8px 20px;
    font-size: 14px;
  }
}
</style>
