// 音色信息
export interface Voice {
  ShortName: string
  FriendlyName: string
  Locale: string
  Gender: string
}

// 合成参数（合成时确定，修改后需重新合成）
export interface SynthOptions {
  voice: string
  // 语速偏移，-50 ~ +50，0 为正常
  rate: number
  // 音调偏移，-20 ~ +20，0 为正常
  pitch: number
}

// 历史记录条目
export interface HistoryItem {
  id: string
  text: string
  voice: string
  rate: number
  pitch: number
  createdAt: number
}

// AI 总结设置（OpenAI 兼容协议，支持 DeepSeek/OpenAI/智谱/通义/Gemini 等）
export interface AISettings {
  apiKey: string
  baseUrl: string
  model: string
}

// 暴露给渲染进程的 API
export interface TTSApi {
  listVoices(): Promise<Voice[]>
  synthesize(text: string, opts: SynthOptions): Promise<ArrayBuffer>
  exportAudio(segments: string[], opts: SynthOptions): Promise<{ savedPath: string }>
  summarize(text: string): Promise<{ content: string }>
  history: {
    list(): Promise<HistoryItem[]>
    add(item: Omit<HistoryItem, 'id' | 'createdAt'>): Promise<HistoryItem>
    remove(id: string): Promise<void>
    clear(): Promise<void>
  }
  settings: {
    get(): Promise<AISettings>
    set(s: AISettings): Promise<void>
  }
}
