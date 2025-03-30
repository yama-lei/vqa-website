<template>
  <div class="resources-container">
    <!-- 顶部标题区域 -->
    <div class="page-header">
      <h1>资源中心</h1>
      <p class="header-subtitle">浏览和下载小组共享的学习资料、论文、代码和笔记</p>
      <p class="header-subtitle">需要登录才能下载文件，只有管理员才能删除文件</p>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-section">
      <div class="search-filter-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索资源"
          prefix-icon="Search"
          clearable
          class="search-input"
          @input="handleSearch"
        />
        
        <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="resource-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="论文" name="paper"></el-tab-pane>
          <el-tab-pane label="代码" name="code"></el-tab-pane>
          <el-tab-pane label="笔记" name="note"></el-tab-pane>
          <el-tab-pane label="视频" name="video"></el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="resources-table-container">
        <el-empty v-if="!filteredResources.length" description="暂无资源" class="empty-resources">
          <template #image>
            <el-icon class="empty-icon"><Files /></el-icon>
          </template>
        </el-empty>
        
        <el-table 
          v-else 
          :data="filteredResources" 
          style="width: 100%" 
          v-loading="loading"
          class="resources-table"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="资源名称" prop="name" min-width="300">
            <template #default="scope">
              <div class="resource-name" @click="previewResource(scope.row)">
                <el-icon class="resource-icon">
                  <Document v-if="scope.row.type === 'paper' || scope.row.type === 'note'" />
                  <Folder v-if="scope.row.type === 'code'" />
                  <VideoPlay v-if="scope.row.type === 'video'" />
                  <Files v-if="scope.row.type === 'other'" />
                </el-icon>
                <div class="resource-info">
                  <span class="resource-title">{{ scope.row.name }}</span>
                  <span class="resource-meta">
                    {{ formatFileSize(scope.row.size) }} · {{ getFileExtension(scope.row.name) }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="type" width="120" align="center">
            <template #default="scope">
              <el-tag 
                :type="getTagType(scope.row.type)" 
                effect="light"
                class="resource-tag"
              >
                {{ getTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" prop="uploadTime" width="180" align="center"></el-table-column>
          <el-table-column label="上传者" prop="uploader" width="120" align="center"></el-table-column>
          <el-table-column label="操作" width="280" align="center" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="small" 
                  class="download-btn"
                  @click="downloadResource(scope.row)"
                  v-if="isLoggedIn"
                >
                  <el-icon><Download /></el-icon>下载
                </el-button>
                <el-button 
                  v-if="!isLoggedIn"
                  size="small" 
                  type="info"
                  @click="promptLogin('下载')"
                >
                  <el-icon><Download /></el-icon>下载
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  class="preview-btn"
                  @click="previewResource(scope.row)"
                >
                  <el-icon><View /></el-icon>预览
                </el-button>
                <el-button 
                  v-if="isAdmin"
                  size="small" 
                  type="danger" 
                  class="delete-btn"
                  @click="handleDelete(scope.row)"
                >
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalResources"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 资源预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="currentResource?.name" 
      width="80%" 
      destroy-on-close
      class="preview-dialog"
    >
      <div class="preview-container">
        <!-- PDF 预览 -->
        <div v-if="isPdfFile(currentResource?.name)" class="pdf-preview">
          <VuePdfEmbed
            :source="currentResource?.url"
            :page="1"
            class="pdf-viewer"
          />
        </div>
        
        <!-- Markdown 预览 -->
        <div v-else-if="isMarkdownFile(currentResource?.name)" class="markdown-preview">
          <div v-html="renderedMarkdown" class="markdown-content"></div>
        </div>
        
        <!-- 图片预览 -->
        <div v-else-if="isImageFile(currentResource?.name)" class="image-preview">
          <el-image 
            :src="currentResource?.url" 
            fit="contain"
            :preview-src-list="[currentResource?.url]"
          />
        </div>
        
        <!-- 视频预览 -->
        <div v-else-if="currentResource?.type === 'video'" class="video-preview">
          <video 
            :src="currentResource?.url" 
            controls
            class="video-player"
            :type="getVideoType(currentResource?.name)"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <!-- 未知类型预览 -->
        <div v-else class="unknown-preview">
          <el-icon class="preview-icon"><Document /></el-icon>
          <p>该文件类型暂不支持预览，请下载后查看</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button v-if="isLoggedIn" type="primary" @click="downloadResource(currentResource)">
          <el-icon><Download /></el-icon>下载
        </el-button>
        <el-button v-else type="info" @click="promptLogin('下载')">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { 
  Document, 
  Folder, 
  VideoPlay, 
  Search, 
  Download, 
  View,
  Files,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { downloadFile as ossDownload, listFiles, getSignedUrl, createOssClient } from '../../utils/oss'
import VuePdfEmbed from 'vue-pdf-embed'
import { useRouter } from 'vue-router'

const loading = ref(false)
const searchKeyword = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalResources = ref(0)

const previewDialogVisible = ref(false)
const currentResource = ref(null)
const renderedMarkdown = ref('')
const ossConfig = ref(null) // 添加OSS配置的状态

// 资源列表，实际项目中从后端或本地存储获取
const resources = ref([])

const router = useRouter()
const isLoggedIn = ref(false)
const isAdmin = ref(false)

// 获取标签类型
const getTagType = (resourceType) => {
  switch (resourceType) {
    case 'paper': return 'primary'
    case 'code': return 'success'
    case 'note': return 'warning'
    case 'video': return 'danger'
    default: return 'info'
  }
}

// 获取类型显示文本
const getTypeLabel = (resourceType) => {
  switch (resourceType) {
    case 'paper': return '论文'
    case 'code': return '代码'
    case 'note': return '笔记'
    case 'video': return '视频'
    default: return '其他'
  }
}

// 根据当前标签和搜索关键词过滤资源
const filteredResources = computed(() => {
  let result = resources.value

  // 按类型过滤
  if (activeTab.value !== 'all') {
    result = result.filter(item => item.type === activeTab.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      (item.uploader && item.uploader.toLowerCase().includes(keyword))
    )
  }

  totalResources.value = result.length
  return result
})

// 文件类型判断工具函数
const isPdfFile = (fileName) => {
  return /\.pdf$/i.test(fileName || '')
}

const isMarkdownFile = (fileName) => {
  return /\.md$/i.test(fileName || '')
}

const isImageFile = (fileName) => {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(fileName || '')
}

const getVideoType = (fileName) => {
  if (!fileName) return 'video/mp4'
  
  const extension = fileName.split('.').pop().toLowerCase()
  switch (extension) {
    case 'mp4': return 'video/mp4'
    case 'webm': return 'video/webm'
    case 'ogg': return 'video/ogg'
    default: return 'video/mp4'
  }
}

// 标签切换
const handleTabClick = () => {
  currentPage.value = 1
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 分页切换
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 根据文件名判断类型
const determineType = (fileName) => {
  if (!fileName) {
    console.log('文件名为空，返回other类型')
    return 'other'
  }
  
  // 解码文件名（处理中文）
  const decodedFileName = decodeURIComponent(fileName)
  console.log('解码后的文件名:', decodedFileName)
  
  // 获取类型前缀
  const typePrefix = decodedFileName.split('/')[0]
  console.log('类型前缀:', typePrefix)
  
  // 根据目录前缀确定文件类型
  let fileType = 'other'
  switch (typePrefix) {
    case 'paper':
      fileType = 'paper'
      break
    case 'code':
      fileType = 'code'
      break
    case 'note':
      fileType = 'note'
      break
    case 'video':
      fileType = 'video'
      break
    default:
      console.log('未找到类型前缀，返回other类型')
  }
  
  console.log('最终确定的文件类型:', fileType)
  return fileType
}

// 预览资源
const previewResource = async (resource) => {
  try {
    console.log('开始预览资源:', resource)
    
    // 如果是 Markdown 文件，获取内容并渲染
    if (isMarkdownFile(resource.name)) {
      const response = await fetch(resource.url)
      const markdownContent = await response.text()
      renderedMarkdown.value = marked(markdownContent)
    }
    
    // 显示预览对话框
    currentResource.value = resource
    previewDialogVisible.value = true
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败，请尝试下载查看')
  }
}

// 检查用户权限
const checkUserPermissions = () => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
  
  // 检查是否为管理员
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      isAdmin.value = user.role === 'admin'
    } catch (error) {
      console.error('解析用户信息失败:', error)
      isAdmin.value = false
    }
  }
}

// 提示登录
const promptLogin = (action) => {
  ElMessageBox.confirm(
    `您需要登录后才能${action}文件`,
    '需要登录',
    {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/login')
  }).catch(() => {})
}

// 修改下载资源方法
const downloadResource = (resource) => {
  if (!resource || !resource.objectName) {
    ElMessage.warning('资源信息不完整，无法下载')
    return
  }
  
  if (!isLoggedIn.value) {
    promptLogin('下载')
    return
  }
  
  try {
    ossDownload(resource.objectName, resource.name)
    ElMessage.success('下载已开始')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(`下载失败: ${error.message}`)
  }
}

// 修改删除资源方法
const handleDelete = (resource) => {
  if (!isLoggedIn.value) {
    promptLogin('删除')
    return
  }
  
  if (!isAdmin.value) {
    ElMessage.warning('只有管理员才能删除文件')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除资源 "${resource.name}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        ElMessage.warning('登录已过期，请重新登录')
        router.push('/login')
        return
      }

      const response = await fetch('https://api.yama-lei.top/api/oss/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          objectName: resource.objectName
        })
      })

      const data = await response.json()

      if (data.success) {
        // 从资源列表中移除
        const index = resources.value.findIndex(r => r.objectName === resource.objectName)
        if (index > -1) {
          resources.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 组件挂载时获取资源列表
onMounted(async () => {
  // 检查用户权限
  checkUserPermissions()
  
  try {
    loading.value = true
    // 获取OSS文件列表
    const fileList = await listFiles()
    console.log('OSS文件列表:', fileList)
    
    // 将OSS文件列表转换为资源格式
    if (fileList && fileList.length > 0) {
      resources.value = fileList.map(file => {
        // 确保使用完整的objectName来判断类型
        const fileType = determineType(file.objectName || file.name)
        console.log(`文件 ${file.objectName || file.name} 的类型被确定为:`, fileType)
        return {
          name: file.name,
          type: fileType,
          url: file.url,
          objectName: file.objectName || file.name,
          uploadTime: new Date(file.lastModified).toLocaleString(),
          uploader: '系统用户',
          description: '',
          size: file.size
        }
      })
    }
    
    // 如果有本地上传历史，也合并进来
    convertUploadHistoryToResources()
    
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
  } finally {
    loading.value = false
  }
  
  // 获取OSS配置
  ossConfig.value = {
    region: import.meta.env.VITE_OSS_REGION,
    bucket: import.meta.env.VITE_OSS_BUCKET
  }
})

// 将上传历史转换为资源列表格式
const convertUploadHistoryToResources = () => {
  const uploadHistoryStr = localStorage.getItem('uploadHistory')
  if (!uploadHistoryStr) return
  
  try {
    const uploadHistory = JSON.parse(uploadHistoryStr)
    
    // 转换格式并合并到现有资源中
    const convertedResources = uploadHistory.map(item => {
      // 确保使用完整的objectName来判断类型
      const fileType = determineType(item.objectName || item.fileName)
      console.log(`上传历史中的文件 ${item.objectName || item.fileName} 的类型被确定为:`, fileType)
      return {
        name: item.fileName,
        type: fileType,
        url: item.url,
        objectName: item.objectName || item.fileName,
        uploadTime: item.uploadTime,
        uploader: '当前用户',
        description: item.description || '',
        size: item.size
      }
    })
    
    // 使用objectName作为唯一标识符来去重
    const existingObjectNames = new Set(resources.value.map(r => r.objectName))
    const newResources = convertedResources.filter(r => !existingObjectNames.has(r.objectName))
    
    resources.value = [...resources.value, ...newResources]
    totalResources.value = resources.value.length
  } catch (error) {
    console.error('转换上传历史失败:', error)
  }
}

// 添加在新窗口打开的方法
const openInNewTab = (url) => {
  if (!url) {
    ElMessage.warning('无法获取文件URL')
    return
  }
  window.open(url, '_blank')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '未知'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// 获取文件扩展名
const getFileExtension = (fileName) => {
  if (!fileName) return '未知'
  const ext = fileName.split('.').pop().toUpperCase()
  return ext || '未知'
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return 'resource-row'
}
</script>

<style scoped>
.resources-container {
  padding: 0;
  background-color: #f9fafc;
  min-height: 100vh;
}

/* 顶部标题区域 */
.page-header {
  background: linear-gradient(135deg, #3a8ee6 0%, #5b48d0 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.search-filter-area {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-input {
  max-width: 400px;
  margin-bottom: 20px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.resource-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

.resource-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #3a8ee6, #5b48d0);
  height: 3px;
}

.resources-table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.resources-table :deep(.el-table__header-wrapper) {
  background-color: #f9fafc;
}

.resources-table :deep(th) {
  background-color: #f9fafc;
  font-weight: 600;
  color: #303133;
}

.resource-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}

.resource-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #5b48d0;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resource-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.resource-meta {
  font-size: 12px;
  color: #909399;
}

.resource-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.download-btn, .preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  font-size: 13px;
}

.resource-row {
  transition: background-color 0.3s;
}

.resource-row:hover {
  background-color: #f5f7fa;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 空状态样式 */
.empty-resources {
  padding: 40px 0;
}

.empty-icon {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

/* 预览对话框 */
.preview-dialog :deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  background: #f9fafc;
  border-radius: 8px 8px 0 0;
}

.preview-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background-color: #f9fafc;
}

.pdf-preview {
  width: 100%;
  height: 600px;
  overflow: auto;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
}

.markdown-preview {
  width: 100%;
  max-height: 600px;
  overflow: auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.markdown-content {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  margin-bottom: 0.5em;
  color: #303133;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
  color: #303133;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
}

.markdown-content :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.image-preview {
  width: 100%;
  max-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview :deep(.el-image) {
  max-width: 100%;
  max-height: 600px;
}

.video-preview {
  width: 100%;
  max-width: 800px;
}

.video-player {
  width: 100%;
  max-height: 600px;
  border-radius: 8px;
  background: black;
}

.unknown-preview {
  text-align: center;
  color: #606266;
}

.preview-icon {
  font-size: 60px;
  color: #909399;
  margin-bottom: 20px;
}

.unknown-preview p {
  font-size: 16px;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .content-section {
    padding: 0 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .resource-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .resource-icon {
    margin-right: 0;
    margin-bottom: 4px;
  }
  
  .preview-dialog {
    width: 95% !important;
  }
}

.resources-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

.delete-btn {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.delete-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
}
</style> 