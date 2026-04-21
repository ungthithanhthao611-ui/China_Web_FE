export const newsCategoryMeta = {
  'corporate-news': {
    key: 'corporate-news',
    label: 'Corporate News',
    heading: 'News Center',
    route: '/news/corporate-news',
    breadcrumbParentLabel: 'News',
    breadcrumbParentRoute: '/news/corporate-news',
  },
  'industry-dynamics': {
    key: 'industry-dynamics',
    label: 'Industry Dynamics',
    heading: 'Industry Dynamics',
    route: '/news/industry-dynamics',
    breadcrumbParentLabel: 'News',
    breadcrumbParentRoute: '/news/corporate-news',
  },
}

export const newsHero = {
  title: 'NEWS CENTER',
  subtitle: 'Stay updated with the latest corporate stories and industry dynamics from China Decor.',
  bannerImage:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/30cc965d-b3b3-47dc-b85e-112c5b3cc8e1.jpg',
  mobileBannerImage:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/30cc965d-b3b3-47dc-b85e-112c5b3cc8e1.jpg',
  stampImage: '/images/daumoc.png',
  breadcrumbImage:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/7d17e26f-bec1-4cb7-96e8-fabf7ae52d75.png',
  featuredBackground:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/ebdf4a36-79b8-4e02-a195-5f552d4cb8ef.jpg',
  listBackground:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/f05a7ab9-c68c-43f3-9113-55fb50cb4dd7.jpg',
  sectionDecoration:
    'https://en.sinodecor.com/portal-local/ngc202304190002/cms/image/53e45437-3eaa-453a-87e7-5d86b6f29064.png',
}

const categoryMap = {
  'corporate-news': {
    id: 1,
    name: 'Corporate News',
    slug: 'corporate-news',
  },
  'industry-dynamics': {
    id: 2,
    name: 'Industry Dynamics',
    slug: 'industry-dynamics',
  },
}

export const newsArticles = [
  {
    id: 1,
    slug: 'china-decor-announces-strategic-showroom-upgrade-2026',
    title: 'China Decor Announces Strategic Showroom Upgrade for 2026',
    summary:
      'The company begins a new showroom upgrade program focused on premium material curation, immersive visitor flow, and stronger project presentation capability.',
    content_html: `
      <p>China Decor has officially launched a strategic showroom upgrade program designed to strengthen how the brand presents integrated architecture, interior materials, and project delivery capabilities to partners and clients.</p>
      <p>The new direction focuses on premium visual merchandising, clearer product storytelling, and more immersive sample zones for hospitality, office, and public-sector projects.</p>
      <p>According to the internal roadmap, the upgraded showroom will support cross-functional collaboration between business development, design consultants, and project implementation teams.</p>
      <p>This initiative is part of the company’s broader effort to modernize customer experience while keeping its brand identity aligned with large-scale international project execution.</p>
    `,
    body: `
      <p>China Decor has officially launched a strategic showroom upgrade program designed to strengthen how the brand presents integrated architecture, interior materials, and project delivery capabilities to partners and clients.</p>
      <p>The new direction focuses on premium visual merchandising, clearer product storytelling, and more immersive sample zones for hospitality, office, and public-sector projects.</p>
      <p>According to the internal roadmap, the upgraded showroom will support cross-functional collaboration between business development, design consultants, and project implementation teams.</p>
      <p>This initiative is part of the company’s broader effort to modernize customer experience while keeping its brand identity aligned with large-scale international project execution.</p>
    `,
    author: 'China Decor Editorial Team',
    published_at: '2026-04-10T08:30:00Z',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: true,
  },
  {
    id: 2,
    slug: 'china-decor-completes-new-hospitality-fit-out-milestone',
    title: 'China Decor Completes New Hospitality Fit-out Milestone',
    summary:
      'A major hospitality package has reached handover stage with accelerated coordination between design, procurement, and on-site delivery teams.',
    content_html: `
      <p>China Decor has completed another key hospitality fit-out milestone, marking the successful transition from detailed construction coordination to final handover preparation.</p>
      <p>The project team emphasized strict schedule control, material consistency, and quality management throughout the implementation process.</p>
      <p>Special attention was given to guest-facing finishing details, public area ambiance, and engineering coordination to ensure operational readiness.</p>
      <p>This delivery strengthens the company’s portfolio in premium hospitality interiors and demonstrates its ability to manage complex timelines with multidisciplinary teams.</p>
    `,
    body: `
      <p>China Decor has completed another key hospitality fit-out milestone, marking the successful transition from detailed construction coordination to final handover preparation.</p>
      <p>The project team emphasized strict schedule control, material consistency, and quality management throughout the implementation process.</p>
      <p>Special attention was given to guest-facing finishing details, public area ambiance, and engineering coordination to ensure operational readiness.</p>
      <p>This delivery strengthens the company’s portfolio in premium hospitality interiors and demonstrates its ability to manage complex timelines with multidisciplinary teams.</p>
    `,
    author: 'Project Communications Office',
    published_at: '2026-04-02T07:00:00Z',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: true,
  },
  {
    id: 3,
    slug: 'china-decor-strengthens-project-quality-governance-framework',
    title: 'China Decor Strengthens Project Quality Governance Framework',
    summary:
      'The updated quality governance framework introduces clearer review checkpoints, field coordination rules, and document control standards across project phases.',
    content_html: `
      <p>To improve consistency across large-scale delivery programs, China Decor has refined its internal project quality governance framework.</p>
      <p>The framework now includes stricter review gates for technical submissions, execution mockups, materials approval, and site inspection records.</p>
      <p>The update is expected to help project teams reduce coordination risks, improve traceability, and enhance client confidence in the final result.</p>
    `,
    body: `
      <p>To improve consistency across large-scale delivery programs, China Decor has refined its internal project quality governance framework.</p>
      <p>The framework now includes stricter review gates for technical submissions, execution mockups, materials approval, and site inspection records.</p>
      <p>The update is expected to help project teams reduce coordination risks, improve traceability, and enhance client confidence in the final result.</p>
    `,
    author: 'Operations Excellence Team',
    published_at: '2026-03-25T09:15:00Z',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: false,
  },
  {
    id: 4,
    slug: 'china-decor-expands-premium-material-partnership-network',
    title: 'China Decor Expands Premium Material Partnership Network',
    summary:
      'The company is expanding its material partnership ecosystem to improve sourcing flexibility, finish quality, and response speed for custom projects.',
    content_html: `
      <p>China Decor continues to broaden its premium material partnership network to serve more diverse project requirements and specification standards.</p>
      <p>The expanded network includes decorative surface solutions, custom interior systems, and selected engineered materials for high-end applications.</p>
      <p>This move supports better procurement resilience and allows the team to respond more effectively to complex project customization demands.</p>
    `,
    body: `
      <p>China Decor continues to broaden its premium material partnership network to serve more diverse project requirements and specification standards.</p>
      <p>The expanded network includes decorative surface solutions, custom interior systems, and selected engineered materials for high-end applications.</p>
      <p>This move supports better procurement resilience and allows the team to respond more effectively to complex project customization demands.</p>
    `,
    author: 'Supply Chain Strategy Desk',
    published_at: '2026-03-17T10:20:00Z',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: false,
  },
  {
    id: 5,
    slug: 'china-decor-launches-client-experience-visual-standards',
    title: 'China Decor Launches Client Experience Visual Standards',
    summary:
      'New visual standards help unify project presentation, mockup review, and decision-making communication across internal and client-facing teams.',
    content_html: `
      <p>China Decor has introduced a new client experience visual standard to improve clarity in presentations, workshops, and review meetings.</p>
      <p>The standard organizes how concept boards, finish boards, sample combinations, and construction references are structured for faster decision-making.</p>
      <p>It also improves consistency across departments and creates a stronger premium impression during the proposal and implementation journey.</p>
    `,
    body: `
      <p>China Decor has introduced a new client experience visual standard to improve clarity in presentations, workshops, and review meetings.</p>
      <p>The standard organizes how concept boards, finish boards, sample combinations, and construction references are structured for faster decision-making.</p>
      <p>It also improves consistency across departments and creates a stronger premium impression during the proposal and implementation journey.</p>
    `,
    author: 'Brand Experience Team',
    published_at: '2026-03-08T11:45:00Z',
    image:
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: false,
  },
  {
    id: 6,
    slug: 'china-decor-reviews-q1-delivery-performance-and-safety',
    title: 'China Decor Reviews Q1 Delivery Performance and Safety',
    summary:
      'The quarterly review highlights stronger delivery predictability, better site coordination, and renewed emphasis on execution safety.',
    content_html: `
      <p>During its latest quarterly review, China Decor assessed project delivery performance, safety metrics, and cross-team response efficiency.</p>
      <p>Leadership noted improvements in planning discipline, issue escalation speed, and compliance tracking on active sites.</p>
      <p>The review also defined new actions for execution safety, supervision routines, and communication standards for critical milestones.</p>
    `,
    body: `
      <p>During its latest quarterly review, China Decor assessed project delivery performance, safety metrics, and cross-team response efficiency.</p>
      <p>Leadership noted improvements in planning discipline, issue escalation speed, and compliance tracking on active sites.</p>
      <p>The review also defined new actions for execution safety, supervision routines, and communication standards for critical milestones.</p>
    `,
    author: 'Corporate Operations Team',
    published_at: '2026-03-01T06:40:00Z',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['corporate-news'],
    is_featured: false,
  },
  {
    id: 7,
    slug: 'hospitality-interiors-trend-watch-2026',
    title: 'Hospitality Interiors Trend Watch for 2026',
    summary:
      'Hospitality projects are moving toward layered textures, quieter luxury palettes, and more flexible social spaces for longer guest dwell time.',
    content_html: `
      <p>Industry observations for 2026 suggest that hospitality interiors are moving toward more refined material layering and a stronger sense of spatial calm.</p>
      <p>Design teams are prioritizing tactile finishes, soft contrast, and adaptable social zones that can support multiple guest behaviors throughout the day.</p>
      <p>Developers are also paying closer attention to long-term material maintenance and visual durability in premium public areas.</p>
    `,
    body: `
      <p>Industry observations for 2026 suggest that hospitality interiors are moving toward more refined material layering and a stronger sense of spatial calm.</p>
      <p>Design teams are prioritizing tactile finishes, soft contrast, and adaptable social zones that can support multiple guest behaviors throughout the day.</p>
      <p>Developers are also paying closer attention to long-term material maintenance and visual durability in premium public areas.</p>
    `,
    author: 'Industry Insights Desk',
    published_at: '2026-04-08T05:50:00Z',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['industry-dynamics'],
    is_featured: false,
  },
  {
    id: 8,
    slug: 'commercial-fit-out-market-shifts-in-asia-pacific',
    title: 'Commercial Fit-out Market Shifts in Asia-Pacific',
    summary:
      'More clients are asking for phased execution, value-engineered packages, and sustainability-aligned material strategies.',
    content_html: `
      <p>The Asia-Pacific commercial fit-out market continues to evolve as clients seek better balance between speed, cost control, and long-term operational value.</p>
      <p>Phased handover, modular detailing, and procurement flexibility are becoming more important in corporate and mixed-use interior delivery.</p>
      <p>Material strategy is also increasingly tied to sustainability targets and lifecycle performance rather than first-cost decisions alone.</p>
    `,
    body: `
      <p>The Asia-Pacific commercial fit-out market continues to evolve as clients seek better balance between speed, cost control, and long-term operational value.</p>
      <p>Phased handover, modular detailing, and procurement flexibility are becoming more important in corporate and mixed-use interior delivery.</p>
      <p>Material strategy is also increasingly tied to sustainability targets and lifecycle performance rather than first-cost decisions alone.</p>
    `,
    author: 'Regional Market Research Team',
    published_at: '2026-03-29T08:10:00Z',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['industry-dynamics'],
    is_featured: false,
  },
  {
    id: 9,
    slug: 'material-specification-priorities-for-premium-workplaces',
    title: 'Material Specification Priorities for Premium Workplaces',
    summary:
      'Premium workplace projects increasingly prioritize acoustic comfort, finish resilience, and long-term maintenance visibility.',
    content_html: `
      <p>Material specification in premium workplace environments is shifting toward better user comfort and more durable lifecycle performance.</p>
      <p>Acoustic balance, maintenance practicality, and visual cohesion across different departments are now more prominent selection criteria.</p>
      <p>This trend is especially visible in headquarters, innovation hubs, and executive meeting environments.</p>
    `,
    body: `
      <p>Material specification in premium workplace environments is shifting toward better user comfort and more durable lifecycle performance.</p>
      <p>Acoustic balance, maintenance practicality, and visual cohesion across different departments are now more prominent selection criteria.</p>
      <p>This trend is especially visible in headquarters, innovation hubs, and executive meeting environments.</p>
    `,
    author: 'Design Research Team',
    published_at: '2026-03-18T04:20:00Z',
    image:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['industry-dynamics'],
    is_featured: false,
  },
  {
    id: 10,
    slug: 'how-luxury-retail-spaces-are-redefining-material-storytelling',
    title: 'How Luxury Retail Spaces Are Redefining Material Storytelling',
    summary:
      'Retail design is using material transitions, lighting rhythm, and tactile contrast to create stronger emotional sequencing.',
    content_html: `
      <p>Luxury retail spaces are increasingly designed as immersive storytelling environments rather than traditional transaction-only spaces.</p>
      <p>Material transitions, lighting rhythm, and tactile contrast help shape customer movement, attention, and perceived brand value.</p>
      <p>As a result, fit-out teams must coordinate details more precisely across architecture, display systems, and finish packages.</p>
    `,
    body: `
      <p>Luxury retail spaces are increasingly designed as immersive storytelling environments rather than traditional transaction-only spaces.</p>
      <p>Material transitions, lighting rhythm, and tactile contrast help shape customer movement, attention, and perceived brand value.</p>
      <p>As a result, fit-out teams must coordinate details more precisely across architecture, display systems, and finish packages.</p>
    `,
    author: 'Retail Strategy Review',
    published_at: '2026-03-11T09:05:00Z',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    category: categoryMap['industry-dynamics'],
    is_featured: false,
  },
]

export function getNewsArticles() {
  return [...newsArticles].sort(
    (left, right) => new Date(right.published_at).getTime() - new Date(left.published_at).getTime()
  )
}

export function getNewsArticlesByCategory(categorySlug) {
  return getNewsArticles().filter((article) => article.category?.slug === categorySlug)
}

export function getFeaturedNews(categorySlug, limit = 2) {
  const list = getNewsArticlesByCategory(categorySlug)
  return list.filter((article) => article.is_featured).slice(0, limit)
}

export function getPagedNewsByCategory(categorySlug, page = 1, pageSize = 6) {
  const list = getNewsArticlesByCategory(categorySlug)
  const currentPage = Math.max(1, Number(page) || 1)
  const size = Math.max(1, Number(pageSize) || 6)
  const start = (currentPage - 1) * size

  return {
    items: list.slice(start, start + size),
    pagination: {
      page: currentPage,
      skip: start,
      limit: size,
      total: list.length,
    },
  }
}

export function getNewsArticleBySlug(slug) {
  return getNewsArticles().find((article) => article.slug === slug) || null
}

export function getRelatedNews(slug, categorySlug, limit = 3) {
  return getNewsArticlesByCategory(categorySlug)
    .filter((article) => article.slug !== slug)
    .slice(0, limit)
}
