<template>
  <Modal title="总结结果" width="560px" @close="emit('close')">
    <p class="tts-summary-tip">已润色并总结，可在下方编辑后写入输入框：</p>
    <textarea class="tts-summary-area" v-model="edited"></textarea>
    <template #footer>
      <button class="tts-btn" @click="emit('close')">取消</button>
      <button class="tts-btn tts-btn-primary" @click="onApply">写入</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './modal.vue'

const props = defineProps<{ content: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'apply', v: string): void }>()

const edited = ref(props.content)
// 弹窗以新内容打开时同步到编辑框
watch(() => props.content, (v) => {
  edited.value = v
})

function onApply() {
  emit('apply', edited.value)
}
</script>
