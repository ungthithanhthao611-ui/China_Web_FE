<script setup>
import { MapPin, Phone, Mail, Clock } from 'lucide-vue-next'
import PageBanner from '../components/common/PageBanner.vue'
import Breadcrumb from '../components/common/Breadcrumb.vue'

const breadcrumbs = [{ name: 'Contact Us' }]
</script>

<template>
  <div class="contact-page">
    <PageBanner title="Contact Us" subtitle="Get in touch with our expert team for your next landmark project" />
    <Breadcrumb :paths="breadcrumbs" />

    <div class="container section-padding">
      <div class="contact-grid">
        <div class="contact-info" data-aos="fade-right">
          <h2 class="section-title">Headquarters Info</h2>
          <div class="info-items">
            <div class="info-item">
              <div class="icon-wrap"><MapPin /></div>
              <div class="text">
                <h3>Address</h3>
                <p>Building A, Sino-Decoration Industrial Park, No. 123 Decor Road, Futian District, Shenzhen, China</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-wrap"><Phone /></div>
              <div class="text">
                <h3>Phone</h3>
                <p>+86-755-82705555</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-wrap"><Mail /></div>
              <div class="text">
                <h3>Email</h3>
                <p>info@sinodecor.com</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-wrap"><Clock /></div>
              <div class="text">
                <h3>Working Hours</h3>
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form" data-aos="fade-left">
          <h2 class="section-title">Send Us a Message</h2>
          <form @submit.prevent>
            <div class="form-group">
              <input type="text" placeholder="Your Name" required>
            </div>
            <div class="form-group">
              <input type="email" placeholder="Email Address" required>
            </div>
            <div class="form-group">
              <input type="text" placeholder="Subject">
            </div>
            <div class="form-group">
              <textarea placeholder="Your Message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100">Submit Inquiry</button>
          </form>
        </div>
      </div>
      
      <!-- Map Placeholder -->
      <div class="map-placeholder" data-aos="fade-up">
        <div class="map-overlay">
          <span>Google Maps / Baidu Maps Integration</span>
        </div>
        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" alt="Map">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-bottom: 80px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 50px;
  }
}

.section-title {
  font-size: 28px;
  margin-bottom: 40px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: $primary-color;
  }
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.info-item {
  display: flex;
  gap: 20px;
  
  .icon-wrap {
    width: 50px;
    height: 50px;
    background-color: $bg-light;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;
    flex-shrink: 0;
  }
  
  .text {
    h3 {
      font-size: 18px;
      margin-bottom: 5px;
    }
    p {
      color: $text-light;
      font-size: 15px;
      line-height: 1.5;
    }
  }
}

.contact-form {
  background-color: $white;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;

  .form-group {
    margin-bottom: 20px;
    input, textarea {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
  }
  
  .w-100 {
    width: 100%;
  }
}

.map-placeholder {
  position: relative;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%);
    opacity: 0.3;
  }
  
  .map-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0,0,0,0.05);
    span {
      padding: 15px 30px;
      background-color: $white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      font-weight: 600;
    }
  }
}
</style>
