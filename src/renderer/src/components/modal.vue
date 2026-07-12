<template>
  <teleport to="body">
    <div class="tts-modal-mask" @click.self="$emit('close')">
      <div class="tts-modal" :style="{ width }">
        <div class="tts-modal-header">
          <span class="tts-modal-title">{{ title }}</span>
          <button class="tts-btn-text tts-modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="tts-modal-body">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="tts-modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; width?: string }>(), { width: '480px' })
defineEmits<{ (e: 'close'): void }>()
</script>
