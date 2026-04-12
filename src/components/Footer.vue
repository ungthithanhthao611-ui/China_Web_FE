<script setup>
const topMenu = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Qualification Honor', href: '/honors' },
  { label: 'Business Display', href: '/business-display' },
  { label: 'News Center', href: '/news' },
  { label: 'Contact Us', href: '/contact' }
]

const socialLinks = [
  {
    id: 'wechat',
    label: 'WeChat',
    href: '#',
    color: 'linear-gradient(135deg, #52d86a 0%, #20b858 100%)',
    short: 'W'
  },
  {
    id: 'weibo',
    label: 'Weibo',
    href: 'https://weibo.com',
    color: 'linear-gradient(135deg, #ff4f5e 0%, #d90429 100%)',
    short: 'B'
  },
  {
    id: 'media',
    label: 'Media',
    href: '#',
    color: 'linear-gradient(135deg, #ffb14a 0%, #ff7f11 100%)',
    short: 'M'
  }
]

const contactItems = [
  {
    key: 'address',
    title: 'Address',
    lines: [
      '5F, Block C, Hehuamingcheng Building, No.7 Jianguomen South Street,',
      'Dongcheng District, Beijing'
    ]
  },
  {
    key: 'tel',
    title: 'Tel',
    lines: ['(86)010-65269998']
  },
  {
    key: 'email',
    title: 'E-mail',
    lines: ['CNDC@sinodecor.com']
  }
]

const footerColumns = [
  {
    title: 'About Us',
    links: [
      'Company Introduction',
      "Chairman’s Speech",
      'Organization Chart',
      'Corporate Culture',
      'Development Course',
      'Leadership Care',
      'Cooperative Partner'
    ]
  },
  {
    title: 'Qualification Honor',
    links: ['Qualification Certificate', 'Honorary Awards']
  },
  {
    title: 'Business Display',
    links: ['Business Field', 'Project Case', 'Video']
  },
  {
    title: 'News Center',
    links: ['Corporate News', 'Industry Dynamics']
  },
  {
    title: 'Social Responsibility',
    links: ['Social Responsibility']
  },
  {
    title: 'Contact Us',
    links: ['Contact Us', 'Subsidiary', 'Branch', 'Join Us']
  }
]

const bottomLinks = ['Links', 'Copyright Notice', 'Privacy & Security', 'Contact']
</script>

<template>
  <footer id="china-footer" class="footer-clone">
    <div class="footer-topbar">
      <nav class="footer-topbar__nav" aria-label="Footer top navigation">
        <a
          v-for="item in topMenu"
          :id="`footer-top-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`"
          :key="item.label"
          :href="item.href"
          class="footer-topbar__link"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>

    <div class="footer-main">
      <div class="footer-main__lineart" aria-hidden="true"></div>

      <div class="footer-main__inner">
        <section class="footer-brand" aria-label="Company information">
          <a id="footer-logo" href="/" class="footer-logo">
            <span class="footer-logo__mark">
              <span class="footer-logo__ring"></span>
              <span class="footer-logo__triangle footer-logo__triangle--one"></span>
              <span class="footer-logo__triangle footer-logo__triangle--two"></span>
            </span>

            <span class="footer-logo__text">
              <span class="footer-logo__cn">中国装饰</span>
              <span class="footer-logo__en">CHINA DECOR</span>
            </span>
          </a>

          <div class="footer-socials" aria-label="Social media links">
            <a
              v-for="item in socialLinks"
              :id="`footer-social-${item.id}`"
              :key="item.id"
              :href="item.href"
              class="footer-social"
              :style="{ '--social-gradient': item.color }"
              :aria-label="item.label"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ item.short }}</span>
            </a>
          </div>

          <div class="footer-contact-list">
            <div
              v-for="item in contactItems"
              :id="`footer-contact-${item.key}`"
              :key="item.key"
              class="footer-contact"
            >
              <div class="footer-contact__icon" aria-hidden="true">
                <svg v-if="item.key === 'address'" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" stroke="currentColor" stroke-width="1.8" />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8" />
                </svg>
                <svg v-else-if="item.key === 'tel'" viewBox="0 0 24 24" fill="none">
                  <path d="M7.8 4.8c.4-.9 1.4-1.4 2.3-1.1l2 .7c.9.3 1.4 1.2 1.2 2.1l-.4 2c-.1.6.1 1.2.6 1.6l1.6 1.6c.4.4 1 .6 1.6.5l1.9-.4c1-.2 1.9.4 2.2 1.3l.6 1.9c.3.9-.1 1.9-1 2.3l-1.7.8c-1.8.8-3.9.8-5.7 0a18.3 18.3 0 0 1-8.7-8.7c-.8-1.8-.8-3.9 0-5.7l.8-1.7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none">
                  <path d="M4 7.5 12 13l8-5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7" />
                </svg>
              </div>

              <div class="footer-contact__content">
                <p class="footer-contact__title">{{ item.title }}</p>
                <p
                  v-for="line in item.lines"
                  :key="line"
                  class="footer-contact__line"
                >
                  {{ line }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="footer-links" aria-label="Footer navigation columns">
          <div
            v-for="column in footerColumns"
            :id="`footer-column-${column.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`"
            :key="column.title"
            class="footer-column"
          >
            <h3 class="footer-column__title">{{ column.title }}</h3>
            <span class="footer-column__accent"></span>

            <div class="footer-column__links">
              <a
                v-for="link in column.links"
                :id="`footer-link-${link.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`"
                :key="link"
                href="#"
                class="footer-column__link"
              >
                {{ link }}
              </a>
            </div>
          </div>
        </section>
      </div>

      <div class="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path
            d="M0 34c16 0 16-10 32-10s16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10 16-10 32-10 16 10 32 10"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom__inner">
        <div class="footer-bottom__links">
          <a
            v-for="item in bottomLinks"
            :id="`footer-bottom-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`"
            :key="item"
            href="#"
            class="footer-bottom__link"
          >
            {{ item }}
          </a>
        </div>

        <div class="footer-bottom__meta">
          <span>Copyright China National Decoration Co.,Ltd</span>
          <a id="footer-bottom-beian" href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer">
            京ICP备12048675号-1
          </a>
          <span>Technical Support: CE ULTIMATE</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-clone {
  --bg: #162238;
  --bg-deep: #101a2d;
  --bg-soft: #1b2b46;
  --line: rgba(255, 255, 255, 0.08);
  --text: rgba(226, 233, 244, 0.86);
  --muted: rgba(188, 197, 214, 0.54);
  --muted-strong: rgba(214, 220, 230, 0.72);
  --gold: #d4b07b;
  --red: #db1629;
  --white: #ffffff;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(54, 78, 118, 0.35), transparent 30%),
    linear-gradient(180deg, #1a2942 0%, #132036 52%, #10192a 100%);
  color: var(--text);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 -30px 80px rgba(0, 0, 0, 0.22) inset;
}

.footer-topbar {
  border-bottom: 1px solid var(--line);
  background: rgba(10, 18, 32, 0.14);
  backdrop-filter: blur(8px);
}

.footer-topbar__nav {
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px 40px;
  padding: 18px 0;
}

.footer-topbar__link,
.footer-column__link,
.footer-bottom__link,
.footer-bottom__meta a {
  text-decoration: none;
}

.footer-topbar__link {
  position: relative;
  color: rgba(230, 219, 199, 0.95);
  font-size: 15px;
  line-height: 1.4;
  transition: color 0.25s ease;
}

.footer-topbar__link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--red), transparent);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.28s ease;
}

.footer-topbar__link:hover {
  color: var(--white);
}

.footer-topbar__link:hover::after {
  transform: scaleX(1);
}

.footer-main {
  position: relative;
}

.footer-main__lineart {
  position: absolute;
  inset: 0 auto 92px 0;
  width: min(420px, 44vw);
  pointer-events: none;
  opacity: 0.18;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 460 460'%3E%3Cg fill='none' stroke='%23d6dfef' stroke-width='1.2' opacity='0.8'%3E%3Cpath d='M27 132c44-42 97-63 158-63 40 0 82 8 125 24 44 16 84 24 120 24'/%3E%3Cpath d='M8 178c63-29 131-42 203-38 95 5 174 33 237 84'/%3E%3Cpath d='M2 255c78-22 157-22 238 0 79 22 152 21 220-3'/%3E%3Cpath d='M28 356c41-26 85-39 134-39 27 0 54 4 81 12 53 15 108 20 164 15'/%3E%3Cpath d='M57 79l62 38-28 39 71-18 37 31'/%3E%3Cpath d='M102 345c19-32 38-54 57-68 20-14 46-23 79-28'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px bottom 0;
  background-size: contain;
}

.footer-main__inner {
  position: relative;
  z-index: 1;
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  padding: 52px 0 46px;
  display: grid;
  grid-template-columns: minmax(280px, 330px) minmax(0, 1fr);
  gap: 48px 58px;
}

.footer-brand {
  position: relative;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.footer-logo__mark {
  position: relative;
  width: 66px;
  height: 50px;
  flex-shrink: 0;
}

.footer-logo__ring {
  position: absolute;
  inset: 6px auto auto 2px;
  width: 36px;
  height: 36px;
  border: 5px solid var(--gold);
  border-radius: 50%;
  opacity: 0.95;
}

.footer-logo__triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.footer-logo__triangle--one {
  left: 11px;
  top: 4px;
  border-width: 0 0 32px 32px;
  border-color: transparent transparent var(--gold) transparent;
  transform: rotate(-18deg);
}

.footer-logo__triangle--two {
  right: 1px;
  bottom: 1px;
  border-width: 0 0 26px 26px;
  border-color: transparent transparent rgba(212, 176, 123, 0.82) transparent;
  transform: rotate(8deg);
}

.footer-logo__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-logo__cn {
  color: var(--gold);
  font-size: clamp(20px, 2.1vw, 28px);
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
}

.footer-logo__en {
  color: var(--gold);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.22em;
  line-height: 1;
}

.footer-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.footer-social {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--social-gradient);
  color: var(--white);
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    filter 0.24s ease;
}

.footer-social:hover {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
  filter: brightness(1.05);
}

.footer-contact-list {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

.footer-contact {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.footer-contact__icon {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  color: rgba(228, 235, 244, 0.66);
  flex-shrink: 0;
}

.footer-contact__icon svg {
  width: 100%;
  height: 100%;
}

.footer-contact__title {
  margin: 0 0 6px;
  color: rgba(245, 247, 251, 0.92);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.footer-contact__line {
  margin: 0;
  color: var(--muted-strong);
  font-size: 14px;
  line-height: 1.7;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 28px 28px;
}

.footer-column {
  min-width: 0;
}

.footer-column__title {
  margin: 0;
  color: rgba(238, 225, 202, 0.96);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.35;
}

.footer-column__accent {
  display: block;
  width: 24px;
  height: 3px;
  margin: 12px 0 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff3448, #c80018);
  box-shadow: 0 0 18px rgba(219, 22, 41, 0.32);
}

.footer-column__links {
  display: grid;
  gap: 12px;
}

.footer-column__link {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  transition:
    color 0.24s ease,
    transform 0.24s ease;
  word-break: break-word;
}

.footer-column__link:hover {
  color: var(--white);
  transform: translateX(3px);
}

.footer-column:nth-child(2n) .footer-column__link:hover,
.footer-column:nth-child(5) .footer-column__link:hover {
  color: #ff5d6a;
}

.footer-wave {
  position: relative;
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  color: rgba(192, 202, 220, 0.28);
}

.footer-wave svg {
  display: block;
  width: 100%;
  height: 22px;
}

.footer-bottom {
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  background: linear-gradient(180deg, rgba(10, 16, 28, 0.06), rgba(5, 10, 18, 0.12));
}

.footer-bottom__inner {
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  padding: 18px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px 28px;
}

.footer-bottom__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 0;
}

.footer-bottom__link {
  color: rgba(205, 213, 225, 0.72);
  font-size: 13px;
  line-height: 1.5;
  transition: color 0.24s ease;
}

.footer-bottom__link:hover,
.footer-bottom__meta a:hover {
  color: var(--white);
}

.footer-bottom__link:not(:last-child)::after {
  content: '|';
  margin: 0 12px;
  color: rgba(255, 255, 255, 0.2);
}

.footer-bottom__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px 18px;
  color: rgba(193, 203, 219, 0.66);
  font-size: 13px;
  line-height: 1.6;
}

.footer-bottom__meta a {
  color: rgba(193, 203, 219, 0.8);
  transition: color 0.24s ease;
}

@media (max-width: 1180px) {
  .footer-main__inner {
    grid-template-columns: 1fr;
    gap: 38px;
  }

  .footer-links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .footer-bottom__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-bottom__meta {
    justify-content: flex-start;
  }
}

@media (max-width: 820px) {
  .footer-topbar__nav,
  .footer-main__inner,
  .footer-wave,
  .footer-bottom__inner {
    width: min(100%, calc(100% - 32px));
  }

  .footer-topbar__nav {
    justify-content: flex-start;
    gap: 14px 24px;
    padding: 16px 0;
  }

  .footer-main__inner {
    padding: 38px 0 34px;
  }

  .footer-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px 18px;
  }

  .footer-column__title {
    font-size: 17px;
  }

  .footer-column__link,
  .footer-contact__line {
    font-size: 13px;
  }
}

@media (max-width: 560px) {
  .footer-main__lineart {
    width: 240px;
    inset: 10px auto 120px -20px;
    opacity: 0.14;
  }

  .footer-topbar__nav,
  .footer-main__inner,
  .footer-wave,
  .footer-bottom__inner {
    width: min(100%, calc(100% - 24px));
  }

  .footer-topbar__link {
    font-size: 14px;
  }

  .footer-logo {
    gap: 12px;
  }

  .footer-logo__mark {
    width: 56px;
    height: 42px;
  }

  .footer-logo__cn {
    font-size: 18px;
  }

  .footer-logo__en {
    font-size: 11px;
  }

  .footer-social {
    width: 42px;
    height: 42px;
    font-size: 14px;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .footer-main__inner {
    gap: 30px;
  }

  .footer-column__accent {
    margin: 10px 0 14px;
  }

  .footer-bottom__links,
  .footer-bottom__meta {
    font-size: 12px;
  }
}
</style>
