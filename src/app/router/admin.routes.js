const adminRoutes = [
  {
    path: '',
    redirect: { name: 'AdminDashboard' },
  },
  {
    path: 'login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLoginPage.vue'),
  },
  {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboardPage.vue'),
    meta: { requiresAdminAuth: true },
  },
]

export default adminRoutes





