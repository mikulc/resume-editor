# 📝 在线简历编辑器

一个纯前端、零依赖后端的在线简历编辑工具，提供实时编辑预览、Markdown 富文本排版、多主题切换和高保真 PDF 导出。
<img width="2880" height="1505" alt="Snipaste_2026-05-28_09-25-21" src="https://github.com/user-attachments/assets/b625169c-fb7e-4eb0-86cc-d0d3d8cc5ae6" />

> 💡 **提示**：纯浏览器端应用，所有数据存储在浏览器 localStorage 中，无后端服务。

---

## ✨ 功能特性

### 📝 核心编辑
- 🧩 **五大简历模块** — 个人信息、教育经历、专业技能、工作/实习经历、项目经历，支持按需增删条目
- 📝 **Markdown 富文本** — 在预览和编辑中统一使用 `**加粗**`、`*斜体*`、`***加粗+斜体***` 三种标记语法
- 🎨 **预览区文本格式化** — 在预览区选中文本弹出悬浮工具栏，一键切换加粗/斜体/清除格式
- 📐 **要点抽屉编辑器** — 侧滑抽屉式大文本框编辑工作/项目要点，内建独立撤销/重做栈（50 条）
- ↩️ **全局撤销/重做** — 支持 Ctrl+Z / Ctrl+Y，最多 50 条操作历史
- 🖼️ **头像上传** — 支持本地图片上传并转换为 base64 图片

### 👁️ 预览与导出
- 📄 **实时预览** — A4 纸张规格渲染，所见即所得
- 🔍 **响应式缩放** — 预览区支持 30%-150% 缩放，Ctrl+滚轮快速缩放、一键适应宽度
- 📑 **自动分页** — 测量各 section 高度自动计算分页位置
- 🎨 **多主题色彩** — 蓝/灰/黑三种主题色，section 标题色彩联动
- 💧 **水印支持** — 可自定义水印内容、透明度、字体大小、密度、旋转角度和颜色
- 📥 **一键导出 PDF** — DOM 截图 + jsPDF 合成，支持多页、可调节清晰度 (1x-5x)

### ⚙️ 样式自定义
- 📏 **页边距** — 10-30mm 可调
- 📐 **行间距** — 1.2-2.4 倍可调
- 🎯 **PDF 清晰度** — 1x 到 5x 倍率，平衡文件大小与画质

### 🖱️ 交互体验
- 🔗 **编辑/预览双向联动** — 点击编辑区自动定位预览位置，反之亦然
- 📐 **三栏弹性布局** — 左侧编辑、中间预览、右侧设置，右侧面板可折叠
- 📂 **手风琴编辑器** — 同时间只展开一个编辑模块，减少滚动负担
- ⋯ **三点菜单** — 悬停显示下拉菜单，替代原始删除按钮，支持"编辑"与"删除"操作
- 💡 **保存状态动画** — 呼吸灯指示器实时反馈保存状态（已保存/未保存/保存中/失败）
- 💾 **自动保存** — 编辑内容 300ms 防抖自动写入 localStorage，Ctrl+S 手动立即保存
- 🔔 **Toast 通知** — 全局通知系统，支持成功/错误/信息三种类型
- ⚠️ **确认弹窗** — 全局对话框系统，用于危险操作（重置数据等）

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| [React](https://react.dev/) | ^18.3 | 前端 UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | ~5.6 | 类型安全 |
| [Vite](https://vitejs.dev/) | ^5.4 | 构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4 | 原子化 CSS 框架 |
| [jsPDF](https://github.com/parallax/jsPDF) | ^2.5 | PDF 生成 |
| [@zumer/snapdom](https://github.com/zumerlab/snapdom) | ^2.12 | DOM 截图 |
| [Lucide React](https://lucide.dev/) | ^0.468 | 图标库 |
| [uuid](https://github.com/uuidjs/uuid) | ^10.0 | 唯一 ID 生成 |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^2.5 | Tailwind 类名合并 |
| [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) | ^1.0 | Tailwind 动画插件 |

**状态管理**：React Context + useReducer，无第三方状态管理库。

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8（推荐）或 npm / yarn

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

启动后访问 [http://localhost:5173](http://localhost:5173)。

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/` 目录。

### 预览生产构建

```bash
pnpm preview
```

---

## 使用说明

1. 在**左侧编辑面板**点击模块标题展开编辑区域，填写个人信息及各模块内容
2. 在**中间预览区**实时查看 A4 纸张渲染效果
3. 预览区选中文本可弹出悬浮工具栏，一键加粗/斜体/清除格式
4. 点击要点旁边的「三点菜单」→「编辑」，打开抽屉编辑器进行详细编辑（支持局部撤销）
5. 在**右侧设置面板**切换主题颜色、调整页边距、行间距、水印等样式
6. 点击预览区顶部的「导出 PDF」按钮保存为 PDF 文件
7. 使用 **Ctrl+Z / Ctrl+Y** 全局撤销/重做操作
8. 使用 **Ctrl+S** 手动保存数据到浏览器

---

## 项目结构

```
resume-editor/
├── index.html                       # 入口 HTML
├── package.json                     # 项目依赖与脚本
├── vite.config.ts                   # Vite 配置
├── tailwind.config.js               # Tailwind 配置（主题色、动画关键帧）
├── postcss.config.js                # PostCSS 配置
├── tsconfig.json                    # TypeScript 根配置
├── tsconfig.app.json                # 应用源码 TS 配置
├── tsconfig.node.json               # Vite 构建链 TS 配置
├── public/                          # 静态资源
│   ├── resume-icon.svg              # 网站图标
│   └── default_avatar.jpg           # 默认头像
└── src/
    ├── main.tsx                     # 应用入口
    ├── App.tsx                      # 根组件 - Provider 组合 + PDF 导出集成
    ├── index.css                    # 全局样式 + 关键帧动画 + 打印样式
    ├── types/
    │   └── resume.ts                # 全部类型定义（数据模型、Action、UI 状态）
    ├── context/
    │   └── ResumeContext.tsx        # 全局状态管理
    │                                #   - ResumeProvider: 数据 CRUD + 历史栈(撤销/重做) + localStorage 持久化
    │                                #   - AppProvider: UI 状态(缩放、主题、保存状态等)
    ├── hooks/
    │   ├── useExportPDF.ts          # PDF 导出：snapdom 逐页截图 → Canvas → jsPDF 合成
    │   └── useTextSelection.ts      # 预览区文本选中、偏移映射、格式切换
    ├── utils/
    │   └── markdown.ts              # Markdown 解析引擎：片段解析、偏移映射、加粗/斜体/清除格式
    └── components/
        ├── layout/
        │   ├── SplitLayout.tsx      # 三栏布局容器（编辑 | 预览 | 设置）
        │   ├── EditorPanel.tsx      # 左侧手风琴编辑面板
        │   ├── PreviewPanel.tsx     # 中间预览面板（缩放/撤销/导出/快捷键）
        │   └── SettingsPanel.tsx    # 右侧设置面板（主题/边距/水印/导出清晰度）
        ├── editor/
        │   ├── EditorComponents.tsx # 五大模块的子编辑器组件集合
        │   ├── HighlightDrawer.tsx  # 要点抽屉编辑器（Portal + 局部撤销/重做）
        │   └── ThreeDotMenu.tsx     # 三点下拉菜单（编辑/删除）
        ├── preview/
        │   ├── PreviewComponents.tsx# 预览渲染组件（Markdown 解析、分页、水印叠加）
        │   └── FloatingToolbar.tsx  # 选中文本悬浮格式工具栏
        └── common/
            ├── Toast.tsx            # 全局 Toast 通知（Portal + 自动消失）
            ├── ConfirmModal.tsx     # 全局确认弹窗（Promise 式调用）
            ├── SaveSync.tsx         # 自动保存同步（变更检测 + Ctrl+S 拦截）
            └── SaveStatusIndicator.tsx # 保存状态呼吸灯指示器
```

---

## 架构设计

### 数据流

```
用户操作 → dispatch(Action) → resumeReducer → 新 ResumeData
                                          ↓
                          自动推入历史栈（最多 50 条）
                                          ↓
                          300ms 防抖 → localStorage 持久化
                                          ↓
                          预览组件重新渲染 → 实时反馈
```

### 状态管理

- **ResumeContext** — 简历数据状态 (`ResumeData`)，通过 `useReducer` 管理，共 18 种 Action（增删改查各模块）
- **HistoryContext** — 撤销/重做，内置于 `ResumeProvider`，`useEffect` 自动监听数据变更并推入历史栈
- **AppUIContext** — UI 状态 (`AppUIState`)，管理当前展开模块、缩放比例、主题设置、保存状态等

### Markdown 渲染

- **解析**：`parseBoldFragments()` 按优先级 `***` → `**` → `*` 解析文本为带样式的片段数组
- **偏移映射**：`buildOffsetMap()` 遍历 DOM 构建"渲染偏移 → 源文本偏移"映射，确保在含标记的源文本中精确定位
- **格式操作**：基于偏移量的精准插入/删除标记，避免重复文字导致的错位问题

### PDF 导出流程

```
预览区 A4 DOM → @zumer/snapdom 逐页截图（JPEG）→ Canvas 转 DataURL → jsPDF 添加页面 → 下载 PDF
```

### 动画系统

在 `tailwind.config.js` 中注册 4 套关键帧动画，配合 `tailwindcss-animate` 插件使用：
- `animate-breathe-saved` — 保存成功，绿色 4s 呼吸灯
- `animate-breathe-saving` — 保存中，蓝色 1.2s 呼吸灯
- `animate-breathe-error` — 保存失败，红色 1s 呼吸灯
- `animate-pulse-confirm` — 确认脉冲，0.6s 缩放+阴影扩散

---

## 快捷键

| 快捷键 | 作用 |
|--------|------|
| Ctrl+Z | 全局撤销 |
| Ctrl+Y | 全局重做 |
| Ctrl+S | 手动保存 |
| Ctrl+滚轮 | 预览区缩放 |
| ESC | 关闭三点菜单 / 关闭抽屉编辑器 |

> 注意：当要点抽屉编辑器打开时，Ctrl+Z/Y 作用于抽屉内部的局部历史栈，而非全局。

---

## 开发说明

- 数据流基于 **React Context + useReducer**，无外部状态管理依赖
- 全局状态定义在 `src/context/ResumeContext.tsx`
- 历史栈通过 `useRef` 维护，`useEffect` 自动监听数据变更并推入
- localStorage 使用 300ms 防抖写入，减少频繁 I/O
- Markdown 解析通过 `src/utils/markdown.ts` 实现，支持嵌套格式标记
- PDF 导出流程：预览 DOM → `@zumer/snapdom` 逐页截图 → Canvas → `jsPDF` 合成 → 自动下载
- 所有弹窗组件（Toast、ConfirmModal、HighlightDrawer、FloatingToolbar）均通过 `createPortal` 渲染到 `document.body`
- 字体栈：`PingFang SC` → `Microsoft YaHei` → `Helvetica Neue` → 系统回退

---

## License

MIT
