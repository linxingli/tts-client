import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerTTSIpc } from './ipc/tts'
import { registerHistoryIpc } from './ipc/history'
import { registerSummarizeIpc } from './ipc/summarize'
import { registerSettingsIpc } from './ipc/settings'

/**
 * 创建主窗口
 */
function createWindow(): void {
  const win = new BrowserWindow({
    title: '文字转语音',
    width: 1000,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // 外链用系统浏览器打开
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发环境加载 dev server，生产环境加载打包文件
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerTTSIpc()
  registerHistoryIpc()
  registerSummarizeIpc()
  registerSettingsIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
