import { ipcMain } from 'electron'
import axios from 'axios'
import { getAISettings } from '../lib/store'
import type { AISettings } from '../../shared/types'

// 润色 + 总结合一的系统提示词
const SYSTEM_PROMPT = `你是专业的文字编辑助手。请对用户提供的文章进行润色并总结：
1. 修正语病、错别字，优化语句表达，使文字通顺自然；
2. 提炼文章核心要点，保留关键信息，去除冗余；
3. 输出一段通顺的总结正文，不要使用 markdown 标题或列表标记。`

/**
 * 调用 OpenAI 兼容的 chat/completions 接口生成总结
 */
async function summarizeText(text: string, settings: AISettings): Promise<string> {
  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`
  const res = await axios.post(
    url,
    {
      model: settings.model,
      temperature: 0.5,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ]
    },
    {
      headers: { Authorization: `Bearer ${settings.apiKey}` },
      timeout: 60000
    }
  )
  const content = res.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')
  return content.trim()
}

/**
 * 注册 AI 总结相关 IPC
 */
export function registerSummarizeIpc(): void {
  ipcMain.handle('tts:summarize', async (_event, text: string) => {
    const settings = getAISettings()
    if (!settings.apiKey) throw new Error('未配置 API Key，请先在设置中配置')
    if (!text || !text.trim()) throw new Error('没有可总结的内容')
    try {
      const content = await summarizeText(text, settings)
      return { content }
    } catch (e: unknown) {
      // 常见错误转友好提示
      const err = e as { response?: { status: number }; code?: string; message?: string }
      if (err.response?.status === 401) throw new Error('API Key 无效，请检查设置')
      if (err.code === 'ECONNABORTED') throw new Error('请求超时，请稍后重试')
      if (err.response) throw new Error(`AI 服务返回错误（${err.response.status}）`)
      throw new Error(err.message || '总结失败，请检查网络连接')
    }
  })
}
