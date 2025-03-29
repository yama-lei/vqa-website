const handleModelSelect = (model) => {
  selectedModel.value = model
  // 移除自动开启对话的逻辑
}

const startNewChat = () => {
  if (!selectedModel.value) {
    ElMessage.warning('请先选择一个模型')
    return
  }
  
  currentChat.value = {
    id: Date.now(),
    model: selectedModel.value,
    messages: [],
    timestamp: new Date().toISOString()
  }
  
  chatHistory.value.push(currentChat.value)
  saveChatHistory()
}

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  if (!currentChat.value) {
    startNewChat()
  }
  
  const userMessage = {
    role: 'user',
    content: messageInput.value,
    timestamp: new Date().toISOString()
  }
  
  currentChat.value.messages.push(userMessage)
  messageInput.value = ''
  saveChatHistory()
  
  try {
    const response = await fetch('https://api.yama-lei.top/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: currentChat.value.model,
        messages: currentChat.value.messages
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }
      
      currentChat.value.messages.push(assistantMessage)
      saveChatHistory()
    } else {
      ElMessage.error(data.message || '发送失败，请重试')
    }
  } catch (error) {
    console.error('发送失败:', error)
    ElMessage.error('发送失败，请重试')
  }
} 