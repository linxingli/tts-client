// TTS 核心功能验证脚本（不依赖 electron，直接用 node 运行）
import { EdgeTTS, listVoices } from 'edge-tts-universal'

console.log('1) 测试获取音色列表...')
const voices = await listVoices()
const zh = voices.filter((v) => v.Locale === 'zh-CN')
console.log(`   共 ${voices.length} 个音色，中文 ${zh.length} 个，示例：${zh[0]?.ShortName}`)

console.log('2) 测试合成语音...')
const tts = new EdgeTTS('你好，这是一个文字转语音测试。', 'zh-CN-XiaoxiaoNeural', {
  rate: '+0%',
  pitch: '+0Hz'
})
const result = await tts.synthesize()
const buf = Buffer.from(await result.audio.arrayBuffer())
console.log(`   合成成功，音频大小：${buf.length} 字节`)
console.log('测试通过 ✓')
