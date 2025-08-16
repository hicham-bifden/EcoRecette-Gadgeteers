import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsLayout from '../views/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  // Routes publiques (sans authentification)
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register', 
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresGuest: true }
  },

  // Layout principal avec onglets (protégé)
  {
    path: '/tabs',
    component: TabsLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/stock'
      },
      {
        path: 'stock',
        name: 'Stock',
        component: () => import('../views/Stock.vue')
      },
      {
        path: 'recettes',
        name: 'RecipeGenerator',
        component: () => import('../views/RecipeGenerator.vue')
      },
      {
        path: 'statistiques',
        name: 'Statistics',
        component: () => import('../views/Statistics.vue')
      }
    ]
  },

  // Route par défaut
  {
    path: '/',
    redirect: () => {
      return '/tabs/stock'
    }
  },

  // 404 - Redirection vers stock
  {
    path: '/:pathMatch(.*)*',
    redirect: '/tabs/stock'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guards d'authentification
router.beforeEach(async (to, from, next) => {
  try {
    // Import dynamique du store auth
    const { useAuthStore } = await import('../stores/authStore')
    const authStore = useAuthStore()
    
    // Initialiser Firebase Auth si pas encore fait
    if (!authStore.initialized) {
      await authStore.checkAuthState()
    }

    const isAuthenticated = authStore.isAuthenticated  // Pas de parenthèses - c'est un getter !
    const requiresAuth = to.meta.requiresAuth
    const requiresGuest = to.meta.requiresGuest

    console.log('🧭 Navigation:', to.path, '| Connecté:', isAuthenticated)

    // Si la route nécessite une authentification et l'utilisateur n'est pas connecté
    if (requiresAuth && !isAuthenticated) {
      console.log('🔒 Redirection vers login - authentification requise')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // Si la route est pour les invités et l'utilisateur est connecté
    if (requiresGuest && isAuthenticated) {
      console.log('✅ Redirection vers stock - déjà connecté')
      next({ path: '/tabs/stock' })
      return
    }

    // Route par défaut selon l'état de connexion
    if (to.path === '/') {
      if (isAuthenticated) {
        console.log('🏠 Redirection vers stock depuis /')
        next({ path: '/tabs/stock' })
      } else {
        console.log('🔐 Redirection vers login depuis /')
        next({ name: 'Login' })
      }
      return
    }

    // Continuer la navigation normalement
    console.log('✅ Navigation autorisée vers:', to.path)
    next()
    
  } catch (error) {
    console.error('❌ Erreur dans router guard:', error)
    // En cas d'erreur, redirection vers login seulement si pas déjà sur login
    if (to.name !== 'Login') {
      next({ name: 'Login' })
    } else {
      next() // Éviter la boucle infinie sur login
    }
  }
})

export default router