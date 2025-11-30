# 🎸 节拍器 Metronome

一个现代化的在线节拍器应用，使用 React 19 + Vite 7 构建，基于 Web Audio API 实现精准的节拍播放。

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 功能特性

### 🎵 节拍控制
- **BPM 范围**：20 - 300 BPM
- **多种调节方式**：
  - 滑块拖动
  - 点击 +/- 按钮微调
  - 直接输入数值
  - 键盘方向键 ↑↓ 微调

### 🎼 拍号设置
支持常用拍号：
- 2/4 拍
- 3/4 拍
- 4/4 拍
- 6/4 拍
- 8/4 拍

### 🔊 音色选择
提供 5 种不同风格的音色：
| 音色 | 描述 |
|------|------|
| 经典 | 标准方波节拍声 |
| 电子 | 柔和的正弦波电子音 |
| 底鼓 | 低沉有力的鼓点 |
| 气泡 | 轻柔的泡泡音效 |
| 玻璃 | 清脆的玻璃敲击声 |

### 🎯 常用速度预设
快速切换到标准音乐速度：
- **Largo** (60 BPM) - 广板
- **Andante** (80 BPM) - 行板
- **Moderato** (100 BPM) - 中板
- **Allegro** (120 BPM) - 快板
- **Vivace** (140 BPM) - 活泼的快板
- **Presto** (180 BPM) - 急板

### 🎨 视觉效果
- **节奏闪烁**：屏幕边缘灯带随节拍闪烁
- **节奏晃动**：界面元素随节拍轻微晃动
- **重拍强调**：第一拍视觉高亮显示
- **节拍指示器**：实时显示当前拍位

### 🌙 主题切换
- 支持亮色/暗色主题
- 自动记住用户偏好

### 💾 设置持久化
以下设置会自动保存到本地存储：
- 音量设置
- 重拍开关状态
- 节奏闪烁开关状态
- 节奏晃动开关状态

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/my_metronome.git

# 进入项目目录
cd my_metronome

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 🛠️ 技术栈

- **框架**: React 19
- **构建工具**: Vite 7
- **音频**: Web Audio API
- **样式**: CSS3 (CSS Variables)
- **代码规范**: ESLint

## 📁 项目结构

```
my_metronome/
├── public/
│   └── metronome.svg          # 应用图标
├── src/
│   ├── components/
│   │   ├── Metronome.jsx      # 节拍器主组件
│   │   ├── Metronome.css      # 节拍器样式
│   │   ├── ThemeToggle.jsx    # 主题切换组件
│   │   └── ThemeToggle.css    # 主题切换样式
│   ├── hooks/
│   │   ├── useMetronome.js    # 节拍器核心逻辑 Hook
│   │   └── useTheme.js        # 主题管理 Hook
│   ├── App.jsx                # 应用入口组件
│   ├── App.css                # 应用全局样式
│   ├── index.css              # 基础样式
│   └── main.jsx               # 应用挂载入口
├── index.html                 # HTML 模板
├── package.json               # 项目配置
├── vite.config.js             # Vite 配置
└── eslint.config.js           # ESLint 配置
```

## 🎹 使用说明

1. **开始/停止**：点击中央的播放按钮开始或停止节拍
2. **调整速度**：
   - 拖动滑块快速调整
   - 点击 +/- 按钮精确微调
   - 点击 BPM 数字直接输入
3. **选择拍号**：点击对应的拍号按钮（如 4/4）
4. **切换音色**：在音色区域选择喜欢的声音
5. **功能开关**：
   - 重拍：强调每小节第一拍
   - 节奏闪烁：开启屏幕边缘灯光效果
   - 节奏晃动：开启界面元素晃动效果
6. **调整音量**：使用底部音量滑块调节
7. **切换主题**：点击右上角的主题图标

## 🔧 技术实现

### 音频调度
使用 Web Audio API 的精确时间调度，采用「预调度」策略确保节拍精准：
- 提前 100ms 调度音频事件
- 25ms 间隔检查并调度新节拍
- 独立的 UI 同步循环（4ms 间隔）

### 状态管理
使用 React Hooks 进行状态管理：
- `useMetronome`: 核心节拍器逻辑，包含音频播放、节拍调度
- `useTheme`: 主题状态管理，支持系统主题检测

## 📄 License

MIT License © 2025

---

<p align="center">点击开始，跟随节拍练习 ♪</p>
