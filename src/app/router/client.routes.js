const clientRoutes = [
  {
    path: '',
    name: 'Home',
    component: () => import('@/client/pages/home/HomePage.vue'),
  },
  {
    path: 'about',
    redirect: '/about/company-introduction',
    children: [
      {
        path: 'company-introduction',
        name: 'CompanyIntroduction',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'chairman-speech',
        name: 'ChairmanSpeech',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'organization-chart',
        name: 'OrganizationChart',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'corporate-culture',
        name: 'CorporateCulture',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'development-course',
        name: 'DevelopmentCourse',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'leadership-care',
        name: 'LeadershipCare',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
      {
        path: 'cooperative-partner',
        name: 'CooperativePartner',
        component: () => import('@/client/pages/about/AboutPage.vue'),
      },
    ],
  },
  {
    path: 'honors',
    name: 'Honors',
    component: () => import('@/client/pages/honors/HonorsPage.vue'),
  },
  {
    path: 'business-areas',
    name: 'BusinessAreas',
    component: () => import('@/client/pages/business/BusinessAreasPage.vue'),
  },
  {
    path: 'projects',
    name: 'Projects',
    component: () => import('@/client/pages/projects/ProjectCasePage.vue'),
  },
  {
    path: 'project-case',
    name: 'ProjectCase',
    component: () => import('@/client/pages/projects/ProjectCasePage.vue'),
  },
  {
    path: 'projects/:category',
    name: 'ProjectCategory',
    component: () => import('@/client/pages/projects/ProjectCasePage.vue'),
  },
  {
    path: 'project_list/:categoryId.html',
    name: 'ProjectListLegacy',
    component: () => import('@/client/pages/projects/ProjectCasePage.vue'),
  },
  {
    path: 'project/:slug',
    name: 'ProjectDetail',
    component: () => import('@/client/pages/projects/ProjectDetailPage.vue'),
  },
  {
    path: 'products',
    name: 'Products',
    component: () => import('@/client/pages/products/ProductListPage.vue'),
  },
  {
    path: 'products/:slug',
    name: 'ProductDetail',
    component: () => import('@/client/pages/products/ProductDetailPage.vue'),
    props: true,
  },
  {
    path: 'news',
    name: 'News',
    component: () => import('@/client/pages/news/NewsListPage.vue'),
    children: [
      {
        path: 'corporate-news',
        name: 'CorporateNews',
        component: () => import('@/client/pages/news/NewsListPage.vue'),
      },
      {
        path: 'industry-dynamics',
        name: 'IndustryNews',
        component: () => import('@/client/pages/news/NewsListPage.vue'),
      },
    ],
  },
  {
    path: 'news/:slug',
    name: 'NewsDetail',
    component: () => import('@/client/pages/news/NewsDetailPage.vue'),
  },
  {
    path: 'contact',
    name: 'Contact',
    component: () => import('@/client/pages/contact/ContactPage.vue'),
  },
]

export default clientRoutes



