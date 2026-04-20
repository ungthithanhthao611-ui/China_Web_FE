const adminRoutes = [
  {
    path: '',
    redirect: { name: 'AdminDashboard' },
  },
  {
    path: 'login',
    name: 'AdminLogin',
    component: () => import('@/admin/pages/AdminLoginPage.vue'),
  },
  {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: () => import('@/admin/pages/AdminDashboardPage.vue'),
    meta: { requiresAdminAuth: true },
  },
]

export default adminRoutes





