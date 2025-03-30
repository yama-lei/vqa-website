import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '../views/login/index.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index.vue')
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
        meta: { title: '资源中心' }
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
        meta: { requiresAuth: true }
      },
      {
        path: 'learning',
        name: 'learning',
        component: () => import('@/views/learning/index.vue'),
        meta: { title: '学习空间' }
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于我们' }
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
  
  // 检查用户是否为管理员
  const checkIsAdmin = () => {
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        return user.role === 'admin'
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
    return false
  }
  
  const isAdmin = checkIsAdmin()
  
  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !isAdmin) {
    ElMessage.warning('该页面需要管理员权限')
    next('/')
    return
  }
  
  // 需要登录权限的页面
  if (to.meta.requiresAuth && !isLoggedIn) {
    ElMessage.warning('请先登录后再操作')
    next('/login')
    return
  }
  
  next()
})

export default router
