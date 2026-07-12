<template>
  <Modal title="AI 总结设置" width="480px" @close="emit('close')">
    <div class="tts-ai-form">
      <div class="tts-ai-row">
        <label class="tts-ai-label">服务商</label>
        <select class="tts-ai-select" v-model="presetKey" @change="onPresetChange">
          <option v-for="p in PRESETS" :key="p.key" :value="p.key">{{ p.label }}</option>
        </select>
      </div>
      <div class="tts-ai-row">
        <label class="tts-ai-label">API Key</label>
        <input
          class="tts-ai-input"
          type="password"
          v-model="form.apiKey"
          placeholder="sk-..."
          autocomplete="off"
        />
      </div>
      <div class="tts-ai-row">
        <label class="tts-ai-label">Base URL</label>
        <input class="tts-ai-input" v-model="form.baseUrl" placeholder="https://..." />
      </div>
      <div class="tts-ai-row">
        <label class="tts-ai-label">模型</label>
        <input class="tts-ai-input" v-model="form.model" placeholder="模型名" />
      </div>
      <p class="tts-ai-tip">{{ tip }}</p>
      <p v-if="errorMsg" class="tts-ai-error">{{ errorMsg }}</p>
    </div>
    <template #footer>
      <button class="tts-btn" @click="emit('close')">取消</button>
      <button class="tts-btn tts-btn-primary" :disabled="saving" @click="onSave">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue'
import Modal from './modal.vue'
import type { AISettings } from '../../../shared/types'

const emit = defineEmits<{ (e: 'close'): void }>()

// OpenAI 兼容端点预设，选择后自动填充 baseUrl + model
const PRESETS = [
  {
    key: 'deepseek',
    label: 'DeepSeek（国内直连）',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    tip: '在 platform.deepseek.com 注册获取 API Key，国内直连无需代理。'
  },
  {
    key: 'zhipu',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    tip: '在 open.bigmodel.cn 获取 API Key。'
  },
  {
    key: 'qwen',
    label: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    tip: '在 dashscope.aliyun.com 获取 API Key。'
  },
  {
    key: 'moonshot',
    label: 'Moonshot（Kimi）',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    tip: '在 platform.moonshot.cn 获取 API Key。'
  },
  {
    key: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    tip: '需代理访问 platform.openai.com 获取 Key。'
  },
  {
    key: 'gemini',
    label: 'Gemini（兼容端点）',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-1.5-flash',
    tip: '在 aistudio.google.com 获取 Key，需代理访问。'
  },
  {
    key: 'custom',
    label: '自定义',
    baseUrl: '',
    model: '',
    tip: '填写任意 OpenAI 兼容的 chat/completions 端点。'
  }
]

const form = ref<AISettings>({ apiKey: '', baseUrl: '', model: '' })
const presetKey = ref('custom')
const tip = computed(() => PRESETS.find((p) => p.key === presetKey.value)?.tip || '')
const errorMsg = ref('')
const saving = ref(false)

onMounted(async () => {
  const s = await window.tts.settings.get()
  form.value = { ...s }
  // 反向匹配当前配置对应的预设
  const matched = PRESETS.find((p) => p.baseUrl === s.baseUrl && p.model === s.model)
  presetKey.value = matched ? matched.key : 'custom'
})

function onPresetChange() {
  const p = PRESETS.find((x) => x.key === presetKey.value)
  if (p && p.key !== 'custom') {
    form.value.baseUrl = p.baseUrl
    form.value.model = p.model
  }
}

async function onSave() {
  errorMsg.value = ''
  saving.value = true
  try {
    await window.tts.settings.set(toRaw(form.value))
    emit('close')
  } catch (e) {
    console.error('[ai-settings] 保存失败：', e)
    const msg = (e as Error).message || '保存失败，请重试'
    errorMsg.value = msg.includes('No handler registered')
      ? '主进程未加载新代码，请重启应用（npm run dev）后重试'
      : msg
  } finally {
    saving.value = false
  }
}
</script>
