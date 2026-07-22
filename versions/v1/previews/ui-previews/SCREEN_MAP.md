# Qell 中文版 UI 重绘屏幕映射

## 内容与风格边界

- 内容与页面流程唯一来源：`中文版UI草稿/`。
- `qell-ai.vercel.app` 仅作为设计色系、组件、字体层级、留白和排版风格参考。
- 禁止引入参考网站的产品概念、角色体系或页面文案。
- 全套禁用 Purple、Violet、Magenta、Indigo、Lavender、Lilac、Mauve 及蓝紫渐变。
- 允许色：`#050706`、`#080909`、`#f2f5ec`、Acid `#b7ee5b`、Cyan `#6de3d3`、Ember `#eab56c`、Rose `#e6789e` 与中性灰。
- 所有容器为零圆角矩形；边框为清晰、连续、正交的 1px 实线；禁止潦草、断裂、手绘或无意义装饰细线。
- Agent 只使用抽象粒子化占位形象，不使用写实照片。

## 屏幕清单

### 首页（3 屏）

1. `01-home-screen-1.png`：品牌入口与三位 Agent
2. `02-home-screen-2.png`：六步流程与历史事件
3. `03-home-screen-3.png`：战队排行榜与奖励预览

### 选择角色页（2 屏）

1. `04-agent-market-screen-1.png`：智能体广场
2. `05-agent-market-screen-2.png`：选中智能体检查

### 组建战队页（3 屏）

1. `06-team-builder-screen-1.png`：战队编组
2. `07-team-builder-screen-2.png`：战队策略画像
3. `08-team-builder-screen-3.png`：模拟前校验

### 智能体详情页（2 屏）

1. `09-agent-detail-screen-1.png`：身份与表现
2. `10-agent-detail-screen-2.png`：策略 DNA 与市场适配

### 历史事件副本页（2 屏）

1. `11-events-library-screen-1.png`：历史事件库
2. `12-events-library-screen-2.png`：1987 黑色星期一详情

### 模拟盘直播页（2 屏）

1. `13-runtime-screen-1.png`：市场窗口、战队核心与 Agent 操作摘要
2. `14-runtime-screen-2.png`：仓位、因子 Skills、Subagent 与事件动态

### 排行榜页面（2 屏）

1. `15-leaderboard-screen-1.png`：全球排行榜与当前排名
2. `16-leaderboard-screen-2.png`：奖励阶梯、资料与近期模拟

### 副本结算页（2 屏）

1. `17-settlement-screen-1.png`：结算总览
2. `18-settlement-screen-2.png`：战队归因与战局复盘

## 统一生成提示词摘要

Use case: `ui-mockup`。生成 16:9 中文桌面网页 UI，旧版中文版图片是内容与流程唯一依据，已通过稿是视觉连续性依据。使用深黑背景、亮绿主状态色、青色数据色、琥珀执行色、玫红风险色；大留白、低信息密度、无圆角硬边矩形、精确网格、清晰正交实线。严禁任何紫色家族、蓝紫渐变、潦草细线、断线、装饰线路、玻璃拟态、圆角卡片、真实照片以及参考网站的产品内容。

