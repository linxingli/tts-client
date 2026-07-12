import { ipcMain } from 'electron'
import { getAISettings, setAISettings } from '../lib/store'
import type { AISettings } from '../../shared/types'

/**
 * 注册 AI 设置相关 IPC
 */
export function registerSettingsIpc(): void {
  // 读取 AI 总结设置
  ipcMain.handle('settings:get', () => getAISettings())

  // 保存 AI 总结设置
  ipcMain.handle('settings:set', (_event, s: AISettings) => {
    setAISettings(s)
  })
}
