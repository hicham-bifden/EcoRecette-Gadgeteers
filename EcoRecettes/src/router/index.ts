import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/stock'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/stock'
      },
      {
        path: 'stock',
        component: () => import('@/views/Stock.vue')
      },
      {
        path: 'recettes',
        component: () => import('@/views/RecipeGenerator.vue')
      },
      {
        path: 'statistiques',
        component: () => import('@/views/Statistics.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
