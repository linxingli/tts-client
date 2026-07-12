import Store from 'electron-store'
import type { HistoryItem, AISettings } from '../../shared/types'

interface StoreSchema {
  history: HistoryItem[]
  aiSettings: AISettings
}

const store = new Store<StoreSchema>({
  defaults: {
    history: [],
    aiSettings: {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    }
  }
})

// 历史记录最多保留条数
const MAX_HISTORY = 100

/**
 * 生成唯一 id
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * 读取全部历史记录（按时间倒序）
 */
export function getHistory(): HistoryItem[] {
  return store.get('history')
}

/**
 * 新增一条历史记录
 */
export function addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const full: HistoryItem = {
    ...item,
    id: generateId(),
    createdAt: Date.now()
  }
  const list = store.get('history')
  list.unshift(full)
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY
  store.set('history', list)
  return full
}

/**
 * 删除指定 id 的历史记录
 */
export function removeHistory(id: string): void {
  const list = store.get('history').filter((item) => item.id !== id)
  store.set('history', list)
}

/**
 * 清空全部历史记录
 */
export function clearHistory(): void {
  store.set('history', [])
}

/**
 * 读取 AI 总结设置
 */
export function getAISettings(): AISettings {
  return store.get('aiSettings')
}

/**
 * 保存 AI 总结设置
 */
export function setAISettings(s: AISettings): void {
  store.set('aiSettings', s)
}
