<template>
  <div class="tts-settings">
    <div class="tts-settings-row">
      <label class="tts-settings-label">音色</label>
      <select class="tts-settings-select" :value="voice" @change="onVoiceChange">
        <option v-for="v in voices" :key="v.ShortName" :value="v.ShortName">
          {{ v.FriendlyName }}（{{ v.Gender === 'Female' ? '女' : '男' }}）
        </option>
      </select>
    </div>
    <div class="tts-settings-row">
      <label class="tts-settings-label">语速</label>
      <input
        class="tts-settings-range"
        type="range"
        min="-50"
        max="50"
        step="1"
        :value="rate"
        @input="onRateChange"
      />
      <span class="tts-settings-value">{{ rate > 0 ? '+' : '' }}{{ rate }}%</span>
    </div>
    <div class="tts-settings-row">
      <label class="tts-settings-label">音调</label>
      <input
        class="tts-settings-range"
        type="range"
        min="-20"
        max="20"
        step="1"
        :value="pitch"
        @input="onPitchChange"
      />
      <span class="tts-settings-value">{{ pitch > 0 ? '+' : '' }}{{ pitch }}Hz</span>
    </div>
    <div class="tts-settings-row">
      <label class="tts-settings-label">音量</label>
      <input
        class="tts-settings-range"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="volume"
        @input="onVolumeChange"
      />
      <span class="tts-settings-value">{{ volume }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Voice } from '../../../shared/types'

defineProps<{
  voice: string
  rate: number
  pitch: number
  volume: number
  voices: Voice[]
}>()

const emit = defineEmits<{
  (e: 'update:voice', v: string): void
  (e: 'update:rate', v: number): void
  (e: 'update:pitch', v: number): void
  (e: 'update:volume', v: number): void
}>()

function onVoiceChange(e: Event) {
  emit('update:voice', (e.target as HTMLSelectElement).value)
}
function onRateChange(e: Event) {
  emit('update:rate', Number((e.target as HTMLInputElement).value))
}
function onPitchChange(e: Event) {
  emit('update:pitch', Number((e.target as HTMLInputElement).value))
}
function onVolumeChange(e: Event) {
  emit('update:volume', Number((e.target as HTMLInputElement).value))
}
</script>
