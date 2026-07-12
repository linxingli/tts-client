import { EdgeTTS, listVoices } from 'edge-tts-universal'
import type { Voice, SynthOptions } from '../../shared/types'

/**
 * 数值偏移转为 edge-tts 的百分比字符串
 * @param n 偏移值，正数加快/变大，负数减慢/变小
 * @returns 形如 "+20%" / "-10%" / "+0%"
 */
function formatPercent(n: number): string {
  if (n === 0) return '+0%'
  return (n > 0 ? '+' : '') + n + '%'
}

/**
 * 数值偏移转为 edge-tts 的音调字符串
 * @param n 偏移值，单位 Hz
 * @returns 形如 "+5Hz" / "-10Hz" / "+0Hz"
 */
function formatPitch(n: number): string {
  if (n === 0) return '+0Hz'
  return (n > 0 ? '+' : '') + n + 'Hz'
}

/**
 * 清洗 Markdown / YAML frontmatter / HTML 等标记，保留可读纯文本
 * @param text 原始文本
 * @returns 清洗后的文本
 */
function sanitizeText(text: string): string {
  return (
    text
      // YAML frontmatter
      .replace(/^---[\s\S]*?---/m, ' ')
      // 代码块
      .replace(/```[\s\S]*?```/g, ' ')
      // 行内代码
      .replace(/`([^`]+)`/g, '$1')
      // 图片 ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // 链接 [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // HTML 标签
      .replace(/<[^>]+>/g, ' ')
      // 标题 #
      .replace(/^#{1,6}\s+/gm, '')
      // 引用 >
      .replace(/^>\s+/gm, '')
      // 列表标记 - * + 1.
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // 粗体/斜体
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // 合并空白
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * 获取音色列表，中文音色置顶
 * @returns 精简后的音色列表
 */
export async function fetchVoices(): Promise<Voice[]> {
  const all = await listVoices()
  return all
    .map((v) => ({
      ShortName: v.ShortName,
      FriendlyName: v.FriendlyName,
      Locale: v.Locale,
      Gender: v.Gender
    }))
    .sort((a, b) => {
      // zh-CN 最前，其次其它 zh-*，再按语言排序
      const score = (l: string) => (l === 'zh-CN' ? 0 : l.startsWith('zh') ? 1 : 2)
      return score(a.Locale) - score(b.Locale) || a.Locale.localeCompare(b.Locale)
    })
}

/**
 * 合成单段文本为 mp3 Buffer
 * @param text 待合成文本
 * @param opts 合成参数（音色/语速/音量/音调）
 * @returns mp3 二进制 Buffer
 */
export async function synthesizeText(text: string, opts: SynthOptions): Promise<Buffer> {
  const clean = sanitizeText(text)
  if (!clean) throw new Error('没有可朗读的内容')
  const tts = new EdgeTTS(clean, opts.voice, {
    rate: formatPercent(opts.rate),
    pitch: formatPitch(opts.pitch)
  })
  const result = await tts.synthesize()
  const arrayBuffer = await result.audio.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
