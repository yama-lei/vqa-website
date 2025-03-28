<template>
  <el-menu 
    :default-active="activeMenu" 
    class="sidebar-menu" 
    :router="true" 
    background-color="#ffffff"
    text-color="#5f6c7b" 
    active-text-color="#3b82f6"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-text">AI Space</span>
      </div>
    </div>

    <el-menu-item index="/">
      <el-icon>
        <HomeFilled />
      </el-icon>
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="/resources">
      <el-icon>
        <Document />
      </el-icon>
      <span>资源中心</span>
    </el-menu-item>
    
    <el-menu-item index="/upload">
      <el-icon>
        <Upload />
      </el-icon>
      <span>文件上传</span>
    </el-menu-item>
    
    <el-menu-item index="/model">
      <el-icon>
        <ChatLineRound />
      </el-icon>
      <span>模型对话</span>
    </el-menu-item>
    
    <el-menu-item index="/learning">
      <el-icon>
        <Reading />
      </el-icon>
      <span>学习空间</span>
    </el-menu-item>
    
    <div class="sidebar-footer">
      <div class="user-info">
        <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        <span class="username">欢迎回来</span>
      </div>
    </div>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Document,
  ChatLineRound,
  Upload,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar-menu {
  height: 100vh;
  border-right: none;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-header {
  padding: 24px 20px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3b82f6;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-menu .el-menu-item {
  margin: 6px 12px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
  line-height: 48px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f0f9ff !important;
  transform: translateX(2px);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #f0f9ff !important;
  color: #3b82f6 !important;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.el-menu-item [class^="el-icon"] {
  margin-right: 12px;
  font-size: 20px;
  color: #64748b;
}

.sidebar-menu .el-menu-item.is-active [class^="el-icon"] {
  color: #3b82f6;
}

/* 侧边栏底部样式 */
.sidebar-footer {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

/* 平滑滚动效果 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>