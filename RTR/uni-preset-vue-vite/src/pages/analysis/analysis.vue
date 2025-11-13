<template>
  <view class="container">
    <!-- 数据概览 -->
    <view class="data-overview">
      <view class="overview-header">
        <text class="overview-title">💰 财务概览</text>
      </view>
      <view class="overview-grid">
        <view class="overview-item">
          <text class="overview-label">本月收入</text>
          <text class="overview-value income">¥{{ monthlyIncome.toLocaleString() }}</text>
        </view>
        <view class="overview-item">
          <text class="overview-label">本月支出</text>
          <text class="overview-value expense">¥{{ monthlyExpense.toLocaleString() }}</text>
        </view>
        <view class="overview-item">
          <text class="overview-label">收入目标</text>
          <text class="overview-value">¥{{ targets.monthlyTarget.toLocaleString() }}</text>
        </view>
        <view class="overview-item">
          <text class="overview-label">支出预算</text>
          <text class="overview-value">¥{{ targets.monthlyBudget.toLocaleString() }}</text>
        </view>
      </view>
    </view>

    <!-- 对话区域 -->
    <view class="chat-container">
      <view class="chat-header">
        <text class="chat-title">🤖 AI财务助手</text>
        <view class="chat-subtitle">问我任何关于您财务的问题</view>
      </view>

      <!-- 消息列表 -->
      <scroll-view
        class="message-list"
        scroll-y
        :scroll-top="scrollTop"
        scroll-with-animation
      >
        <!-- 欢迎消息 -->
        <view v-if="messages.length === 0" class="welcome-message">
          <view class="message-item ai-message">
            <view class="message-avatar">🤖</view>
            <view class="message-content">
              <text class="message-text">
                您好！我是您的AI财务助手。我可以帮您分析收支情况、制定理财计划、回答财务问题。请随时向我提问！
              </text>
            </view>
          </view>
        </view>

        <!-- 对话消息 -->
        <view
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="message.type === 'user' ? 'user-message' : 'ai-message'"
        >
          <view class="message-avatar">
            {{ message.type === 'user' ? '👤' : '🤖' }}
          </view>
          <view class="message-content">
            <text class="message-text">{{ message.content }}</text>
            <text class="message-time">{{ message.time }}</text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="isThinking" class="message-item ai-message">
          <view class="message-avatar">🤖</view>
          <view class="message-content">
            <view class="thinking-animation">
              <text class="thinking-text">AI正在思考中</text>
              <view class="thinking-dots">
                <text class="dot">.</text>
                <text class="dot">.</text>
                <text class="dot">.</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 快捷问题 -->
      <view v-if="messages.length === 0 && !isThinking" class="quick-questions">
        <text class="quick-title">💡 试试这些问题：</text>
        <view class="question-list">
          <view
            v-for="(question, index) in quickQuestions"
            :key="index"
            class="question-item"
            @tap="sendQuickQuestion(question)"
          >
            <text class="question-text">{{ question }}</text>
          </view>
        </view>
      </view>

      <!-- 输入区域 -->
      <view class="input-area">
        <view class="input-container">
          <input
            class="message-input"
            v-model="inputMessage"
            placeholder="输入您的问题..."
            @confirm="sendMessage"
            @input="onInputChange"
            confirm-type="send"
            :focus="inputFocus"
          />
          <button
            class="send-btn"
            @tap="sendMessage"
            :disabled="!inputMessage.trim() || isThinking"
          >
            <text class="send-icon">{{ isThinking ? '⏳' : '📤' }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      monthlyIncome: 0,
      monthlyExpense: 0,
      targets: {
        monthlyTarget: 0,
        yearlyTarget: 0,
        monthlyBudget: 0,
        yearlyBudget: 0
      },
      messages: [],
      inputMessage: '',
      isThinking: false,
      scrollTop: 0,
      inputFocus: false,
      quickQuestions: [
        '分析我这个月的收支情况',
        '我的支出是否合理？',
        '如何提高我的储蓄率？',
        '给我一些理财建议',
        '我能达成收入目标吗？',
        '如何控制支出？'
      ]
    }
  },

  onLoad() {
    this.loadTargets()
    this.calculateMonthlyData()
    this.loadChatHistory()
  },

  methods: {

    loadTargets() {
      try {
        const targets = uni.getStorageSync('targets')
        if (targets) {
          this.targets = targets
        }
      } catch (e) {
        console.error('加载目标失败:', e)
      }
    },

    calculateMonthlyData() {
      try {
        const records = uni.getStorageSync('records') || []
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        this.monthlyIncome = 0
        this.monthlyExpense = 0

        records.forEach(record => {
          const recordDate = new Date(record.timestamp)
          if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
            if (record.type === '收入') {
              this.monthlyIncome += record.amount
            } else {
              this.monthlyExpense += record.amount
            }
          }
        })
      } catch (e) {
        console.error('计算月度数据失败:', e)
      }
    },

    loadChatHistory() {
      try {
        const history = uni.getStorageSync('chatHistory') || []
        this.messages = history
        this.scrollToBottom()
      } catch (e) {
        console.error('加载聊天历史失败:', e)
      }
    },

    saveChatHistory() {
      try {
        uni.setStorageSync('chatHistory', this.messages)
      } catch (e) {
        console.error('保存聊天历史失败:', e)
      }
    },

    sendQuickQuestion(question) {
      this.inputMessage = question
      this.sendMessage()
    },

    onInputChange(e) {
      this.inputMessage = e.detail.value
    },

    async sendMessage() {
      if (!this.inputMessage.trim() || this.isThinking) return

      const userMessage = {
        type: 'user',
        content: this.inputMessage.trim(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }

      this.messages.push(userMessage)
      const question = this.inputMessage.trim()
      this.inputMessage = ''
      this.isThinking = true

      this.scrollToBottom()

      try {
        // 构建上下文提示词
        const prompt = this.buildChatPrompt(question)

        // 调用AI API
        const response = await this.callAIAPI(prompt)

        const aiMessage = {
          type: 'ai',
          content: response,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }

        this.messages.push(aiMessage)
        this.saveChatHistory()
        this.scrollToBottom()

      } catch (error) {
        console.error('AI回复失败:', error)
        const errorMessage = {
          type: 'ai',
          content: '抱歉，我现在无法回答您的问题。请稍后再试或联系技术支持。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        this.messages.push(errorMessage)
      } finally {
        this.isThinking = false
        this.scrollToBottom()
        // 重新激活输入框
        this.$nextTick(() => {
          this.inputFocus = true
        })
      }
    },

    buildChatPrompt(question) {
      const financialData = {
        monthlyIncome: this.monthlyIncome,
        monthlyExpense: this.monthlyExpense,
        balance: this.monthlyIncome - this.monthlyExpense,
        incomeTarget: this.targets.monthlyTarget,
        expenseTarget: this.targets.monthlyBudget
      }

      return `你是一个专业的AI财务助手，请根据用户的财务数据回答问题。

用户当前财务状况：
- 本月收入：${financialData.monthlyIncome}元
- 本月支出：${financialData.monthlyExpense}元
- 本月结余：${financialData.balance}元
- 收入目标：${financialData.incomeTarget}元
- 支出预算：${financialData.expenseTarget}元

用户问题：${question}

请提供专业、实用的建议，语言要友好亲切，回答要简洁明了，控制在200字以内。`
    },

     async callAIAPI(prompt) {
       try {
         // 调用后台AI API
         const financialData = {
           monthlyIncome: this.monthlyIncome,
           monthlyExpense: this.monthlyExpense,
           incomeTarget: this.targets.monthlyTarget,
           expenseTarget: this.targets.monthlyBudget
         }

         const response = await uni.request({
           url: 'https://your-backend-api.com/api/ai/deepseek/chat', // 替换为您的后台API地址
           method: 'POST',
           header: {
             'Content-Type': 'application/json'
           },
           data: {
             message: prompt,
             context: financialData,
             timestamp: Date.now()
           }
         })

         if (response.statusCode === 200 && response.data.success) {
           return response.data.reply
         } else {
           throw new Error(response.data.message || 'AI服务暂时不可用')
         }
       } catch (error) {
         console.error('AI API调用失败:', error)
         // 如果API调用失败，返回模拟响应
         return this.getMockResponse(prompt)
       }
     },

     getMockResponse(prompt) {
       // 模拟AI响应，当后台API不可用时使用
       const responses = [
         '根据您的财务数据分析，您本月的收支情况整体良好。建议您继续保持当前的理财习惯，同时可以考虑增加一些投资来提高收益。',
         '您的支出控制得不错！建议您可以设定一个紧急备用金，通常为3-6个月的生活费用，这样可以更好地应对突发情况。',
         '从数据来看，您有很好的储蓄习惯。建议您可以考虑一些稳健的投资方式，如定期存款、货币基金等，让钱生钱。',
         '您的收入目标设定很合理。建议您可以制定一个详细的月度预算计划，这样可以更好地控制支出并实现目标。',
         '建议您记录每一笔支出的具体用途，这样可以更清楚地了解钱都花在哪里，从而找到节省的空间。',
         '从您的财务状况来看，建议您可以尝试"50/30/20"法则：50%用于必需品，30%用于娱乐，20%用于储蓄和投资。',
         '您可以考虑开设一个高收益储蓄账户，将部分资金进行定期存款，这样既安全又能获得稳定收益。'
       ]

       return responses[Math.floor(Math.random() * responses.length)]
     },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 0;
  background: #F9FAFB;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.data-overview {
  background: #FFFFFF;
  padding: 24rpx;
  border-bottom: 1rpx solid #E5E7EB;
}

.overview-header {
  margin-bottom: 16rpx;
}

.overview-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.overview-item {
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
  border: 1rpx solid #E5E7EB;
}

.overview-label {
  display: block;
  font-size: 22rpx;
  color: #6B7280;
  margin-bottom: 8rpx;
}

.overview-value {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1F2937;
}

.overview-value.income {
  color: #10B981;
}

.overview-value.expense {
  color: #EF4444;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200rpx);
}

.chat-header {
  background: #FFFFFF;
  padding: 24rpx;
  border-bottom: 1rpx solid #E5E7EB;
  text-align: center;
}

.chat-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8rpx;
  display: block;
}

.chat-subtitle {
  font-size: 22rpx;
  color: #6B7280;
  display: block;
}

.message-list {
  flex: 1;
  padding: 24rpx;
  background: #F9FAFB;
}

.message-item {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin: 0 16rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1);
}

.user-message .message-avatar {
  background: #6B7280;
  color: white;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.user-message .message-content {
  background: #6B7280;
  color: white;
  border-radius: 20rpx 20rpx 8rpx 20rpx;
}

.ai-message .message-content {
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 20rpx 8rpx;
  box-shadow: 0 1rpx 3rpx rgba(0,0,0,0.1);
}

.message-text {
  display: block;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: #1F2937;
}

.user-message .message-text {
  color: white;
}

.message-time {
  display: block;
  font-size: 20rpx;
  color: #9CA3AF;
  padding: 0 20rpx 12rpx;
}

.user-message .message-time {
  color: rgba(255,255,255,0.7);
  text-align: right;
}

.thinking-animation {
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
}

.thinking-text {
  font-size: 24rpx;
  color: #6B7280;
  margin-right: 12rpx;
}

.thinking-dots {
  display: flex;
}

.dot {
  font-size: 24rpx;
  color: #6B7280;
  animation: thinking 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.quick-questions {
  padding: 24rpx;
  background: #F9FAFB;
}

.quick-title {
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
  display: block;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.question-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  border: 1rpx solid #E5E7EB;
  transition: all 0.3s;
}

.question-item:active {
  background: #F3F4F6;
  transform: translateY(1rpx);
}

.question-text {
  font-size: 24rpx;
  color: #374151;
}

.input-area {
  background: #FFFFFF;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #E5E7EB;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.message-input {
  flex: 1;
  height: 72rpx;
  border: 1rpx solid #E5E7EB;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  background: #F9FAFB;
  color: #1F2937;
  box-sizing: border-box;
}

.message-input:focus {
  border-color: #6B7280;
  background: #FFFFFF;
  outline: none;
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #6B7280;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-btn:disabled {
  background: #D1D5DB;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-icon {
  font-size: 28rpx;
  color: white;
}
</style>
