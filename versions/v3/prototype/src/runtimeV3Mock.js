export const V3_TEAM_IDS = ['buffett', 'dalio', 'livermore', 'simons', 'taleb']

export const AGENT_IDENTITY = {
  buffett: {
    color: '#A9CD63',
    colorOklch: 'oklch(80% .14 125)',
    label: 'MARGIN LIME',
    shortRole: '价值',
  },
  dalio: {
    color: '#55CEC0',
    colorOklch: 'oklch(78% .11 185)',
    label: 'REGIME CYAN',
    shortRole: '宏观',
  },
  livermore: {
    color: '#DBC054',
    colorOklch: 'oklch(81% .13 95)',
    label: 'TAPE GOLD',
    shortRole: '动量',
  },
  simons: {
    color: '#73B6FA',
    colorOklch: 'oklch(76% .12 250)',
    label: 'MODEL BLUE',
    shortRole: '量化',
  },
  taleb: {
    color: '#F98F87',
    colorOklch: 'oklch(76% .13 25)',
    label: 'TAIL CORAL',
    shortRole: '风险',
  },
}

export const RUNTIME_LANES = [
  { id: 'input', index: '01', label: '市场输入', meta: 'MARKET INPUT' },
  { id: 'analysis', index: '02', label: '研判中', meta: 'IN ANALYSIS' },
  { id: 'review', index: '03', label: '交叉复核', meta: 'CROSS REVIEW' },
  { id: 'execution', index: '04', label: '执行与监控', meta: 'EXECUTION' },
]

export const V3_RUNTIME_STAGE_TICKS = 6
export const V3_RUNTIME_CYCLE_TICKS = 36
const RUNTIME_START_SECONDS = (9 * 60 + 30) * 60

const twoDigits = (value) => String(value).padStart(2, '0')

export function formatV3Time(tick = 0) {
  const totalMinutes = Math.floor((RUNTIME_START_SECONDS + tick * 120) / 60) % (24 * 60)
  return `${twoDigits(Math.floor(totalMinutes / 60))}:${twoDigits(totalMinutes % 60)}`
}

export const V3_TASKS = [
  {
    id: 'liquidity-break',
    ownerId: 'dalio',
    title: '判断流动性断点',
    skill: 'Liquidity Regime',
    factor: '美元融资 / 信用利差',
    deliverable: '宏观环境简报',
    lanes: [1, 2, 3, 3, 3, 3],
  },
  {
    id: 'tail-budget',
    ownerId: 'taleb',
    title: '下调组合风险预算',
    skill: 'Convexity Guard',
    factor: '尾部凸性 / 波动率曲面',
    deliverable: '风险否决备忘',
    lanes: [0, 1, 2, 3, 3, 3],
  },
  {
    id: 'tape-confirmation',
    ownerId: 'livermore',
    title: '复核下跌动量',
    skill: 'Breakout Filter',
    factor: '成交量 / 价格结构',
    deliverable: '结构确认报告',
    lanes: [0, 0, 1, 2, 3, 3],
  },
  {
    id: 'regime-match',
    ownerId: 'simons',
    title: '回测相关性突变',
    skill: 'Regime Match',
    factor: '相关性 / 信号衰减',
    deliverable: '压力测试矩阵',
    lanes: [0, 1, 1, 2, 2, 3],
  },
  {
    id: 'quality-screen',
    ownerId: 'buffett',
    title: '筛选高质量资产',
    skill: 'Margin of Safety',
    factor: '现金流 / 安全边际',
    deliverable: '候选资产清单',
    lanes: [0, 0, 0, 1, 2, 3],
  },
  {
    id: 'reentry-plan',
    ownerId: 'buffett',
    title: '制定分批建仓计划',
    skill: 'Position Staging',
    factor: '成交深度 / 风险预算',
    deliverable: '执行指令',
    lanes: [0, 0, 0, 0, 1, 3],
  },
]

const phaseAgents = [
  {
    buffett: ['咖啡还热，价格先凉了', '复核核心资产现金流压力', 'Cashflow Stress'],
    dalio: ['世界机器正在掉齿轮', '扫描美元流动性断点', 'Liquidity Regime'],
    livermore: ['手离回车键还有三厘米', '观察卖盘加速结构', 'Tape Reader'],
    simons: ['模型说：样本还不够', '建立危机窗口样本集', 'Regime Match'],
    taleb: ['今天先别当英雄', '压缩尾部风险预算', 'Convexity Guard'],
  },
  {
    buffett: ['价格很热闹，我先算账', '等待宏观情景回传', 'Margin of Safety'],
    dalio: ['又画了一张世界运行图', '交付流动性情景', 'Macro Scanner'],
    livermore: ['不抢第一根反弹', '等待成交量确认', 'Breakout Filter'],
    simons: ['人类先别激动', '回测 17 个危机窗口', 'Regime Match'],
    taleb: ['保护费还算良心价', '建立两档尾部保护', 'Tail Hedge'],
  },
  {
    buffett: ['摸鱼等确认，合理等待', '更新安全边际分位', 'Quality Screener'],
    dalio: ['和政策路径开会中', '复核央行反应函数', 'Policy Map'],
    livermore: ['手已经放在回车键上', '运行突破确认过滤器', 'Breakout Filter'],
    simons: ['模型不同意，正在举证', '校验相关性突变', 'Correlation Test'],
    taleb: ['风险席今日照常扫兴', '审核结构确认条件', 'Risk Sentinel'],
  },
  {
    buffett: ['便宜开始有点像便宜了', '筛选现金流质量标的', 'Margin of Safety'],
    dalio: ['世界机器重新上油', '确认流动性边际改善', 'Liquidity Pulse'],
    livermore: ['这次可以认真看一眼', '复核主动买盘强度', 'Volume Confirmation'],
    simons: ['17 个窗口，11 个点头', '交付相似窗口报告', 'Regime Match'],
    taleb: ['可以进，但别冲', '设置再入场风险上限', 'Exposure Gate'],
  },
  {
    buffett: ['清单写完，咖啡也凉了', '交付 8 个候选资产', 'Quality Screener'],
    dalio: ['报告发了，假装下班', '更新政策情景权重', 'Policy Map'],
    livermore: ['确认来了，别追价', '规划两档入场价格', 'Tape Reader'],
    simons: ['模型允许小声乐观', '复核执行滑点范围', 'Slippage Model'],
    taleb: ['今天准许大家赚一点', '释放部分风险预算', 'Hedge Optimizer'],
  },
  {
    buffett: ['持有也是一种工作', '监控估值回归速度', 'Quality Drift'],
    dalio: ['摸鱼失败，市场又动了', '跟踪流动性修复', 'Liquidity Pulse'],
    livermore: ['已成交，拒绝复盘庆功', '监控价格结构', 'Position Keeper'],
    simons: ['模型表示：先看回撤', '更新信号衰减曲线', 'Signal Decay'],
    taleb: ['已下班，告警没关', '守护组合回撤阈值', 'Drawdown Monitor'],
  },
]

export const V3_RUNTIME_PHASES = [
  {
    id: 'shock',
    label: '流动性冲击',
    decision: '降低风险预算',
    note: '信用利差与融资压力同时恶化，团队进入防御模式。',
    alpha: -1.8,
    risk: 38,
    sync: 74,
    averageCycle: '04:18',
    position: 68,
    volatility: 48.6,
    liquidity: 'LOW',
    agents: phaseAgents[0],
    activity: [
      ['dalio', 'TEAM CORE', '调用 Macro Scanner', '美元融资压力升至 91 分位'],
      ['taleb', 'dalio', '请求风险降档', '建议净敞口降至 70% 以下'],
      ['simons', 'taleb', '建立压力样本', '载入 17 个危机窗口'],
      ['buffett', 'TEAM CORE', '复核现金流', '核心资产尚未失去安全边际'],
      ['TEAM CORE', 'ALL', '发布团队指令', '降低杠杆，保留观察仓'],
    ],
  },
  {
    id: 'hedge',
    label: '建立保护',
    decision: '建立尾部保护',
    note: '波动率曲面出现断层，保护成本仍低于预估尾部损失。',
    alpha: -0.9,
    risk: 31,
    sync: 82,
    averageCycle: '03:42',
    position: 42,
    volatility: 62.4,
    liquidity: 'THIN',
    agents: phaseAgents[1],
    activity: [
      ['taleb', 'TEAM CORE', '交付风险备忘', '检测到波动率曲面定价断层'],
      ['dalio', 'taleb', '共享政策情景', '紧急流动性支持概率升至 42%'],
      ['simons', 'dalio', '完成窗口匹配', '危机相似度升至 0.71'],
      ['buffett', 'taleb', '质询保护成本', '保护费率仍低于现金流折价'],
      ['TEAM CORE', 'taleb', '授权执行', '建立两档尾部保护'],
    ],
  },
  {
    id: 'observe',
    label: '等待确认',
    decision: '等待结构确认',
    note: '卖单开始衰减，主动买盘仍未形成可靠反转。',
    alpha: -1.6,
    risk: 29,
    sync: 78,
    averageCycle: '03:11',
    position: 24,
    volatility: 77.9,
    liquidity: 'LOW',
    agents: phaseAgents[2],
    activity: [
      ['livermore', 'dalio', '请求结构确认', '卖单衰减，主动买盘仍不足'],
      ['dalio', 'buffett', '扫描 32 条新闻', '政策信号可信度仅 0.58'],
      ['simons', 'livermore', '回传相似窗口', '结构确认平均滞后 18 分钟'],
      ['buffett', 'TEAM CORE', '维持观察仓', '折价出现，确认信号未到'],
      ['TEAM CORE', 'ALL', '继续等待', '禁止抢反弹，保留 24% 仓位'],
    ],
  },
  {
    id: 'review',
    label: '交叉复核',
    decision: '处理团队分歧',
    note: '估值、动量与风险信号发生冲突，进入二次验证。',
    alpha: 0.7,
    risk: 33,
    sync: 69,
    averageCycle: '05:06',
    position: 29,
    volatility: 68.2,
    liquidity: 'MIXED',
    agents: phaseAgents[3],
    activity: [
      ['buffett', 'livermore', '发起异议', '估值触底不代表价格触底'],
      ['livermore', 'simons', '请求量化复核', '主动买盘强度开始改善'],
      ['simons', 'TEAM CORE', '交付压力矩阵', '17 次危机中 11 次先见流动性回升'],
      ['taleb', 'TEAM CORE', '追加风险约束', '相关性仍处于异常高位'],
      ['TEAM CORE', 'dalio', '要求二次验证', '等待价差与深度同时修复'],
    ],
  },
  {
    id: 'reentry',
    label: '分批再入场',
    decision: '分批建立仓位',
    note: '成交深度回升，高质量资产进入历史低估区间。',
    alpha: 6.9,
    risk: 46,
    sync: 89,
    averageCycle: '02:46',
    position: 47,
    volatility: 54.7,
    liquidity: 'RISING',
    agents: phaseAgents[4],
    activity: [
      ['dalio', 'TEAM CORE', '确认流动性拐点', '价差与深度连续三窗改善'],
      ['buffett', 'taleb', '交付候选清单', '筛出 8 个现金流质量标的'],
      ['simons', 'livermore', '复核执行滑点', '预计冲击成本低于 23bp'],
      ['taleb', 'buffett', '释放风险预算', '尾部保护比例下调 18%'],
      ['TEAM CORE', 'ALL', '授权分批执行', '建立 47% 净多头仓位'],
    ],
  },
  {
    id: 'monitor',
    label: '持有与监控',
    decision: '持有并监控回撤',
    note: '反弹结构成立，团队保留风险缓冲并跟踪利润质量。',
    alpha: 12.8,
    risk: 52,
    sync: 93,
    averageCycle: '02:21',
    position: 58,
    volatility: 46.8,
    liquidity: 'NORMAL',
    agents: phaseAgents[5],
    activity: [
      ['buffett', 'TEAM CORE', '更新持仓报告', '现金流质量未出现恶化'],
      ['dalio', 'taleb', '同步流动性恢复', '市场深度恢复至事件前 74%'],
      ['livermore', 'simons', '确认结构保持', '回撤仍在正常波动区间'],
      ['taleb', 'TEAM CORE', '设置移动保护', '组合回撤阈值收紧至 6.5%'],
      ['TEAM CORE', 'ALL', '维持持有', '不追价，等待下一次再平衡'],
    ],
  },
]

function priceAt(tick) {
  const phase = ((tick % V3_RUNTIME_CYCLE_TICKS) + V3_RUNTIME_CYCLE_TICKS) % V3_RUNTIME_CYCLE_TICKS
  const angle = (phase / V3_RUNTIME_CYCLE_TICKS) * Math.PI * 2
  return 88 + Math.cos(angle) * 9.6 + Math.sin(angle * 2) * 1.8 + Math.sin(angle * 3) * 0.9
}

export function createV3Candles(tick, windowSize = 28) {
  const start = Math.max(0, tick - windowSize + 1)
  return Array.from({ length: tick - start + 1 }, (_, offset) => {
    const index = start + offset
    const open = priceAt(index - 1)
    const close = priceAt(index)
    const spread = 0.82 + ((index * 7) % 5) * 0.17
    const high = Math.max(open, close) + spread
    const low = Math.min(open, close) - spread * 0.82
    const cycleIndex = ((index % V3_RUNTIME_CYCLE_TICKS) + V3_RUNTIME_CYCLE_TICKS) % V3_RUNTIME_CYCLE_TICKS
    const marker = cycleIndex === 5 || cycleIndex === 11
      ? { label: 'S', tone: 'ember' }
      : cycleIndex === 24 || cycleIndex === 30
        ? { label: 'B', tone: 'cyan' }
        : null

    return {
      id: index,
      t: formatV3Time(index),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      marker,
    }
  })
}

export function getV3RuntimeSnapshot(tick) {
  const cycleTick = ((tick % V3_RUNTIME_CYCLE_TICKS) + V3_RUNTIME_CYCLE_TICKS) % V3_RUNTIME_CYCLE_TICKS
  const phaseIndex = Math.floor(cycleTick / V3_RUNTIME_STAGE_TICKS)
  const phaseTick = cycleTick % V3_RUNTIME_STAGE_TICKS
  const phase = V3_RUNTIME_PHASES[phaseIndex]
  const tasks = V3_TASKS.map((task, taskIndex) => {
    const lane = task.lanes[phaseIndex]
    const previousLane = phaseIndex > 0 ? task.lanes[phaseIndex - 1] : lane
    const progress = lane === 0
      ? 0
      : lane === 1
        ? Math.min(88, 22 + phaseTick * 11 + (taskIndex % 3) * 4)
        : lane === 2
          ? 92
          : 100
    const state = lane === 0
      ? '待处理'
      : lane === 1
        ? phaseTick > 3 ? '协作中' : '分析中'
        : lane === 2
          ? '待复核'
          : previousLane < 3 && phaseTick < 2
            ? '执行中'
            : task.id === 'reentry-plan' && phaseIndex === V3_RUNTIME_PHASES.length - 1
              ? '监控中'
              : '已交付'
    return { ...task, lane, progress, state }
  })

  return { cycleTick, phaseIndex, phaseTick, phase, tasks }
}

export function getV3Position(tick, phase) {
  const wave = Math.sin(tick * 1.5) * 2.1 + Math.cos(tick * 0.58) * 0.9
  return Math.max(0, Math.min(100, Math.round(phase.position + wave)))
}
