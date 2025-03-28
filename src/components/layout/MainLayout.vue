<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-menu
    class="sidebar-menu"
    :default-active="activeMenu"
    router
    :collapse="isCollapse"
    background-color="#ffffff"
    text-color="#5f6c7b"
    active-text-color="#3b82f6"
  >
    <div class="logo-container" :class="{ 'collapsed': isCollapse }">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <transition name="fade">
        <span v-show="!isCollapse" class="logo-text">VQA Website</span>
      </transition>
    </div>
    
    <el-menu-item index="/">
      <el-icon><House /></el-icon>
      <template #title>首页</template>
      <div class="menu-item-hover-effect"></div>
    </el-menu-item>
    
    <el-menu-item index="/resources">
      <el-icon><Files /></el-icon>
      <template #title>资源中心</template>
      <div class="menu-item-hover-effect"></div>
    </el-menu-item>
    
    <el-menu-item index="/upload">
      <el-icon><Upload /></el-icon>
      <template #title>文件上传</template>
      <div class="menu-item-hover-effect"></div>
    </el-menu-item>
    
    <el-menu-item index="/model">
      <el-icon><ChatDotRound /></el-icon>
      <template #title>模型对话</template>
      <div class="menu-item-hover-effect"></div>
    </el-menu-item>
    
    <el-menu-item index="/learning">
      <el-icon><Reading /></el-icon>
      <template #title>学习空间</template>
      <div class="menu-item-hover-effect"></div>
    </el-menu-item>
    </el-menu>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-navbar">
        <div class="left-section">
          <el-button 
            type="text" 
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon>
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
        </div>
        <div class="right-section">
          <template v-if="isLoggedIn">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                {{ username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <el-button 
            v-else 
            type="primary" 
            @click="router.push('/login')"
          >
            登录
          </el-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Files, 
  ChatDotRound, 
  Upload, 
  Reading,
  Expand,
  Fold,
  ArrowDown,
  House
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
const isLoggedIn = ref(false)
const username = ref('')

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
  username.value = localStorage.getItem('username') || ''
}

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    isLoggedIn.value = false
    username.value = ''
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}

// 初始化时检查登录状态
checkLoginStatus()
</script>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
}

.sidebar-menu {
  height: 100vh;
  border-right: none;
  transition: width 0.3s;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.sidebar-menu.el-menu--collapse {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #002140;
  overflow: hidden;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-navbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(139, 161, 181, 0.08);
}

.collapse-btn {
  font-size: 20px;
  color: #303133;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #303133;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 4px;
  margin-left: 8px;
  margin-right: 8px;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item:hover) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 16px;
  font-size: 18px;
}

:deep(.el-menu-item span) {
  font-size: 14px;
}

@media (max-width: 768px) {
  .sidebar-menu:not(.el-menu--collapse) {
    width: 64px;
  }
  
  .sidebar-menu .el-menu-item span {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
}
</style> 