/**
 * AI大模型API接口
 * 支持多个AI模型：DeepSeek、ChatGPT、Qwen等
 */

// 后台配置的API信息
const AI_CONFIG = {
  // 您的后台API地址
  baseURL: 'https://your-backend-api.com/api/ai',

  // 支持的模型列表
  models: {
    deepseek: {
      name: 'DeepSeek',
      endpoint: '/deepseek/chat'
    },
    chatgpt: {
      name: 'ChatGPT',
      endpoint: '/openai/chat'
    },
    qwen: {
      name: 'Qwen',
      endpoint: '/qwen/chat'
    }
  }
}

/**
 * 调用AI聊天接口
 * @param {string} message - 用户消息
 * @param {Object} context - 上下文信息（财务数据等）
 * @param {string} model - 使用的模型，默认为deepseek
 * @returns {Promise<string>} AI回复
 */
export async function chatWithAI(message, context = {}, model = 'deepseek') {
  try {
    const response = await uni.request({
      url: AI_CONFIG.baseURL + AI_CONFIG.models[model].endpoint,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        message: message,
        context: context,
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
    throw error
  }
}

/**
 * 获取财务分析
 * @param {Object} financialData - 财务数据
 * @param {string} model - 使用的模型
 * @returns {Promise<string>} 分析结果
 */
export async function getFinancialAnalysis(financialData, model = 'deepseek') {
  const analysisPrompt = `请分析用户的财务状况并提供专业建议：

收入情况：${financialData.monthlyIncome}元/月
支出情况：${financialData.monthlyExpense}元/月
收入目标：${financialData.incomeTarget}元/月
支出预算：${financialData.expenseTarget}元/月

请从收支平衡、目标达成、支出合理性等方面进行分析，并提供实用的改进建议。`

  return await chatWithAI(analysisPrompt, financialData, model)
}

/**
 * 后台API接口示例
 *
 * 您需要在后台实现以下接口：
 *
 * POST /api/ai/deepseek/chat
 * POST /api/ai/openai/chat
 * POST /api/ai/qwen/chat
 *
 * 请求格式：
 * {
 *   "message": "用户消息",
 *   "context": {
 *     "monthlyIncome": 10000,
 *     "monthlyExpense": 5000,
 *     "incomeTarget": 12000,
 *     "expenseTarget": 4000
 *   },
 *   "timestamp": 1234567890
 * }
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "reply": "AI回复内容",
 *   "model": "deepseek",
 *   "timestamp": 1234567890
 * }
 *
 * 错误响应：
 * {
 *   "success": false,
 *   "message": "错误信息",
 *   "code": "ERROR_CODE"
 * }
 */

// 后台实现示例（Node.js + Express）
/*
const express = require('express')
const axios = require('axios')
const app = express()

// DeepSeek API
app.post('/api/ai/deepseek/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    // 构建完整的提示词
    const prompt = buildPrompt(message, context)

    // 调用DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const reply = response.data.choices[0].message.content

    res.json({
      success: true,
      reply: reply,
      model: 'deepseek',
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务暂时不可用',
      code: 'AI_SERVICE_ERROR'
    })
  }
})

// ChatGPT API
app.post('/api/ai/openai/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    const prompt = buildPrompt(message, context)

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const reply = response.data.choices[0].message.content

    res.json({
      success: true,
      reply: reply,
      model: 'chatgpt',
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务暂时不可用',
      code: 'AI_SERVICE_ERROR'
    })
  }
})

// Qwen API
app.post('/api/ai/qwen/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    const prompt = buildPrompt(message, context)

    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        messages: [{ role: 'user', content: prompt }]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const reply = response.data.output.text

    res.json({
      success: true,
      reply: reply,
      model: 'qwen',
      timestamp: Date.now()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务暂时不可用',
      code: 'AI_SERVICE_ERROR'
    })
  }
})

function buildPrompt(message, context) {
  return `你是一个专业的AI财务助手，请根据用户的财务数据回答问题。

用户当前财务状况：
- 本月收入：${context.monthlyIncome || 0}元
- 本月支出：${context.monthlyExpense || 0}元
- 本月结余：${(context.monthlyIncome || 0) - (context.monthlyExpense || 0)}元
- 收入目标：${context.incomeTarget || 0}元
- 支出预算：${context.expenseTarget || 0}元

用户问题：${message}

请提供专业、实用的建议，语言要友好亲切，回答要简洁明了，控制在200字以内。`
}

app.listen(3000, () => {
  console.log('AI API服务启动在端口 3000')
})
*/
