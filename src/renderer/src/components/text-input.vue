<template>
  <div class="tts-text-input">
    <div class="tts-text-input-header">
      <span class="tts-text-input-label">输入文字</span>
      <div class="tts-text-input-actions">
        <button class="tts-btn" :disabled="summarizing" @click="$emit('summarize')">
          {{ summarizing ? '总结中...' : '总结' }}
        </button>
        <button class="tts-btn" @click="$emit('export')">导出 MP3</button>
      </div>
    </div>
    <textarea
      class="tts-text-input-area"
      :value="text"
      placeholder="请输入要朗读的文字..."
      @input="$emit('update:text', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text: string; summarizing?: boolean }>()
defineEmits<{
  (e: 'update:text', v: string): void
  (e: 'export'): void
  (e: 'summarize'): void
}>()
</script>
