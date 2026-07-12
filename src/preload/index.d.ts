import type { TTSApi } from '../shared/types'

declare global {
  interface Window {
    tts: TTSApi
  }
}
