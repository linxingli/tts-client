# 文字转语音 (TTS Client)

<p align="center">
  <strong>一个基于 Electron + Edge TTS 的桌面文字转语音应用，音质自然、无需 API Key</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-30-47848F.svg?style=flat-square&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Vue-3-42b883.svg?style=flat-square&logo=vue.js&logoColor=white" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/electron--vite-2-646cff.svg?style=flat-square" alt="electron-vite">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-0078d7.svg?style=flat-square" alt="Platform">
</p>

<p align="center">
  <a href="https://github.com/linxingli/tts-client/releases/latest">
    <img src="https://img.shields.io/github/v/release/linxingli/tts-client?color=165dff&label=%E4%B8%8B%E8%BD%BD%E6%9C%80%E6%96%B0%E7%89%88&style=flat-square" alt="Download">
  </a>
</p>

---

## 🌟 项目简介

**TTS Client (文字转语音)** 是一款面向内容创作者、学习者与视障辅助场景的桌面文字转语音工具。基于 **Electron + Vue 3 + TypeScript** 构建，调用微软 Edge 在线 TTS 服务进行语音合成，音色自然、无需申请 API Key，开箱即用。

除基础朗读外，它还内置了 **AI 润色与总结** 能力，可对接任意 OpenAI 兼容协议的大模型，在朗读前先精简长文，让"听内容"这件事更高效。

---

## ✨ 核心特性

### 🔊 高质量语音合成

- **免 Key 调用**：直接复用 Edge 浏览器"大声朗读"背后的 TTS 服务，音质接近真人，无需注册或配置密钥。
- **长文本流畅朗读**：自动按句分段连续播放，并在播放当前段时**预合成下一段**，最大程度减少段间停顿。
- **多音色选择**：内置全量音色列表，中文音色置顶，支持男声 / 女声与多语种。

### 🎛️ 实时参数调节

- **语速 / 音调**：作为合成参数自由调节，修改后重新合成以匹配偏好。
- **音量实时生效**：音量通过播放器直接控制，**无需重新合成**，拖动即变。

### 🧠 AI 润色与总结

- **OpenAI 兼容协议**：支持 DeepSeek / OpenAI / 智谱 / 通义 / Gemini 等任意兼容服务商，自带 API Key 即可。
- **一键精简长文**：朗读前先对文章进行语病修正、要点提炼与冗余删减，生成一段通顺的总结正文再行朗读，适合快速"听"完长内容。

### 💾 导出与历史记录

- **导出 MP3**：多段合成结果直接拼接导出为单个 MP3 文件，方便离线收听或分享。
- **历史持久化**：朗读记录本地保存，可一键回填文本与参数，继续之前的朗读。

---

## 🚀 安装与使用

### 📥 客户端下载

直接从 [GitHub Releases](https://github.com/linxingli/tts-client/releases/latest) 下载对应系统的安装包：

| 系统                  | 安装包                       |
| --------------------- | ---------------------------- |
| macOS (Apple Silicon) | `tts-client-x.y.z-arm64.dmg` |
| macOS (Intel)         | `tts-client-x.y.z-x64.dmg`   |
| Windows               | `tts-client-x.y.z-setup.exe` |

> 若 macOS 提示"已损坏"，请查看下方 [FAQ](#macos-打开应用提示已损坏无法打开)。

### 运行环境

- **Node.js** 18.17 及以上版本。
- **需联网**：TTS 合成与 AI 总结均依赖在线服务。

### 快速开始

```bash
# 1. 安装依赖（已内置 npmmirror 国内镜像源）
npm install

# 2. 启动开发模式
npm run dev
```

> 若启动后窗口未弹出（常见于宿主环境本身为 Electron 应用、设置了 `ELECTRON_RUN_AS_NODE` 时），改用项目根目录的启动脚本即可：
>
> ```bash
> ./dev.sh
> ```

### 使用说明

1.  在文本框中输入或粘贴待朗读内容。
2.  在音色设置中选择音色，按需调整语速 / 音调 / 音量。
3.  点击播放即可连续朗读；长文本会自动分段并预合成下一段。
4.  可点击「AI 总结」对长文先润色精简后再朗读（需在设置中配置 API Key）。
5.  支持将当前内容导出为 MP3，历史记录可随时回填。

---

## 🛠️ 开发者指南

如果你想自行编译或在此项目基础上进行二次开发，请参考以下指南。

### 前置要求

1.  安装 [Node.js](https://nodejs.org/) 18.17+（推荐 LTS 版本）。
2.  （可选）若在国内，项目已通过 `.npmrc` 配置 npmmirror 镜像源以加速依赖与 Electron 二进制下载。

### 开发与构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 启动开发模式（主进程改动自动重启，渲染进程支持热重载）
npm run dev

# 3. 打包 Windows 安装程序 (.exe / NSIS)
npm run build:win

# 4. 仅构建产物（不打包安装包）
npm run build
```

打包产物位于 `dist/` 目录。`electron-builder.yml` 中同时配置了 Windows (NSIS) 与 macOS (dmg) 目标，可按需扩展打包脚本。

### 验证 TTS 核心能力

项目根目录提供独立测试脚本，可在不启动 Electron 的情况下验证音色列表获取与语音合成是否正常：

```bash
node test-tts.mjs
```

---

## 📁 目录结构

```
src/
├── main/              # 主进程
│   ├── index.ts       #   窗口创建与生命周期
│   ├── ipc/           #   IPC 通道：tts / history / summarize / settings
│   └── lib/           #   核心库：tts-engine（合成）、store（持久化）
├── preload/           # 预加载：contextBridge 桥接
├── renderer/          # 渲染进程
│   └── src/
│       ├── App.vue
│       └── components/  # 文本输入 / 播放器 / 音色设置 / 历史列表 / AI 弹窗等
└── shared/            # 主进程与渲染进程共享的类型定义
```

---

## ⚙️ 技术说明

- **为何是桌面应用**：Edge TTS 通过 WebSocket 调用，需要携带自定义请求头，而浏览器环境无法设置 WebSocket 自定义头。因此合成在 **主进程** 完成，音频数据经 IPC 传给渲染进程播放。
- **音量与合成参数的差异**：音量通过 `audio.volume` 实时调节，无需重新合成；音色 / 语速 / 音调为合成参数，修改后需重新播放。
- **AI 总结**：通过 OpenAI 兼容的 `chat/completions` 接口实现，API Key 与服务地址保存在本地，仅在你主动触发总结时调用。

---

## ❓ 常见问题

### macOS 打开应用提示"已损坏，无法打开"

从 GitHub Releases 下载的 `.dmg` 安装包是**未签名应用**，macOS Gatekeeper 会拦截并显示"已损坏"。这是正常的安全提示，并非文件真的损坏。

**解决方法（任选其一）：**

1. **系统设置允许（推荐）**：安装后，打开 **系统设置 → 隐私与安全性 → 安全性**，找到"已阻止使用 tts-client"，点击 **仍要打开**。
2. **右键打开**：在"应用程序"文件夹中右键 `tts-client.app` → **打开**，然后在弹窗中点击 **仍要打开**。
3. **移除隔离属性**：打开终端执行：
   ```bash
   xattr -d com.apple.quarantine /Applications/tts-client.app
   ```

## 社区与支持

| 链接                                                            | 说明           |
| --------------------------------------------------------------- | -------------- |
| [GitHub 仓库](https://github.com/linxingli/tts-client)          | 源码与问题反馈 |
| [GitHub Issues](https://github.com/linxingli/tts-client/issues) | Bug 报告       |
| [LINUX DO 社区](https://linux.do)                               | 友链           |
