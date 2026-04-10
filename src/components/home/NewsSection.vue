<script setup>
import { ArrowRight } from 'lucide-vue-next'

const newsList = [
  {
    day: '24',
    month: 'June',
    year: '2025',
    title: 'Jointly Building a Green and Smart New Ecosystem | The Green Construction Supply Chain Innovation Cooperation Exchange Conference (Beijing Station) was Successfully Held, Contributing to the High-quality Development of the Industry',
    desc: 'On June 19th, the "Green Construction Supply Chain Innovation Cooperation Exchange Conference (Beijing Station)" was grandly held in Beijing, guided by the China Building Decoration Association and hosted by the Green and Smart Construction Branch of the China Decoration Association.',
    image: 'https://en.sinodecor.com/repository/portal-local/ngc202304190002/cms/image/3d34e801-904d-427f-be5b-4c0abbd3a62b.png',
    link: '/news_Detail/1937323008641404928.html'
  },
  {
    day: '13',
    month: 'May',
    year: '2025',
    title: 'Strong Alliance Sketches a New Chapter for the City Shanghai Linli · China Decoration Urban Renewal Research Institute was Inaugurated and Set Sail',
    desc: '',
    image: '',
    link: '/news_Detail/1925373640090783744.html'
  },
  {
    day: '12',
    month: 'May',
    year: '2025',
    title: 'China Decoration Shines with Two Stars on the Wanjiang River Drawing a New Blueprint for Green and Intelligent Manufacturing —— The Grand Opening Ceremony of the Wuhu Branch and Anhui Subsidiary of China Decoration was Held',
    desc: '',
    image: '',
    link: '/news_Detail/1925367804035534848.html'
  },
  {
    day: '03',
    month: 'April',
    year: '2025',
    title: 'To Build the Foundation with Sincerity and Go further with Integrity | China Decoration Won the Title of the First Batch of "Beijing Credit Commitment Enterprises" in 2025',
    desc: '',
    image: 'https://en.sinodecor.com/repository/portal-local/ngc202304190002/cms/image/2aefd35d-5f7f-4e2e-bd1d-e48906416c97.jpg',
    link: '/news_Detail/1910243262246100992.html'
  }
]

const goTo = (url) => {
  window.location.href = url
}
</script>

<template>
  <section class="section page5 news-section">
    <!-- Backgrounds -->
    <div class="news-bg"></div>
    <div class="top-red-bar"></div>
    <div class="bg-shape"></div>

    <div class="main-layout">
      <!-- HEADER -->
      <div class="news-header">
        <div class="title-block">
          <span class="fnt-36">NEWS</span>
          <img src="https://en.sinodecor.com/repository/repository/portal-local/ngc202304190002/cms/image/012ad584-f3a1-4ceb-a342-1936a1bf6ff2.png" class="stamp-ic" alt="" />
          <div class="title-line"></div>
        </div>

        <button class="more-link" @click="goTo('/news_list.html')">
          <div class="more-icon-wrap">
            <div class="more-icon">
              <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M312.888889 995.555556c-17.066667 0-28.444444-5.688889-39.822222-17.066667-22.755556-22.755556-17.066667-56.888889 5.688889-79.644445l364.088888-329.955555c11.377778-11.377778 17.066667-22.755556 17.066667-34.133333 0-11.377778-5.688889-22.755556-17.066667-34.133334L273.066667 187.733333c-22.755556-22.755556-28.444444-56.888889-5.688889-79.644444 22.755556-22.755556 56.888889-28.444444 79.644444-5.688889l364.088889 312.888889c34.133333 28.444444 56.888889 73.955556 56.888889 119.466667s-17.066667 85.333333-51.2 119.466666l-364.088889 329.955556c-11.377778 5.688889-28.444444 11.377778-39.822222 11.377778z" fill="#fff"></path></svg>
            </div>
          </div>
          <span class="more-text">MORE +</span>
        </button>
      </div>

      <!-- GRID BODY -->
      <div class="news-body">
        
        <!-- === LEFT COLUMN === -->
        <div class="col-left">
          
          <!-- Article 0 (Image Feature) -->
          <article class="card-img-wrap" @click="goTo(newsList[0].link)">
            <img :src="newsList[0].image" :alt="newsList[0].title" class="full-image" />
            <div class="overlay grad-dark"></div>
            <div class="card-content">
              <div class="date-box text-white">
                <span class="day">{{ newsList[0].day }}</span>
                <div class="my"><span>{{ newsList[0].month }}</span><span>{{ newsList[0].year }}</span></div>
                <div class="line-dash bg-white"></div>
              </div>
              <h3 class="title-txt text-white line-clamp-2 mt-15">{{ newsList[0].title }}</h3>
            </div>
          </article>

          <!-- Article 2 (Text Feature) -->
          <article class="card-txt-wrap" @click="goTo(newsList[2].link)">
            <div class="top-red-line"></div>
            <div class="card-content-txt">
              <div class="date-box text-dark">
                <span class="day text-red">{{ newsList[2].day }}</span>
                <div class="my"><span>{{ newsList[2].month }}</span><span>{{ newsList[2].year }}</span></div>
                <div class="line-dash bg-red"></div>
              </div>
              <h3 class="title-txt text-dark line-clamp-2 mt-15">{{ newsList[2].title }}</h3>
            </div>
            <div class="bottom-thick-red"></div>
          </article>

        </div>


        <!-- === RIGHT COLUMN === -->
        <div class="col-right">
          
          <!-- Article 1 (Text Feature) -->
          <article class="card-txt-wrap flex-end" @click="goTo(newsList[1].link)">
             <div class="top-red-line" style="width: 100%; position: absolute; top: 0;"></div>
             <div class="card-content-txt" style="width: 100%;">
                <div class="date-box text-dark">
                  <span class="day text-red">{{ newsList[1].day }}</span>
                  <div class="my"><span>{{ newsList[1].month }}</span><span>{{ newsList[1].year }}</span></div>
                  <div class="line-dash bg-red"></div>
                </div>
                <h3 class="title-txt text-dark line-clamp-2 mt-15">{{ newsList[1].title }}</h3>
             </div>
          </article>

          <!-- Article 3 (Image Certificate) -->
          <article class="card-img-wrap" @click="goTo(newsList[3].link)">
            <img :src="newsList[3].image" :alt="newsList[3].title" class="full-image auto-fit" />
            <div class="card-content" style="bottom: 10px;">
              <div class="date-box text-dark">
                <span class="day text-red">{{ newsList[3].day }}</span>
                <div class="my text-dark"><span>{{ newsList[3].month }}</span><span>{{ newsList[3].year }}</span></div>
                <div class="line-dash bg-red"></div>
              </div>
            </div>
          </article>

        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ====================
   GLOBAL SECTION
   ==================== */
.news-section {
  position: relative;
  width: 100%;
  height: 100%; /* For full page viewport snapping */
  background: #efefef;
  overflow: hidden;
}

.news-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(245, 245, 245, 0.82)), #efefef;
}

.bg-shape {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(145deg, transparent 0 22%, rgba(255,255,255,0.34) 22% 38%, transparent 38%),
    linear-gradient(205deg, transparent 0 57%, rgba(255,255,255,0.26) 57% 66%, transparent 66%),
    linear-gradient(170deg, transparent 0 72%, rgba(255,255,255,0.22) 72% 82%, transparent 82%);
  opacity: 0.95;
}

.top-red-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 25vw;
  max-width: 450px;
  height: 35px;
  background: #da1b2b;
  z-index: 1;
}

/* ====================
   MAIN LAYOUT (Centered Grid to match Project & About)
   ==================== */
.main-layout {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: max(40px, calc((100% - 1600px) / 2));
  right: max(40px, calc((100% - 1600px) / 2));
  display: flex;
  flex-direction: column;
  z-index: 5;
}

/* ====================
   HEADER
   ==================== */
.news-header {
  height: 15%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.fnt-36 {
  font-family: "Times New Roman", Times, serif;
  font-size: 32px;
  color: #333;
  letter-spacing: 1.5px;
}

.stamp-ic { height: 26px; }

.title-line {
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 160px;
  height: 1px;
  background-color: #cd0000;
}

/* More Button */
.more-link {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.3s;
}
.more-link:hover { opacity: 0.8; }

.more-icon-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('https://en.sinodecor.com/repository/portal-local/ngc202304190002/cms/image/ce4a0701-a185-48b4-afd3-470de23c21a4.png') no-repeat center/contain;
}

.more-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #da1b2b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
}
.more-link:hover .more-icon { transform: scale(1.08); }

.more-text {
  font-size: 13px;
  color: #333;
  letter-spacing: 1px;
  position: relative;
  border-bottom: 1px solid #333;
  padding-bottom: 2px;
}

/* ====================
   GRID BODY (Proportional Vertical heights)
   ==================== */
.news-body {
  height: 85%;
  display: flex;
  gap: 7%;
}

.col-left {
  flex: 1.05;
  display: flex;
  flex-direction: column;
}
.col-right {
  flex: 0.95;
  display: flex;
  flex-direction: column;
}

/* Image Wraps */
.col-left .card-img-wrap { height: 50%; margin-bottom: 10%; }
.col-right .card-img-wrap { height: 60%; }

.card-img-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
}

.full-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}
.full-image.auto-fit {
  object-fit: contain; /* For certificate to show fully */
  object-position: bottom left;
}
.card-img-wrap:hover .full-image {
  transform: scale(1.04);
}

.overlay { position: absolute; inset: 0; }
.grad-dark { background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); }

.card-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 5;
}

/* Text Wraps */
.col-left .card-txt-wrap { height: 40%; }
.col-right .card-txt-wrap { height: 35%; margin-bottom: 5%; }

.card-txt-wrap {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.flex-end {
  display: flex;
  align-items: flex-end;
  padding-bottom: 15px;
}

.top-red-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 1px;
  background: rgba(201, 0, 10, 0.4);
}

.bottom-thick-red {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 70%;
  height: 3px;
  background: #da1b2b;
}

.card-content-txt {
  padding-top: 25px; /* Offset from top grid line */
}

/* ====================
   TYPOGRAPHY & DATES
   ==================== */
.date-box {
  display: flex;
  align-items: flex-end; /* Align the day and the dashed line to the bottom */
  gap: 10px;
  line-height: 1;
}

.day {
  font-size: 38px;
  font-family: inherit;
  font-weight: 300;
  line-height: 0.8;
  transition: color 0.3s;
}

.my {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  letter-spacing: 1px;
  padding-bottom: 2px;
}

.line-dash {
  height: 1px;
  width: 35px;
  margin-bottom: 5px;
}

.text-white { color: #fff; }
.text-dark { color: #333; }
.text-red { color: #da1b2b; }
.bg-white { background: #fff; }
.bg-red { background: #da1b2b; }

.title-txt {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  max-width: 90%;
  transition: color 0.3s;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mt-15 { margin-top: 15px; }

/* HOVER EFFECTS */
.card-txt-wrap:hover .title-txt {
  color: #da1b2b;
}

/* Responsive constraints */
@media (max-width: 1200px) {
  .news-body { flex-direction: column; height: auto; gap: 40px; overflow-y: auto; }
  .col-left .card-img-wrap { height: 300px; margin-bottom: 20px; }
  .col-left .card-txt-wrap { height: 150px; margin-bottom: 20px;}
  .col-right .card-txt-wrap { height: 150px; margin-bottom: 20px;}
  .col-right .card-img-wrap { height: 300px; }
}
</style>