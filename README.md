# TTS 文字转语音客户端

基于 Electron + edge-tts 的桌面文字转语音应用。调用微软 Edge 在线 TTS 服务，音质好、无需 API Key。

## 功能

- 文字转语音播放
- 音色 / 语速 / 音调 / 音量调节（音量实时生效，其余重新合成）
- 长文本按句分段连续播放，预合成下一段减少停顿
- 导出为 MP3 文件（多段拼接）
- 历史记录持久化，可一键回填

## 环境要求

- Node.js 18.17+
- 需联网（TTS 服务在线调用）

## 开发

```bash
npm install
npm run dev
```

## 打包（Windows 安装包）

```bash
npm run build:win
```

产物在 `dist/` 目录。

## 目录结构

```
src/
├── main/          # 主进程：TTS 合成、IPC、历史存储
├── preload/       # 预加载：contextBridge 桥接
├── renderer/      # 渲染进程：Vue UI
└── shared/        # 共享类型
```

## 说明

- TTS 引擎使用 `edge-tts-universal`，因浏览器无法设置 WebSocket 自定义头，合成在主进程完成，音频数据经 IPC 传给渲染进程播放。
- 音量通过 `audio.volume` 实时调节，无需重新合成；音色 / 语速 / 音调为合成参数，修改后需重新播放。
