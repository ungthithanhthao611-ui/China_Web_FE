<script setup>
const markers = [
  { top: '35%', left: '72%', label: 'Beijing HQ' },
  { top: '55%', left: '78%', label: 'Shanghai Branch' },
  { top: '65%', left: '75%', label: 'Shenzhen Center' },
  { top: '58%', left: '65%', label: 'Wuhan Office' },
  { top: '50%', left: '55%', label: 'Chengdu Regional' }
]
</script>

<template>
  <section class="industrial-distribution">
    <div class="bg-text-overlay">CHINA DECOR</div>

    <div class="container main-content">
      <div class="map-container">
        <div class="earth-bg"></div>
        <div class="china-red-map">
          
          <div v-for="(m, i) in markers" :key="i" class="map-marker" :style="{ top: m.top, left: m.left }">
            <div class="ripple-effect">
              <div class="circle-main"></div>
              <div class="circle-pulse"></div>
            </div>
          </div>
        </div>
        <p class="approval-no">Approval number: Jing Shen Zi (2024) G No. 1765</p>
      </div>

      <div class="text-content">
        <div class="title-group">
          <h2>INDUSTRIAL <br> DISTRIBUTION <span class="red-stamp">印</span></h2>
          <div class="red-line"></div>
        </div>
        <p class="description">
          China Decoration has set up a "design general institute ten management centers" and a number of functional departments in the headquarters, and has 7 design branches, 7 branches and 9 sub-companies throughout the country, business throughout more than 30 cities, with a large number of industry experts and technical personnel.
        </p>
        <router-link to="/branch" class="more-link">
          <div class="more-icon">
          </div>
          <span>MORE +</span>
        </router-link>
      </div>
    </div>

    <div class="side-dots">
      <span v-for="i in 6" :key="i" :class="{ active: i === 5 }"></span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// Biến màu sắc theo mẫu
$bg-dark: #12213a; // Màu xanh đen chủ đạo
$china-red: #c8161d;
$text-gray: #a5b1c2;

.industrial-distribution {
  position: relative;
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at center, #1e3a5f 0%, #0a1426 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  color: #fff;
  font-family: 'Arial', sans-serif;
}

// Chữ nền khổng lồ
.bg-text-overlay {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12vw;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
}

.main-content {
  display: flex;
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  z-index: 2;
  align-items: center;
  justify-content: space-between;
}

// Phần Bản đồ
.map-container {
  position: relative;
  flex: 1.2;
  height: 600px;

  .earth-bg {
    position: absolute;
    width: 800px;
    height: 800px;
    background: url('https://en.sinodecor.com/repository/repository/portal-local/ngc202304190002/cms/image/d1abb229-17b7-47df-85a3-07fa69598623.png') no-repeat center;
    background-size: contain;
    top: 50%;
    left: 45%;
    transform: translate(-50%, -50%);
    opacity: 0.4;
  }

  .china-red-map {
    position: relative;
    width: 500px;
    margin-left: 50px;
    
    img {
      width: 100%;
      filter: drop-shadow(0 0 20px rgba(200, 22, 29, 0.4));
      // Nếu ảnh gốc không đỏ, dùng filter này để nhuộm đỏ:
      // filter: sepia(100%) saturate(500%) hue-rotate(-50deg);
    }
  }
}

// Marker hiệu ứng sóng
.map-marker {
  position: absolute;
  .circle-main {
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    position: relative;
    z-index: 2;
  }
  .circle-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: pulse-out 2s infinite;
  }
}

@keyframes pulse-out {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

.approval-no {
  position: absolute;
  bottom: 0;
  left: 10%;
  font-size: 10px;
  color: rgba(255,255,255,0.4);
}

// Phần nội dung chữ
.text-content {
  flex: 0.8;
  padding-left: 50px;

  h2 {
    font-size: 42px;
    letter-spacing: 2px;
    margin-bottom: 15px;
    line-height: 1.2;
    
    .red-stamp {
      display: inline-block;
      background: $china-red;
      font-size: 18px;
      padding: 2px 5px;
      vertical-align: middle;
      margin-left: 10px;
    }
  }

  .red-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, $china-red 80px, rgba(255,255,255,0.2) 80px);
    margin-bottom: 30px;
  }

  .description {
    font-size: 14px;
    line-height: 1.8;
    color: $text-gray;
    margin-bottom: 40px;
    text-align: justify;
  }
}

.more-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  gap: 15px;
  
  .more-icon {
    width: 45px;
    height: 45px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
    img { width: 25px; }
  }

  span {
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  &:hover .more-icon {
    background: $china-red;
    border-color: $china-red;
  }
}

// Chấm bên phải
.side-dots {
  position: absolute;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  span {
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    &.active {
      background: $china-red;
      transform: scale(1.5);
    }
  }
}

// Mobile responsive
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    text-align: center;
  }
  .map-container {
    height: 400px;
    .earth-bg { width: 100%; }
  }
  .text-content {
    padding-left: 0;
    .red-line { background: $china-red; margin: 0 auto 30px; width: 80px; }
  }
  .more-link { justify-content: center; }
}
</style>