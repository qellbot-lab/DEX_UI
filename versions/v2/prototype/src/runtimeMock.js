export const RUNTIME_CYCLE_TICKS = 48
export const RUNTIME_STAGE_TICKS = 8
export const RUNTIME_START_SECONDS = (9 * 60 + 30) * 60

const twoDigits = (value) => String(value).padStart(2, '0')

export function formatSimulationTime(tick = 0) {
  const totalMinutes = Math.floor((RUNTIME_START_SECONDS + tick * 90) / 60) % (24 * 60)
  return `${twoDigits(Math.floor(totalMinutes / 60))}:${twoDigits(totalMinutes % 60)}`
}

export const runtimeStages = [
  {
    id: 'risk-off',
    action: '降低风险预算',
    note: '美元流动性与信用利差同步恶化，团队先压低组合杠杆。',
    skill: 'Liquidity Regime',
    subagent: 'Macro Scanner',
    confidence: 82,
    position: 68,
    positionLabel: '净多头 · 收缩中',
    sync: 78,
    pnl: 4.2,
    volatility: 43.6,
    liquidity: 'LOW',
    lifecycle: 0,
    factorScores: [92, 72, 48, 66, 81, 58],
    agents: [
      { mood: '专注交易中', task: '核对现金流下修情景', skill: 'Margin of Safety', tone: 'acid' },
      { mood: '老板路过，立刻打开宏观表', task: '扫描美元流动性断点', skill: 'Liquidity Regime', tone: 'cyan' },
      { mood: '今天先别当英雄', task: '压缩尾部风险预算', skill: 'Convexity Guard', tone: 'rose' },
    ],
    stream: [
      { from: 1, to: 2, label: '调用 Macro Scanner', detail: '美元融资压力升至 91 分位', tone: 'cyan' },
      { from: 2, to: 0, label: '交付 Risk Memo', detail: '建议先把净敞口降到 70% 以下', tone: 'rose' },
      { from: 0, to: 1, label: '复核现金流', detail: '核心资产安全边际仍未失效', tone: 'acid' },
      { from: 1, to: 'CORE', label: '提交团队决议', detail: '降低风险预算，保留观察仓', tone: 'ember' },
    ],
    events: ['融资压力升至 91 分位', '信用利差快速走阔', '卖盘深度下降 34%'],
  },
  {
    id: 'tail-hedge',
    action: '建立尾部保护',
    note: '波动率曲面出现断层，保护成本仍低于团队估算的尾部损失。',
    skill: 'Convexity Guard',
    subagent: 'Risk Sentinel',
    confidence: 91,
    position: 41,
    positionLabel: '净多头 · 对冲中',
    sync: 86,
    pnl: 1.8,
    volatility: 61.4,
    liquidity: 'THIN',
    lifecycle: 1,
    factorScores: [84, 96, 44, 58, 88, 71],
    agents: [
      { mood: '咖啡续命中', task: '等待风险代理回传', skill: 'Cashflow Stress', tone: 'ember' },
      { mood: '与风险席争论第 3 轮', task: '复核政策反应函数', skill: 'Policy Reaction', tone: 'cyan' },
      { mood: '专注交易中', task: '为组合购买凸性保护', skill: 'Convexity Guard', tone: 'rose' },
    ],
    stream: [
      { from: 2, to: 'CORE', label: '调用 Risk Sentinel', detail: '检测到波动率曲面定价断层', tone: 'rose' },
      { from: 1, to: 2, label: '共享政策情景', detail: '紧急流动性支持概率上调至 42%', tone: 'cyan' },
      { from: 0, to: 2, label: '质询保护成本', detail: '保护费率未超过现金流折价', tone: 'ember' },
      { from: 'CORE', to: 2, label: '授权执行', detail: '建立两档尾部保护', tone: 'acid' },
    ],
    events: ['隐含波动率跳升', '保护成本仍可接受', '尾部仓位开始成交'],
  },
  {
    id: 'wait-structure',
    action: '等待结构确认',
    note: '价格继续下探，但成交结构尚未提供足够可靠的反转证据。',
    skill: 'Breakout Filter',
    subagent: 'Tape Reader',
    confidence: 64,
    position: 24,
    positionLabel: '净多头 · 等待中',
    sync: 72,
    pnl: -1.6,
    volatility: 76.8,
    liquidity: 'LOW',
    lifecycle: 2,
    factorScores: [61, 88, 36, 42, 91, 69],
    agents: [
      { mood: '等结构，顺便摸鱼 12 秒', task: '等待成交量确认', skill: 'Volume Confirmation', tone: 'steel' },
      { mood: '点咖啡，保持在线', task: '监听央行与信用新闻', skill: 'News Pulse', tone: 'cyan' },
      { mood: '盯盘中，拒绝加入群聊', task: '运行 Breakout Filter', skill: 'Tape Reader', tone: 'ember' },
    ],
    stream: [
      { from: 2, to: 1, label: '请求结构确认', detail: '卖单衰减，但主动买盘仍不足', tone: 'ember' },
      { from: 1, to: 0, label: '扫描 32 条新闻', detail: '政策信号混杂，可信度仅 0.58', tone: 'cyan' },
      { from: 0, to: 'CORE', label: '维持观察仓', detail: '现金流折价已出现，确认信号未到', tone: 'steel' },
      { from: 'CORE', to: 2, label: '继续等待', detail: '禁止抢反弹，保留 24% 仓位', tone: 'rose' },
    ],
    events: ['卖单开始衰减', '政策新闻可信度 0.58', '反转结构尚未确认'],
  },
  {
    id: 'team-debate',
    action: '团队分歧处理中',
    note: '估值、动量与风险信号发生冲突，团队进入二次验证。',
    skill: 'Signal Arbitration',
    subagent: 'Consensus Router',
    confidence: 69,
    position: 29,
    positionLabel: '净多头 · 校验中',
    sync: 67,
    pnl: 0.6,
    volatility: 68.2,
    liquidity: 'MIXED',
    lifecycle: 2,
    factorScores: [78, 81, 57, 74, 86, 63],
    agents: [
      { mood: '和同事吵架中（有数据版）', task: '质询估值锚是否过早', skill: 'Valuation Anchor', tone: 'ember' },
      { mood: '我是天才交易员（模型自评）', task: '回测 17 个相似窗口', skill: 'Regime Match', tone: 'cyan' },
      { mood: '老板说先别天才', task: '检查相关性突变', skill: 'Correlation Break', tone: 'rose' },
    ],
    stream: [
      { from: 0, to: 1, label: '发起异议', detail: '估值触底不等于价格触底', tone: 'ember' },
      { from: 1, to: 0, label: '交付相似窗口', detail: '17 次危机中 11 次先见流动性回升', tone: 'cyan' },
      { from: 2, to: 'CORE', label: '追加风险约束', detail: '相关性仍处于异常高位', tone: 'rose' },
      { from: 'CORE', to: 1, label: '要求二次验证', detail: '等待成交深度与价差同时修复', tone: 'steel' },
    ],
    events: ['团队信号发生冲突', '相似窗口回测完成', '等待二次验证'],
  },
  {
    id: 'reentry',
    action: '分批建立仓位',
    note: '成交深度回升，高质量资产相对现金流进入历史低分位。',
    skill: 'Margin of Safety',
    subagent: 'Quality Screener',
    confidence: 78,
    position: 47,
    positionLabel: '净多头 · 建仓中',
    sync: 89,
    pnl: 6.9,
    volatility: 54.7,
    liquidity: 'RISING',
    lifecycle: 3,
    factorScores: [88, 69, 74, 92, 62, 76],
    agents: [
      { mood: '专注交易中', task: '筛选高质量资产', skill: 'Margin of Safety', tone: 'acid' },
      { mood: '已交报告，假装下班', task: '更新政策情景权重', skill: 'Policy Map', tone: 'cyan' },
      { mood: '咖啡冷了，保护还在', task: '下调保护比例', skill: 'Hedge Optimizer', tone: 'ember' },
    ],
    stream: [
      { from: 1, to: 'CORE', label: '确认流动性拐点', detail: '价差与市场深度连续三窗改善', tone: 'cyan' },
      { from: 0, to: 2, label: '交付候选清单', detail: '筛出 8 个现金流质量标的', tone: 'acid' },
      { from: 2, to: 0, label: '释放风险预算', detail: '尾部保护比例下调 18%', tone: 'ember' },
      { from: 'CORE', to: 0, label: '授权分批执行', detail: '先建立 47% 净多头仓位', tone: 'acid' },
    ],
    events: ['成交深度连续改善', '高质量资产触发阈值', '第一批买单完成'],
  },
  {
    id: 'hold',
    action: '持有并监控回撤',
    note: '反弹结构已经成立，团队保留风险缓冲并跟踪利润质量。',
    skill: 'Drawdown Monitor',
    subagent: 'Position Keeper',
    confidence: 87,
    position: 58,
    positionLabel: '净多头 · 持有中',
    sync: 92,
    pnl: 12.8,
    volatility: 46.8,
    liquidity: 'NORMAL',
    lifecycle: 4,
    factorScores: [81, 58, 89, 86, 44, 84],
    agents: [
      { mood: '盯住利润，表情平静', task: '监控估值回归速度', skill: 'Quality Drift', tone: 'acid' },
      { mood: '摸鱼失败，市场又动了', task: '跟踪流动性修复', skill: 'Liquidity Pulse', tone: 'cyan' },
      { mood: '已下班（但告警没关）', task: '守护回撤阈值', skill: 'Drawdown Monitor', tone: 'rose' },
    ],
    stream: [
      { from: 0, to: 'CORE', label: '更新持仓报告', detail: '现金流质量未出现恶化', tone: 'acid' },
      { from: 1, to: 2, label: '同步流动性恢复', detail: '市场深度恢复至事件前 74%', tone: 'cyan' },
      { from: 2, to: 0, label: '设置移动保护', detail: '组合回撤阈值收紧至 6.5%', tone: 'rose' },
      { from: 'CORE', to: 'ALL', label: '维持持有', detail: '不追价，等待下一次再平衡', tone: 'steel' },
    ],
    events: ['反弹结构确认', '市场深度恢复 74%', '移动回撤保护生效'],
  },
]

function priceAt(tick) {
  const phase = ((tick % RUNTIME_CYCLE_TICKS) + RUNTIME_CYCLE_TICKS) % RUNTIME_CYCLE_TICKS
  const angle = (phase / RUNTIME_CYCLE_TICKS) * Math.PI * 2
  return 88 + Math.cos(angle) * 9.4 + Math.sin(angle * 2) * 1.9 + Math.sin(angle * 3) * 0.8
}

export function createRuntimeCandles(tick, windowSize = 18) {
  const start = Math.max(0, tick - windowSize + 1)
  return Array.from({ length: tick - start + 1 }, (_, offset) => {
    const index = start + offset
    const open = priceAt(index - 1)
    const close = priceAt(index)
    const spread = 0.85 + ((index * 7) % 5) * 0.18
    const high = Math.max(open, close) + spread
    const low = Math.min(open, close) - spread * 0.82
    const cycleIndex = ((index % RUNTIME_CYCLE_TICKS) + RUNTIME_CYCLE_TICKS) % RUNTIME_CYCLE_TICKS
    const marker = cycleIndex === 5 || cycleIndex === 13
      ? { label: 'S', tone: 'ember' }
      : cycleIndex === 31 || cycleIndex === 39
        ? { label: 'B', tone: 'cyan' }
        : null
    return {
      id: index,
      t: formatSimulationTime(index),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      marker,
    }
  })
}

export function getRuntimeStage(tick) {
  const cycleTick = ((tick % RUNTIME_CYCLE_TICKS) + RUNTIME_CYCLE_TICKS) % RUNTIME_CYCLE_TICKS
  const index = Math.floor(cycleTick / RUNTIME_STAGE_TICKS)
  return { stage: runtimeStages[index], index, cycleTick }
}

export function getRuntimePosition(tick, stage) {
  const wave = Math.sin(tick * 1.7) * 2.4 + Math.cos(tick * 0.63) * 1.1
  return Math.max(0, Math.min(100, Math.round(stage.position + wave)))
}
