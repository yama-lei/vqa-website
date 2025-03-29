<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        <div class="register-link">
          <span>还没有账号？</span>
          <el-button type="text" @click="goToRegister">立即注册</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const response = await fetch('https://api.yama-lei.top/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userInfo', JSON.stringify(data))
      localStorage.setItem('token', data.data?.token || '')
      localStorage.setItem('username', data.data?.user?.username || loginForm.username)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(data.message || '登录失败，请检查用户名和密码')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
  font-size: 24px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  border: none;
}

.login-button:hover {
  opacity: 0.9;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.register-link {
  text-align: center;
  margin-top: 16px;
  color: #606266;
}
</style> 