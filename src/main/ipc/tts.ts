import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'
import { fetchVoices, synthesizeText } from '../lib/tts-engine'
import type { SynthOptions } from '../../shared/types'

/**
 * 注册 TTS 相关 IPC
 */
export function registerTTSIpc(): void {
  // 获取音色列表
  ipcMain.handle('tts:listVoices', async () => {
    try {
      return await fetchVoices()
    } catch (e) {
      throw new Error('获取音色列表失败，请检查网络连接')
    }
  })

  // 合成单段文本，返回 ArrayBuffer
  ipcMain.handle('tts:synthesize', async (_event, text: string, opts: SynthOptions) => {
    try {
      const buffer = await synthesizeText(text, opts)
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    } catch (e) {
      console.error('[tts:synthesize] 原始错误：', e)
      throw new Error('语音合成失败，请检查网络连接后重试')
    }
  })

  // 导出多段合成为一个 mp3 文件
  ipcMain.handle(
    'tts:export',
    async (event, segments: string[], opts: SynthOptions) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showSaveDialog(win!, {
        title: '导出音频',
        defaultPath: `tts-${Date.now()}.mp3`,
        filters: [{ name: 'MP3 音频', extensions: ['mp3'] }]
      })
      if (result.canceled || !result.filePath) {
        return { savedPath: '' }
      }
      // 逐段合成并拼接（mp3 支持直接 concat）
      const buffers: Buffer[] = []
      for (const seg of segments) {
        if (!seg.trim()) continue
        buffers.push(await synthesizeText(seg, opts))
      }
      await writeFile(result.filePath, Buffer.concat(buffers))
      return { savedPath: result.filePath }
    }
  )
}
