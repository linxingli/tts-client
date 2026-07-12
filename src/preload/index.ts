import { contextBridge, ipcRenderer } from 'electron'
import type { SynthOptions, HistoryItem, AISettings, TTSApi } from '../shared/types'

const tts: TTSApi = {
  listVoices: () => ipcRenderer.invoke('tts:listVoices'),
  synthesize: (text: string, opts: SynthOptions) =>
    ipcRenderer.invoke('tts:synthesize', text, opts),
  exportAudio: (segments: string[], opts: SynthOptions) =>
    ipcRenderer.invoke('tts:export', segments, opts),
  summarize: (text: string) => ipcRenderer.invoke('tts:summarize', text),
  history: {
    list: () => ipcRenderer.invoke('history:list'),
    add: (item: Omit<HistoryItem, 'id' | 'createdAt'>) =>
      ipcRenderer.invoke('history:add', item),
    remove: (id: string) => ipcRenderer.invoke('history:remove', id),
    clear: () => ipcRenderer.invoke('history:clear')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (s: AISettings) => ipcRenderer.invoke('settings:set', s)
  }
}

contextBridge.exposeInMainWorld('tts', tts)
console.log('[preload] tts api exposed')
