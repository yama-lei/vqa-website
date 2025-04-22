<template>
  <div class="about-container">
    <div class="about-content">
      <h1>关于我们</h1>
      <div class="section">
       <span> 项目组成员</span>
      </div>
      <div class="section">
       <span> 指导老师</span>
      </div>
      <div class="section">
       <span>联系方式</span>
      </div>
      <div class="section">
       <span> （页面内容正在编辑中，可以向<a href="https://github.com/yama-lei/vqa-website" target="_blank">这个仓库</a>发起Pull Request进行修改）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 暂时不需要任何逻辑
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #303133;
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
}

.section {
  margin-bottom: 40px;
}

h2 {
  color: #409EFF;
  margin-bottom: 20px;
  font-size: 24px;
}

p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 15px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

li::before {
  content: "•";
  color: #409EFF;
  position: absolute;
  left: 0;
}
</style> 