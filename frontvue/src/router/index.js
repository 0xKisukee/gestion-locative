import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    /*
    {
      path: '/properties',
      name: 'properties',
      component: () => import('../views/PropertiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tenants',
      name: 'tenants',
      component: () => import('../views/TenantsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payments',
      name: 'payments',
      component: () => import('../views/PaymentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('../views/TicketsView.vue'),
      meta: { requiresAuth: true }
    }
      */
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Vérifier l'authentification
  const isAuthenticated = await authStore.checkAuth()

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Si la route nécessite d'être non authentifié
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
