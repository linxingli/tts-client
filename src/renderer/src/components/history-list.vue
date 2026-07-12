<template>
  <div class="tts-history">
    <div class="tts-history-header">
      <span class="tts-history-label">历史记录</span>
      <button
        class="tts-btn tts-btn-text"
        :disabled="items.length === 0"
        @click="$emit('clear')"
      >
        清空
      </button>
    </div>
    <ul class="tts-history-list">
      <li v-if="items.length === 0" class="tts-history-empty">暂无历史记录</li>
      <li v-for="item in items" :key="item.id" class="tts-history-item">
        <div class="tts-history-item-text" :title="item.text" @click="$emit('select', item)">
          {{ item.text }}
        </div>
        <span class="tts-history-item-time">{{ formatTime(item.createdAt) }}</span>
        <button class="tts-btn tts-btn-text" @click="$emit('remove', item.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { HistoryItem } from '../../../shared/types'

defineProps<{ items: HistoryItem[] }>()

defineEmits<{
  (e: 'select', item: HistoryItem): void
  (e: 'remove', id: string): void
  (e: 'clear'): void
}>()

/**
 * 格式化时间戳为 月/日 时:分
 */
function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>
