<template>
  <div class="register-container">
    <div class="register-box">
      <div class="title">用户注册</div>
      <el-form :model="registerForm" status-icon ref="registerFormRef" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" type="text" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6个字符）" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password/>
        </el-form-item>
        <el-form-item label="验证问题" prop="verifyAnswer">
          <div class="verify-question">项目成员所在的大学是？（使用缩写，如CSU）</div>
          <el-input v-model="registerForm.verifyAnswer" type="text" placeholder="请输入正确答案"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" class="register-button">注册</el-button>
          <el-button @click="goToLogin" class="login-button">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  verifyAnswer: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateVerifyAnswer = (rule, value, callback) => {
  const correctAnswer = 'NJU'
  if (value === '') {
    callback(new Error('请回答验证问题'))
  } else if (value.toLowerCase() !== correctAnswer.toLowerCase()) {
    callback(new Error('回答错误，请输入正确答案'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPass, trigger: 'blur' }
  ],
  verifyAnswer: [
    { validator: validateVerifyAnswer, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false
    }
    
    loading.value = true
    try {
      const response = await fetch('https://api.yama-lei.top/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 注册成功，保存token和用户信息
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('username', data.data.user.username)
        localStorage.setItem('userInfo', JSON.stringify(data.data.user))
        
        ElMessage.success('注册成功')
        router.push('/')
      } else {
        ElMessage.error(data.message || '注册失败，请稍后重试')
      }
    } catch (error) {
      console.error('注册失败:', error)
      ElMessage.error('注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 30px;
}

.register-button {
  width: 100%;
  margin-bottom: 16px;
}

.login-button {
  width: 100%;
}

.verify-question {
  margin-bottom: 10px;
  font-weight: bold;
  color: #409EFF;
}
</style> 