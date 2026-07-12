import { ipcMain } from 'electron'
import { getHistory, addHistory, removeHistory, clearHistory } from '../lib/store'
import type { HistoryItem } from '../../shared/types'

/**
 * 注册历史记录相关 IPC
 */
export function registerHistoryIpc(): void {
  ipcMain.handle('history:list', () => getHistory())

  ipcMain.handle(
    'history:add',
    (_event, item: Omit<HistoryItem, 'id' | 'createdAt'>) => addHistory(item)
  )

  ipcMain.handle('history:remove', (_event, id: string) => removeHistory(id))

  ipcMain.handle('history:clear', () => clearHistory())
}
