import {
  AGENT_IDENTITY,
  RUNTIME_LANES,
  V3_TASKS,
  V3_TEAM_IDS,
} from './runtimeV3Mock.js'

export { AGENT_IDENTITY, RUNTIME_LANES, V3_TEAM_IDS }

export const V4_RUNTIME_CYCLE_MS = 60_000
export const V4_CANDLE_MS = 2_400
export const V4_MARKET_SAMPLE_MS = 480

const RUNTIME_START_SECONDS = (9 * 60 + 30) * 60
const INITIAL_ASSETS = 3_200_000
const twoDigits = (value) => String(value).padStart(2, '0')

const INITIAL_LANES = [
  1, 0, 1, 2,
  0, 0, 1, 0,
  2, 1, 2, 0,
  1, 3, 2, 3,
]

const INITIAL_AGENT_STATE = {
  buffett: {
    taskId: 'quality-screen',
    mode: 'working',
    humor: '价格很热闹，我先算账',
    detail: '复核核心资产现金流压力',
    skill: 'Margin of Safety',
    stateLabel: '核价中',
    stateTone: 'acid',
  },
  dalio: {
    taskId: 'liquidity-break',
    mode: 'working',
    humor: '世界机器正在掉齿轮',
    detail: '扫描美元流动性断点',
    skill: 'Liquidity Regime',
    stateLabel: '推演中',
    stateTone: 'cyan',
  },
  livermore: {
    taskId: 'tape-confirmation',
    mode: 'working',
    humor: '手离回车键还有三厘米',
    detail: '观察卖盘加速结构',
    skill: 'Tape Reader',
    stateLabel: '盯盘中',
    stateTone: 'ember',
  },
  simons: {
    taskId: 'liquidity-break',
    mode: 'reviewing',
    humor: '模型说：样本还不够',
    detail: '交叉验证流动性信号',
    skill: 'Regime Match',
    stateLabel: '协作中',
    stateTone: 'cyan',
  },
  taleb: {
    taskId: 'tail-budget',
    mode: 'reviewing',
    humor: '今天先别当英雄',
    detail: '压缩尾部风险预算',
    skill: 'Convexity Guard',
    stateLabel: '复核中',
    stateTone: 'ember',
  },
}

const INITIAL_ACTIVITY = [
  {
    id: 'initial-4',
    at: -400,
    from: 'TEAM CORE',
    to: 'ALL',
    action: '进入流动性冲击窗口',
    detail: '任务队列与市场数据流已接通',
    tone: 'acid',
  },
  {
    id: 'initial-3',
    at: -800,
    from: 'simons',
    to: 'dalio',
    action: '加入流动性复核',
    detail: '载入 17 个历史危机窗口',
    tone: 'cyan',
  },
  {
    id: 'initial-2',
    at: -1_200,
    from: 'taleb',
    to: 'TEAM CORE',
    action: '提交尾部风险预警',
    detail: '建议降低组合风险预算',
    tone: 'ember',
  },
  {
    id: 'initial-1',
    at: -1_600,
    from: 'livermore',
    to: 'dalio',
    action: '请求成交结构确认',
    detail: '主动卖盘仍占主导',
    tone: 'steel',
  },
  {
    id: 'initial-0',
    at: -2_000,
    from: 'buffett',
    to: 'TEAM CORE',
    action: '复核安全边际',
    detail: '高质量资产开始进入折价区间',
    tone: 'steel',
  },
]

const activity = (id, at, from, to, action, detail, tone = 'steel') => ({
  id,
  at,
  type: 'activity',
  from,
  to,
  action,
  detail,
  tone,
})

const SCENARIO_EVENTS = [
  activity('market-shock', 600, 'TEAM CORE', 'ALL', '市场波动升级', '融资压力与信用利差同步恶化', 'rose'),
  { id: 'recycle-quality', at: 1_000, type: 'task.recycle', taskId: 'quality-screen' },
  {
    id: 'assign-buffett-quality',
    at: 1_400,
    type: 'agent.assign',
    agentId: 'buffett',
    taskId: 'quality-screen',
    mode: 'working',
    humor: '价格在跳，我先看账',
    detail: '筛选现金流质量标的',
    skill: 'Margin of Safety',
    stateLabel: '核价中',
    stateTone: 'acid',
  },
  { id: 'progress-quality-1', at: 2_000, type: 'task.progress', taskId: 'quality-screen', progress: 22, state: '分析中' },
  {
    id: 'assign-dalio-liquidity',
    at: 2_450,
    type: 'agent.assign',
    agentId: 'dalio',
    taskId: 'liquidity-break',
    mode: 'working',
    humor: '世界机器正在掉齿轮',
    detail: '扫描美元流动性断点',
    skill: 'Liquidity Regime',
    stateLabel: '推演中',
    stateTone: 'cyan',
  },
  { id: 'progress-liquidity', at: 3_050, type: 'task.progress', taskId: 'liquidity-break', progress: 48, state: '分析中' },
  {
    id: 'join-simons-liquidity',
    at: 3_650,
    type: 'agent.assign',
    agentId: 'simons',
    taskId: 'liquidity-break',
    mode: 'reviewing',
    humor: '模型不同意，正在举证',
    detail: '交叉验证危机窗口',
    skill: 'Regime Match',
    stateLabel: '协作中',
    stateTone: 'cyan',
  },
  activity('simons-joins', 4_100, 'simons', 'dalio', '加入流动性复核', '危机相似度升至 0.71', 'cyan'),
  { id: 'move-liquidity-analysis', at: 4_850, type: 'task.move', taskId: 'liquidity-break', lane: 1, progress: 56, state: '协作中' },
  {
    id: 'decision-shock',
    at: 5_500,
    type: 'decision',
    label: '降低风险预算',
    phaseLabel: '流动性冲击',
    note: '信用利差与融资压力同时恶化，团队进入防御模式。',
    volatility: 48.6,
    liquidity: 'LOW',
  },
  {
    id: 'assign-livermore-tape',
    at: 6_200,
    type: 'agent.assign',
    agentId: 'livermore',
    taskId: 'tape-confirmation',
    mode: 'working',
    humor: '手离回车键还有三厘米',
    detail: '观察卖盘加速结构',
    skill: 'Breakout Filter',
    stateLabel: '盯盘中',
    stateTone: 'ember',
  },
  { id: 'progress-tape', at: 7_000, type: 'task.progress', taskId: 'tape-confirmation', progress: 46, state: '分析中' },
  {
    id: 'assign-taleb-tail',
    at: 7_800,
    type: 'agent.assign',
    agentId: 'taleb',
    taskId: 'tail-budget',
    mode: 'reviewing',
    humor: '风险席今日照常扫兴',
    detail: '审核尾部保护条件',
    skill: 'Convexity Guard',
    stateLabel: '复核中',
    stateTone: 'ember',
  },
  { id: 'move-tail-review', at: 8_450, type: 'task.move', taskId: 'tail-budget', lane: 2, progress: 92, state: '待复核' },
  {
    id: 'alert-open-feed',
    at: 9_200,
    type: 'alert.open',
    alert: {
      id: 'market-feed-delay',
      status: 'error',
      title: '市场数据源延迟 1.8 秒',
      detail: '宏观情景计算等待最新深度快照',
      actorId: 'dalio',
      actorLabel: '达利欧正在接管',
    },
  },
  {
    id: 'dalio-firefight',
    at: 9_850,
    type: 'agent.state',
    agentId: 'dalio',
    mode: 'incident',
    humor: '摸鱼失败，数据源报警了',
    detail: '切换备用市场深度源',
    skill: 'Feed Recovery',
    stateLabel: '救火中',
    stateTone: 'rose',
  },
  {
    id: 'alert-handling-feed',
    at: 10_650,
    type: 'alert.update',
    status: 'handling',
    title: '备用数据源已接管',
    detail: '正在校验时间戳与盘口完整性',
    actorLabel: '达利欧 · 校验中',
  },
  activity('feed-recovery', 11_250, 'dalio', 'TEAM CORE', '切换备用行情源', '最新深度快照已进入校验', 'cyan'),
  {
    id: 'join-simons-tail',
    at: 12_400,
    type: 'agent.assign',
    agentId: 'simons',
    taskId: 'tail-budget',
    mode: 'reviewing',
    humor: '模型开始替风险席说话',
    detail: '复核波动率曲面异常',
    skill: 'Volatility Surface',
    stateLabel: '联合复核',
    stateTone: 'cyan',
  },
  { id: 'move-tape-review', at: 13_050, type: 'task.move', taskId: 'tape-confirmation', lane: 2, progress: 92, state: '待复核' },
  {
    id: 'alert-resolved-feed',
    at: 14_250,
    type: 'alert.update',
    status: 'resolved',
    title: '数据链路已恢复',
    detail: '主备行情偏差低于 4bp，计算继续',
    actorLabel: '达利欧 · 已交付',
  },
  { id: 'metrics-protection', at: 15_200, type: 'metrics', risk: 31, sync: 82, averageCycle: '03:42' },
  { id: 'alert-close-feed', at: 16_000, type: 'alert.close' },
  {
    id: 'release-dalio-feed',
    at: 16_850,
    type: 'agent.release',
    agentId: 'dalio',
    humor: '修完数据源，假装没加班',
    detail: '等待下一轮宏观输入',
    skill: 'Macro Scanner',
    stateLabel: '待命中',
    stateTone: 'steel',
  },
  { id: 'progress-tail-final', at: 17_350, type: 'task.progress', taskId: 'tail-budget', progress: 100, state: '已批准' },
  { id: 'move-tail-execution', at: 18_050, type: 'task.move', taskId: 'tail-budget', lane: 3, progress: 100, state: '执行中' },
  {
    id: 'trade-tail-hedge',
    at: 18_850,
    type: 'trade',
    side: 'S',
    position: 42,
    risk: 31,
    assetsDelta: -18_000,
    taskId: 'tail-budget',
  },
  activity('tail-hedge-done', 19_350, 'taleb', 'TEAM CORE', '建立两档尾部保护', '组合净敞口降至 42%', 'ember'),
  {
    id: 'assign-dalio-funding',
    at: 20_250,
    type: 'agent.assign',
    agentId: 'dalio',
    taskId: 'funding-spread',
    mode: 'working',
    humor: '又画了一张世界运行图',
    detail: '拆解商业票据融资利差',
    skill: 'Funding Stress',
    stateLabel: '推演中',
    stateTone: 'cyan',
  },
  {
    id: 'assign-buffett-balance',
    at: 21_100,
    type: 'agent.assign',
    agentId: 'buffett',
    taskId: 'balance-sheet',
    mode: 'working',
    humor: '下跌不耽误看资产负债表',
    detail: '扫描杠杆与自由现金流',
    skill: 'Balance Sheet Filter',
    stateLabel: '筛选中',
    stateTone: 'acid',
  },
  { id: 'move-quality-analysis', at: 22_000, type: 'task.move', taskId: 'quality-screen', lane: 1, progress: 54, state: '分析中' },
  { id: 'progress-quality-2', at: 22_850, type: 'task.progress', taskId: 'quality-screen', progress: 68, state: '协作中' },
  {
    id: 'join-simons-quality',
    at: 23_500,
    type: 'agent.assign',
    agentId: 'simons',
    taskId: 'quality-screen',
    mode: 'reviewing',
    humor: '模型允许小声乐观',
    detail: '验证质量因子稳定性',
    skill: 'Quality Stability',
    stateLabel: '联合分析',
    stateTone: 'cyan',
  },
  activity('quality-collab', 24_150, 'simons', 'buffett', '加入质量因子验证', '八个候选标的通过初筛', 'cyan'),
  { id: 'move-quality-review', at: 25_050, type: 'task.move', taskId: 'quality-screen', lane: 2, progress: 92, state: '待复核' },
  {
    id: 'livermore-waits',
    at: 26_200,
    type: 'agent.state',
    agentId: 'livermore',
    mode: 'waiting',
    humor: '不抢第一根反弹',
    detail: '等待成交量确认',
    skill: 'Breakout Filter',
    stateLabel: '等确认',
    stateTone: 'ember',
  },
  { id: 'move-tape-execution', at: 27_050, type: 'task.move', taskId: 'tape-confirmation', lane: 3, progress: 100, state: '监控中' },
  {
    id: 'decision-observe',
    at: 28_000,
    type: 'decision',
    label: '等待结构确认',
    phaseLabel: '等待确认',
    note: '卖单开始衰减，主动买盘仍未形成可靠反转。',
    volatility: 77.9,
    liquidity: 'LOW',
  },
  { id: 'metrics-observe', at: 29_050, type: 'metrics', risk: 29, sync: 78, averageCycle: '03:11' },
  {
    id: 'release-simons-quality',
    at: 30_000,
    type: 'agent.release',
    agentId: 'simons',
    humor: '模型跑完，先看人类争论',
    detail: '等待下一项交叉验证',
    skill: 'Regime Match',
    stateLabel: '待命中',
    stateTone: 'steel',
  },
  { id: 'move-reentry-analysis', at: 31_000, type: 'task.move', taskId: 'reentry-plan', lane: 1, progress: 34, state: '分析中' },
  {
    id: 'assign-buffett-reentry',
    at: 31_550,
    type: 'agent.assign',
    agentId: 'buffett',
    taskId: 'reentry-plan',
    mode: 'working',
    humor: '便宜开始有点像便宜了',
    detail: '制定两档建仓计划',
    skill: 'Position Staging',
    stateLabel: '核价中',
    stateTone: 'acid',
  },
  {
    id: 'join-livermore-reentry',
    at: 32_250,
    type: 'agent.assign',
    agentId: 'livermore',
    taskId: 'reentry-plan',
    mode: 'working',
    humor: '这次可以认真看一眼',
    detail: '测算入场滑点与成交深度',
    skill: 'Execution Depth',
    stateLabel: '测深度',
    stateTone: 'ember',
  },
  { id: 'progress-reentry', at: 33_400, type: 'task.progress', taskId: 'reentry-plan', progress: 64, state: '协作中' },
  { id: 'move-reentry-review', at: 34_250, type: 'task.move', taskId: 'reentry-plan', lane: 2, progress: 92, state: '待复核' },
  {
    id: 'join-taleb-reentry',
    at: 35_000,
    type: 'agent.assign',
    agentId: 'taleb',
    taskId: 'reentry-plan',
    mode: 'reviewing',
    humor: '可以进，但别冲',
    detail: '设置再入场风险上限',
    skill: 'Exposure Gate',
    stateLabel: '风险复核',
    stateTone: 'ember',
  },
  activity('three-agent-review', 36_000, 'taleb', 'buffett', '加入再入场复核', '价值、动量与风险完成三方会签', 'cyan'),
  {
    id: 'decision-reentry',
    at: 37_000,
    type: 'decision',
    label: '分批建立仓位',
    phaseLabel: '分批再入场',
    note: '成交深度回升，高质量资产进入历史低估区间。',
    volatility: 54.7,
    liquidity: 'RISING',
  },
  { id: 'move-reentry-execution', at: 38_000, type: 'task.move', taskId: 'reentry-plan', lane: 3, progress: 100, state: '执行中' },
  {
    id: 'trade-reentry-buy',
    at: 39_000,
    type: 'trade',
    side: 'B',
    position: 47,
    risk: 46,
    assetsDelta: 86_000,
    taskId: 'reentry-plan',
  },
  activity('reentry-filled', 40_000, 'TEAM CORE', 'ALL', '授权分批执行', '建立 47% 净多头仓位', 'acid'),
  { id: 'metrics-reentry', at: 41_000, type: 'metrics', sync: 89, averageCycle: '02:46' },
  {
    id: 'release-buffett-reentry',
    at: 42_000,
    type: 'agent.release',
    agentId: 'buffett',
    humor: '清单写完，咖啡也凉了',
    detail: '等待持仓质量回传',
    skill: 'Quality Drift',
    stateLabel: '待命中',
    stateTone: 'steel',
  },
  { id: 'move-balance-review', at: 43_000, type: 'task.move', taskId: 'balance-sheet', lane: 2, progress: 92, state: '待复核' },
  {
    id: 'assign-simons-balance',
    at: 44_000,
    type: 'agent.assign',
    agentId: 'simons',
    taskId: 'balance-sheet',
    mode: 'reviewing',
    humor: '模型正在挑财报的刺',
    detail: '验证资产质量因子',
    skill: 'Balance Sheet Test',
    stateLabel: '复核中',
    stateTone: 'cyan',
  },
  { id: 'move-quality-complete', at: 45_000, type: 'task.move', taskId: 'quality-screen', lane: 3, progress: 100, state: '已交付' },
  { id: 'metrics-quality-delivery', at: 46_000, type: 'metrics', assetsDelta: 42_000, sync: 91 },
  {
    id: 'dalio-report-sent',
    at: 47_000,
    type: 'agent.state',
    agentId: 'dalio',
    mode: 'waiting',
    humor: '报告发了，假装下班',
    detail: '等待政策信号更新',
    skill: 'Policy Map',
    stateLabel: '等回传',
    stateTone: 'steel',
  },
  { id: 'recycle-policy', at: 49_000, type: 'task.recycle', taskId: 'policy-news' },
  {
    id: 'assign-dalio-policy',
    at: 49_650,
    type: 'agent.assign',
    agentId: 'dalio',
    taskId: 'policy-news',
    mode: 'working',
    humor: '又和政策路径开会',
    detail: '筛选央行措辞与可信度',
    skill: 'Policy Signal Map',
    stateLabel: '扫描中',
    stateTone: 'cyan',
  },
  { id: 'progress-policy', at: 51_000, type: 'task.progress', taskId: 'policy-news', progress: 48, state: '分析中' },
  { id: 'move-policy-analysis', at: 52_000, type: 'task.move', taskId: 'policy-news', lane: 1, progress: 56, state: '分析中' },
  {
    id: 'join-taleb-policy',
    at: 53_000,
    type: 'agent.assign',
    agentId: 'taleb',
    taskId: 'policy-news',
    mode: 'reviewing',
    humor: '风险席来给政策信号降温',
    detail: '审核政策信号失效风险',
    skill: 'Narrative Risk',
    stateLabel: '联合分析',
    stateTone: 'ember',
  },
  activity('policy-collab', 54_000, 'taleb', 'dalio', '加入政策信号复核', '可信度阈值上调至 0.64', 'cyan'),
  {
    id: 'decision-monitor',
    at: 55_000,
    type: 'decision',
    label: '持有并监控回撤',
    phaseLabel: '持有与监控',
    note: '反弹结构成立，团队保留风险缓冲并跟踪利润质量。',
    volatility: 46.8,
    liquidity: 'NORMAL',
  },
  {
    id: 'trade-monitor',
    at: 56_000,
    type: 'trade',
    side: 'B',
    position: 58,
    risk: 52,
    assetsDelta: 32_000,
    taskId: 'reentry-plan',
  },
  {
    id: 'release-livermore',
    at: 57_000,
    type: 'agent.release',
    agentId: 'livermore',
    humor: '已成交，拒绝复盘庆功',
    detail: '监控价格结构与回撤',
    skill: 'Position Keeper',
    stateLabel: '监控中',
    stateTone: 'acid',
  },
  { id: 'recycle-earnings', at: 58_000, type: 'task.recycle', taskId: 'earnings-resilience' },
  {
    id: 'assign-buffett-earnings',
    at: 59_000,
    type: 'agent.assign',
    agentId: 'buffett',
    taskId: 'earnings-resilience',
    mode: 'working',
    humor: '新一轮财报，又可以算账',
    detail: '验证盈利韧性与应收质量',
    skill: 'Earnings Quality',
    stateLabel: '核价中',
    stateTone: 'acid',
  },
]

function initialTaskState(task, index) {
  const lane = INITIAL_LANES[index] ?? 0
  const progress = lane === 0 ? 0 : lane === 1 ? 38 + (index % 3) * 7 : lane === 2 ? 92 : 100
  const state = lane === 0 ? '待处理' : lane === 1 ? '分析中' : lane === 2 ? '待复核' : '已交付'
  return {
    ...task,
    lane,
    progress,
    state,
    updatedAt: -index * 120,
    movingUntil: 0,
  }
}

export function createV4RuntimeState() {
  return {
    timeMs: 0,
    sequence: 1,
    tasks: Object.fromEntries(V3_TASKS.map((task, index) => [task.id, initialTaskState(task, index)])),
    agents: Object.fromEntries(V3_TEAM_IDS.map((agentId, index) => [
      agentId,
      {
        agentId,
        ...INITIAL_AGENT_STATE[agentId],
        anchor: index % 3,
        updatedAt: -index * 160,
        movingUntil: 0,
      },
    ])),
    activities: INITIAL_ACTIVITY,
    alert: null,
    metrics: {
      assets: 3_141_000,
      risk: 38,
      sync: 74,
      position: 68,
      averageCycle: '04:18',
    },
    decision: {
      label: '降低风险预算',
      phaseLabel: '流动性冲击',
      note: '信用利差与融资压力同时恶化，团队进入防御模式。',
      volatility: 48.6,
      liquidity: 'LOW',
      updatedAt: 0,
    },
    tradeMarkers: [],
    lastEvent: null,
  }
}

function cloneAgent(state, agentId, patch, event) {
  return {
    ...state,
    agents: {
      ...state.agents,
      [agentId]: {
        ...state.agents[agentId],
        ...patch,
        updatedAt: event.at,
      },
    },
  }
}

function cloneTask(state, taskId, patch, event) {
  const current = state.tasks[taskId]
  if (!current) return state
  const shouldRefreshQueueOrder = event.type !== 'task.progress'
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...current,
        ...patch,
        updatedAt: shouldRefreshQueueOrder ? event.at : current.updatedAt,
      },
    },
  }
}

function applyEvent(currentState, event) {
  let state = {
    ...currentState,
    sequence: currentState.sequence + 1,
    lastEvent: event,
  }

  switch (event.type) {
    case 'agent.assign':
      return cloneAgent(state, event.agentId, {
        taskId: event.taskId,
        mode: event.mode,
        humor: event.humor,
        detail: event.detail,
        skill: event.skill,
        stateLabel: event.stateLabel,
        stateTone: event.stateTone,
        anchor: state.sequence % 3,
        movingUntil: event.at + 680,
      }, event)
    case 'agent.state':
      return cloneAgent(state, event.agentId, {
        mode: event.mode,
        humor: event.humor,
        detail: event.detail,
        skill: event.skill,
        stateLabel: event.stateLabel,
        stateTone: event.stateTone,
      }, event)
    case 'agent.release':
      return cloneAgent(state, event.agentId, {
        taskId: null,
        mode: 'idle',
        humor: event.humor,
        detail: event.detail,
        skill: event.skill,
        stateLabel: event.stateLabel,
        stateTone: event.stateTone,
        movingUntil: event.at + 420,
      }, event)
    case 'task.recycle':
      return cloneTask(state, event.taskId, {
        lane: 0,
        progress: 0,
        state: '待处理',
        movingUntil: event.at + 720,
      }, event)
    case 'task.move':
      return cloneTask(state, event.taskId, {
        lane: event.lane,
        progress: event.progress,
        state: event.state,
        movingUntil: event.at + 720,
      }, event)
    case 'task.progress':
      return cloneTask(state, event.taskId, {
        progress: event.progress,
        state: event.state,
      }, event)
    case 'activity':
      return {
        ...state,
        activities: [
          {
            id: event.absoluteId,
            at: event.at,
            from: event.from,
            to: event.to,
            action: event.action,
            detail: event.detail,
            tone: event.tone,
          },
          ...state.activities,
        ].slice(0, 50),
      }
    case 'decision':
      return {
        ...state,
        decision: {
          label: event.label,
          phaseLabel: event.phaseLabel,
          note: event.note,
          volatility: event.volatility,
          liquidity: event.liquidity,
          updatedAt: event.at,
        },
      }
    case 'metrics':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...(event.risk == null ? null : { risk: event.risk }),
          ...(event.sync == null ? null : { sync: event.sync }),
          ...(event.averageCycle == null ? null : { averageCycle: event.averageCycle }),
          assets: state.metrics.assets + (event.assetsDelta ?? 0),
        },
      }
    case 'trade':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          position: event.position,
          risk: event.risk,
          assets: state.metrics.assets + (event.assetsDelta ?? 0),
        },
        tradeMarkers: [
          ...state.tradeMarkers,
          {
            id: event.absoluteId,
            at: event.at,
            label: event.side,
            tone: event.side === 'B' ? 'cyan' : 'ember',
            taskId: event.taskId,
          },
        ].slice(-18),
      }
    case 'alert.open':
      return {
        ...state,
        alert: {
          ...event.alert,
          openedAt: event.at,
          updatedAt: event.at,
        },
      }
    case 'alert.update':
      if (!state.alert) return state
      return {
        ...state,
        alert: {
          ...state.alert,
          status: event.status,
          title: event.title,
          detail: event.detail,
          actorLabel: event.actorLabel,
          updatedAt: event.at,
        },
      }
    case 'alert.close':
      return { ...state, alert: null }
    default:
      return state
  }
}

function materializeEvent(relativeEvent, cycleIndex) {
  const at = cycleIndex * V4_RUNTIME_CYCLE_MS + relativeEvent.at
  return {
    ...relativeEvent,
    at,
    cycleIndex,
    absoluteId: `${cycleIndex}-${relativeEvent.id}`,
  }
}

function eventsBetween(fromMs, toMs) {
  if (toMs <= fromMs) return []
  const firstCycle = Math.max(0, Math.floor(fromMs / V4_RUNTIME_CYCLE_MS))
  const lastCycle = Math.max(firstCycle, Math.floor(toMs / V4_RUNTIME_CYCLE_MS))
  const events = []

  for (let cycleIndex = firstCycle; cycleIndex <= lastCycle; cycleIndex += 1) {
    for (const relativeEvent of SCENARIO_EVENTS) {
      const event = materializeEvent(relativeEvent, cycleIndex)
      if (event.at > fromMs && event.at <= toMs) events.push(event)
    }
  }

  return events.sort((a, b) => a.at - b.at)
}

export function advanceV4Runtime(currentState, elapsedMs) {
  const targetTime = Math.max(currentState.timeMs, currentState.timeMs + Math.max(0, elapsedMs))
  let nextState = currentState

  for (const event of eventsBetween(currentState.timeMs, targetTime)) {
    nextState = applyEvent(nextState, event)
  }

  return nextState.timeMs === targetTime
    ? nextState
    : { ...nextState, timeMs: targetTime }
}

export function formatV4Time(timeMs = 0) {
  const elapsedMinutes = Math.floor(Math.max(0, timeMs) / 1_000) * 2
  const totalMinutes = (Math.floor(RUNTIME_START_SECONDS / 60) + elapsedMinutes) % (24 * 60)
  return `${twoDigits(Math.floor(totalMinutes / 60))}:${twoDigits(totalMinutes % 60)}`
}

function priceAt(timeMs) {
  const seconds = timeMs / 1_000
  const cycle = seconds / 60
  const crisisWave = Math.cos(cycle * Math.PI * 2) * 7.8
  const structure = Math.sin(seconds * 0.31) * 2.4
  const micro = Math.sin(seconds * 1.27) * 0.72 + Math.cos(seconds * 0.73) * 0.48
  return 88 + crisisWave + structure + micro
}

export function createV4Candles(timeMs, tradeMarkers = [], windowSize = 28) {
  const currentIndex = Math.floor(timeMs / V4_CANDLE_MS)
  const firstIndex = currentIndex - windowSize + 1
  const markerByCandle = new Map(
    tradeMarkers.map((marker) => [Math.floor(marker.at / V4_CANDLE_MS), marker]),
  )

  return Array.from({ length: windowSize }, (_, offset) => {
    const index = firstIndex + offset
    const startMs = index * V4_CANDLE_MS
    const endMs = Math.min(startMs + V4_CANDLE_MS, timeMs)
    const sampleEnd = Math.max(startMs + 120, endMs)
    const open = priceAt(startMs)
    const close = priceAt(sampleEnd)
    const fraction = Math.max(0.08, Math.min(1, (sampleEnd - startMs) / V4_CANDLE_MS))
    const spread = (0.62 + ((Math.abs(index) * 7) % 5) * 0.13) * fraction
    const marker = markerByCandle.get(index)

    return {
      id: index,
      t: formatV4Time(Math.max(0, startMs)),
      open: Number(open.toFixed(2)),
      high: Number((Math.max(open, close) + spread).toFixed(2)),
      low: Number((Math.min(open, close) - spread * 0.82).toFixed(2)),
      close: Number(close.toFixed(2)),
      marker: marker ? { label: marker.label, tone: marker.tone } : null,
    }
  })
}

export function getV4MarketValue(timeMs) {
  return priceAt(timeMs)
}

export function getV4PaperAssets(state) {
  const markToMarket = (priceAt(state.timeMs) - priceAt(Math.max(0, state.timeMs - 4_800)))
    * state.metrics.position
    * 42
  return Math.round(state.metrics.assets + markToMarket)
}

export function createV4EquityHistory(state, points = 18) {
  return Array.from({ length: points }, (_, index) => {
    const sampleTime = Math.max(0, state.timeMs - (points - 1 - index) * V4_MARKET_SAMPLE_MS)
    const drift = (priceAt(sampleTime) - priceAt(Math.max(0, sampleTime - 4_800)))
      * state.metrics.position
      * 42
    return Math.round(state.metrics.assets + drift)
  })
}

export function getV4RuntimeTasks(state) {
  return Object.values(state.tasks)
}

export function getV4LaneTasks(state, laneIndex) {
  return Object.values(state.tasks)
    .filter((task) => task.lane === laneIndex)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getV4TaskAgents(state, taskId) {
  return V3_TEAM_IDS
    .map((agentId) => state.agents[agentId])
    .filter((agent) => agent.taskId === taskId)
    .sort((a, b) => a.updatedAt - b.updatedAt)
}

export function getV4ActiveTaskCount(state) {
  return new Set(
    Object.values(state.agents)
      .map((agent) => agent.taskId)
      .filter(Boolean),
  ).size
}

export function getV4Alpha(assets) {
  return ((assets - INITIAL_ASSETS) / INITIAL_ASSETS) * 100
}

export function getV4CycleProgress(timeMs) {
  return (timeMs % V4_RUNTIME_CYCLE_MS) / V4_RUNTIME_CYCLE_MS
}
