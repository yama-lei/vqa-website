<template>
  <div class="header-container">
    <div class="left-section">
      <h1 class="site-title">VQA学习小组</h1>
    </div>
    <div class="right-section">
      <template v-if="isLoggedIn">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="avatarUrl">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <span class="username">{{ username }}</span>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const avatarUrl = ref('')
const isLoggedIn = ref(false)
const username = ref('')

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
  username.value = localStorage.getItem('username') || '用户'
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')
    isLoggedIn.value = false
    username.value = ''
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}

onMounted(() => {
  checkLoginStatus()
})
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(139, 161, 181, 0.08);
}

.site-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #303133;
}

.username {
  font-size: 14px;
  font-weight: 500;
}
</style> 