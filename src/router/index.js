import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '../views/login/index.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'resources',
        name: 'resources',
        component: () => import('@/views/resources/index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'model',
        name: 'model',
        component: () => import('@/views/model/index.vue'),
        meta: { title: '模型对话' }
      },
      {
        path: 'upload',
        name: 'upload',
        component: () => import('@/views/upload/index.vue'),
        meta: { title: '文件上传' }
      },
      {
        path: 'learning',
        name: 'learning',
        component: () => import('@/views/learning/index.vue'),
        meta: { title: '学习空间' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
