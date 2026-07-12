<template>
  <div class="tts-player">
    <button class="tts-btn" :disabled="!canPrev" @click="$emit('prev')">上一段</button>
    <button class="tts-btn tts-btn-primary" @click="$emit('toggle')">
      {{ isPlaying ? '暂停' : '播放' }}
    </button>
    <button class="tts-btn" :disabled="!canNext" @click="$emit('next')">下一段</button>
    <button class="tts-btn" @click="$emit('stop')">停止</button>
    <span class="tts-player-progress">
      {{ currentIndex >= 0 ? `第 ${currentIndex + 1} / ${total} 段` : `共 ${total} 段` }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean
  currentIndex: number
  total: number
  canPrev: boolean
  canNext: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'stop'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>
