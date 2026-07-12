<template>
  <div class="tts-app">
    <header class="tts-app-header">
      <h1 class="tts-app-title">文字转语音</h1>
      <button class="tts-btn" @click="showSettings = true">AI 设置</button>
    </header>
    <main class="tts-app-main">
      <section class="tts-app-left">
        <TextInput
          v-model:text="text"
          :summarizing="summarizing"
          @export="handleExport"
          @summarize="handleSummarize"
        />
        <VoiceSettings
          v-model:voice="voice"
          v-model:rate="rate"
          v-model:pitch="pitch"
          v-model:volume="volume"
          :voices="voices"
        />
        <Player
          :is-playing="isPlaying"
          :current-index="currentIndex"
          :total="segments.length"
          :can-prev="currentIndex > 0"
          :can-next="currentIndex < segments.length - 1"
          @toggle="togglePlay"
          @stop="stop"
          @prev="playPrev"
          @next="playNext"
        />
        <p v-if="message" class="tts-app-message" :class="messageType">{{ message }}</p>
      </section>
      <aside class="tts-app-right">
        <HistoryList
          :items="history"
          @select="handleHistorySelect"
          @remove="handleHistoryRemove"
          @clear="handleHistoryClear"
        />
      </aside>
    </main>
    <AISettingsModal v-if="showSettings" @close="showSettings = false" />
    <SummaryModal
      v-if="showSummary"
      :content="summaryContent"
      @close="showSummary = false"
      @apply="handleSummaryApply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import TextInput from './components/text-input.vue'
import VoiceSettings from './components/voice-settings.vue'
import Player from './components/player.vue'
import HistoryList from './components/history-list.vue'
import AISettingsModal from './components/ai-settings-modal.vue'
import SummaryModal from './components/summary-modal.vue'
import type { Voice, HistoryItem } from '../../shared/types'

const text = ref('')
const voices = ref<Voice[]>([])
const voice = ref('zh-CN-XiaoxiaoNeural')
const rate = ref(0)
const pitch = ref(0)
const volume = ref(100)

const segments = ref<string[]>([])
const currentIndex = ref(-1)
const isPlaying = ref(false)

const history = ref<HistoryItem[]>([])
const message = ref('')
const messageType = ref<'info' | 'error'>('info')

// AI 总结相关状态
const showSettings = ref(false)
const showSummary = ref(false)
const summaryContent = ref('')
const summarizing = ref(false)

const audio = new Audio()
const cache = new Map<number, ArrayBuffer>()
let currentUrl = ''
let messageTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 切分文本为朗读段落（按中英文句末标点和换行），并合并过短段落
 */
function splitText(t: string): string[] {
  const raw = t
    .split(/(?<=[。！？!?])/)
    .flatMap((s) => s.split('\n'))
    .map((s) => s.trim())
    .filter(Boolean)

  // 合并相邻短段落，避免空段/极短段触发 TTS API 错误
  const merged: string[] = []
  const MIN_LEN = 30
  let current = ''
  for (const seg of raw) {
    if (current.length < MIN_LEN) {
      current += seg
    } else {
      merged.push(current)
      current = seg
    }
  }
  if (current) merged.push(current)
  return merged
}

function currentOpts() {
  return { voice: voice.value, rate: rate.value, pitch: pitch.value }
}

function showMessage(msg: string, type: 'info' | 'error' = 'info') {
  message.value = msg
  messageType.value = type
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    message.value = ''
  }, 3000)
}

/**
 * 合成指定段落并缓存
 */
async function ensureSynth(index: number): Promise<ArrayBuffer | null> {
  if (cache.has(index)) return cache.get(index)!
  const seg = segments.value[index]
  if (!seg) return null
  try {
    const buf = await window.tts.synthesize(seg, currentOpts())
    cache.set(index, buf)
    return buf
  } catch (e) {
    console.error(`[ensureSynth] 第 ${index + 1} 段合成失败：`, e)
    return null
  }
}

function setAudioSource(buf: ArrayBuffer) {
  if (currentUrl) URL.revokeObjectURL(currentUrl)
  currentUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/mp3' }))
  audio.src = currentUrl
}

/**
 * 播放指定段落，并预合成下一段
 */
async function playSegment(index: number) {
  if (index < 0 || index >= segments.value.length) {
    stop()
    return
  }
  const buf = await ensureSynth(index)
  if (!buf) {
    // 单段失败时跳过，继续播放下一段，避免整篇中断
    if (index + 1 < segments.value.length) {
      showMessage(`第 ${index + 1} 段合成失败，已跳过`)
      void playSegment(index + 1)
    } else {
      stop()
      showMessage('语音合成失败，请检查网络连接后重试', 'error')
    }
    return
  }
  setAudioSource(buf)
  currentIndex.value = index
  isPlaying.value = true
  audio.play().catch(() => showMessage('播放失败', 'error'))
  // 预合成下一段，减少段间停顿
  if (index + 1 < segments.value.length) {
    void ensureSynth(index + 1)
  }
}

audio.onended = () => {
  if (currentIndex.value + 1 < segments.value.length) {
    void playSegment(currentIndex.value + 1)
  } else {
    isPlaying.value = false
    currentIndex.value = -1
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
      currentUrl = ''
    }
  }
}

/**
 * 从头开始播放
 */
async function handlePlay() {
  if (!text.value.trim()) {
    showMessage('请输入要朗读的文字', 'error')
    return
  }
  segments.value = splitText(text.value)
  if (segments.value.length === 0) {
    showMessage('没有可朗读的内容', 'error')
    return
  }
  cache.clear()
  // 存历史记录
  try {
    const item = await window.tts.history.add({
      text: text.value,
      voice: voice.value,
      rate: rate.value,
      pitch: pitch.value
    })
    history.value.unshift(item)
  } catch {
    // 历史保存失败不阻断播放
  }
  await playSegment(0)
}

function togglePlay() {
  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else if (currentIndex.value === -1) {
    void handlePlay()
  } else {
    isPlaying.value = true
    audio.play().catch(() => showMessage('播放失败', 'error'))
  }
}

function stop() {
  audio.pause()
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl)
    currentUrl = ''
  }
  audio.src = ''
  isPlaying.value = false
  currentIndex.value = -1
}

function playPrev() {
  if (currentIndex.value > 0) void playSegment(currentIndex.value - 1)
}

function playNext() {
  if (currentIndex.value < segments.value.length - 1) void playSegment(currentIndex.value + 1)
}

/**
 * 音色/语速/音调变化需重新合成
 */
function handleOptsChange() {
  cache.clear()
  if (isPlaying.value || currentIndex.value !== -1) {
    stop()
    showMessage('参数已更新，点击播放重新生成')
  }
}

async function handleExport() {
  if (!text.value.trim()) {
    showMessage('请输入要导出的文字', 'error')
    return
  }
  const segs = splitText(text.value)
  if (segs.length === 0) {
    showMessage('没有可导出的内容', 'error')
    return
  }
  try {
    showMessage('正在生成音频，请稍候...')
    const { savedPath } = await window.tts.exportAudio(segs, currentOpts())
    if (savedPath) {
      showMessage('已导出：' + savedPath)
    }
  } catch (e) {
    showMessage((e as Error).message || '导出失败', 'error')
  }
}

/**
 * 一键润色总结，弹窗预览后写入
 */
async function handleSummarize() {
  if (!text.value.trim()) {
    showMessage('请输入要总结的文字', 'error')
    return
  }
  // 未配置 API Key 时引导打开设置
  let hasKey = false
  try {
    const s = await window.tts.settings.get()
    hasKey = !!s.apiKey
  } catch {
    // 读取失败交给后续流程报错
  }
  if (!hasKey) {
    showMessage('请先在 AI 设置中配置 API Key', 'error')
    showSettings.value = true
    return
  }
  summarizing.value = true
  showMessage('正在总结，请稍候...')
  try {
    const { content } = await window.tts.summarize(text.value)
    summaryContent.value = content
    showSummary.value = true
    message.value = ''
  } catch (e) {
    showMessage((e as Error).message || '总结失败', 'error')
  } finally {
    summarizing.value = false
  }
}

/**
 * 将总结结果写入输入框（覆盖原文，已有预览确认）
 */
function handleSummaryApply(v: string) {
  text.value = v
  showSummary.value = false
  cache.clear()
  showMessage('已写入总结结果')
}

async function loadHistory() {
  try {
    history.value = await window.tts.history.list()
  } catch {
    // 忽略
  }
}

function handleHistorySelect(item: HistoryItem) {
  text.value = item.text
  voice.value = item.voice
  rate.value = item.rate
  pitch.value = item.pitch
  stop()
  cache.clear()
  showMessage('已加载历史记录')
}

async function handleHistoryRemove(id: string) {
  await window.tts.history.remove(id)
  history.value = history.value.filter((h) => h.id !== id)
}

async function handleHistoryClear() {
  await window.tts.history.clear()
  history.value = []
}

// 音色/语速/音调变化 -> 重新合成；音量变化 -> 实时调节播放音量
watch([voice, rate, pitch], () => handleOptsChange())
watch(volume, (v) => {
  audio.volume = v / 100
})

onMounted(async () => {
  audio.volume = volume.value / 100
  try {
    voices.value = await window.tts.listVoices()
    if (voices.value.length > 0 && !voices.value.find((v) => v.ShortName === voice.value)) {
      voice.value = voices.value[0].ShortName
    }
  } catch {
    showMessage('获取音色列表失败，请检查网络', 'error')
  }
  await loadHistory()
})

onBeforeUnmount(() => {
  audio.pause()
  if (currentUrl) URL.revokeObjectURL(currentUrl)
  if (messageTimer) clearTimeout(messageTimer)
})
</script>
