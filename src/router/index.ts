import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/goals',
      name: 'goals',
      component: () => import('../views/GoalsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/goals/:id',
      name: 'goal-detail',
      component: () => import('../views/GoalDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/journal',
      name: 'journal',
      component: () => import('../views/JournalView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/trackers',
      name: 'trackers',
      component: () => import('../views/TrackersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/PricingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/subscription/success',
      name: 'subscription-success',
      component: () => import('../views/SubscriptionSuccessView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/subscription/cancel',
      name: 'subscription-cancel',
      component: () => import('../views/SubscriptionCancelView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/badges',
      name: 'badges',
      component: () => import('../views/BadgesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthReady) {
    await authStore.initAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  console.log(`[Router] Navigating from ${String(from.name)} to ${String(to.name)}`)
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('[Router] Auth required, redirecting to login')
    next('/login')
  } else if (to.meta.guest && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
