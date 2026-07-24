import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CirclePause,
  CirclePlay,
  FastForward,
  LoaderCircle,
  MousePointer2,
  RadioTower,
  RotateCcw,
  X,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { agentOrganizationLine, agents, events } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action } from '../components/UI.jsx'
import { MarketChart } from '../components/Charts.jsx'
import {
  AGENT_IDENTITY,
  RUNTIME_LANES,
  V3_TEAM_IDS,
  advanceV4Runtime,
  createV4Candles,
  createV4EquityHistory,
  createV4RuntimeState,
  formatV4Time,
  getV4ActiveTaskCount,
  getV4Alpha,
  getV4LaneTasks,
  getV4LivePosition,
  getV4PaperAssets,
  getV4RuntimeTasks,
  getV4TaskAgents,
  getV4TeamCoreState,
} from '../runtimeV4Engine.js'
import '../v3-runtime.css'
import '../v4-runtime-motion.css'

const speeds = [1, 2, 4]
const identityFallback = Object.values(AGENT_IDENTITY)
const LANE_VISIBLE_TASK_LIMIT = 5
const FRAME_COMMIT_MS = 80
const PERMISSION_MODES = [
  {
    id: 'request',
    label: '默认权限',
    scope: '每个敏感任务单独请求批准',
    tone: 'steel',
    action: '确认本次',
  },
  {
    id: 'review',
    label: '替我审核',
    scope: '单笔 ≤8% 自动放行，超限再询问',
    tone: 'acid',
    action: '越级批准',
  },
  {
    id: 'full',
    label: '完全权限',
    scope: '允许所有模拟仓位、杠杆与执行操作',
    tone: 'rose',
  },
  {
    id: 'custom',
    label: '自定义权限',
    scope: '均衡守则 A · 总仓 55% · 单笔 8% · 1.5×',
    tone: 'cyan',
    action: '例外批准',
  },
]
const CUSTOM_PERMISSION_MAX_TRADE = 8
const paperAssetFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

function useCompactRuntimeMotion() {
  const [compact, setCompact] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches
  ))

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return compact
}

function AlphaSparkline({ values, negative }) {
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(1, maximum - minimum)
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100
    const y = 24 - ((value - minimum) / range) * 20
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
  const latestPoint = points.split(' ').at(-1)?.split(',') ?? ['100', '14']

  return (
    <svg
      className={`v3-alpha-sparkline ${negative ? 'is-negative' : ''}`}
      viewBox="0 0 100 28"
      role="img"
      aria-label="最近十八个市场采样的模拟净值变化"
      preserveAspectRatio="none"
    >
      <title>最近十八个市场采样的模拟净值变化</title>
      <path d="M0 24H100" />
      <polyline points={points} />
      <circle cx={latestPoint[0]} cy={latestPoint[1]} r="2.1" />
    </svg>
  )
}

function taskTone(state) {
  if (state === '待复核' || state === '执行中' || state === '已批准') return 'ember'
  if (state === '已阻塞') return 'rose'
  if (state === '已交付' || state === '监控中') return 'acid'
  if (state === '协作中') return 'cyan'
  return 'steel'
}

function uniqueTeam(selectedAgentIds) {
  const selected = selectedAgentIds
    .map((id) => agents.find((agent) => agent.id === id))
    .filter(Boolean)
  const defaults = V3_TEAM_IDS
    .map((id) => agents.find((agent) => agent.id === id))
    .filter(Boolean)
  return [...selected, ...defaults]
    .filter((agent, index, list) => list.findIndex((item) => item.id === agent.id) === index)
    .slice(0, 5)
}

function alertIcon(status) {
  if (status === 'resolved') return <Check size={15} />
  if (status === 'handling') return <LoaderCircle size={15} />
  return <AlertTriangle size={15} />
}

function RuntimeAlert({ alert, actor, identity, reducedMotion }) {
  return (
    <div className="v4-alert-stage" aria-live="assertive" aria-atomic="true">
      <AnimatePresence initial={false}>
        {alert && (
          <motion.section
            key={alert.id}
            className={`v4-runtime-alert is-${alert.status}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18, scaleX: .96 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scaleX: .98 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="v4-alert-icon">{alertIcon(alert.status)}</div>
            <div className="v4-alert-copy">
              <b>{alert.title}</b>
              <span>{alert.detail}</span>
            </div>
            <div
              className="v4-alert-agent"
              style={{ '--agent-color': identity?.color ?? 'var(--cyan)' }}
            >
              <i />
              <span>{actor?.name ?? '系统代理'}</span>
              <em>{alert.actorLabel}</em>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

function PermissionReviewCard({
  task,
  taskAgents,
  team,
  agentColor,
  sessionTime,
  runId,
  reducedMotion,
}) {
  const [modeId, setModeId] = useState('request')
  const [taskDecisions, setTaskDecisions] = useState({})
  const modeIndex = Math.max(0, PERMISSION_MODES.findIndex((item) => item.id === modeId))
  const mode = PERMISSION_MODES.find((item) => item.id === modeId) ?? PERMISSION_MODES[0]
  const nextMode = PERMISSION_MODES[(modeIndex + 1) % PERMISSION_MODES.length]
  const requestedPosition = 5 + (task.id.length % 7)
  const agentNames = taskAgents.length
    ? taskAgents
      .map((item) => team[V3_TEAM_IDS.indexOf(item.agentId)]?.name)
      .filter(Boolean)
      .join(' × ')
    : 'TEAM CORE'

  const automaticOutcome = modeId === 'full'
    ? { status: 'approved', message: '完全权限已启用 · 无需逐项审核' }
    : modeId === 'review' && requestedPosition <= 8
      ? { status: 'approved', message: `替我审核 · ${requestedPosition}% 在授权阈值内` }
      : modeId === 'custom' && requestedPosition <= CUSTOM_PERMISSION_MAX_TRADE
        ? { status: 'approved', message: '均衡守则 A · 当前任务自动放行' }
        : null
  const outcome = automaticOutcome ?? taskDecisions[task.id] ?? null
  const needsReview = outcome == null
  const statusLabel = needsReview
    ? '待审核'
    : outcome.status === 'denied'
      ? '已否决'
      : automaticOutcome
        ? '已放行'
        : '已批准'

  useEffect(() => {
    setModeId('request')
    setTaskDecisions({})
  }, [runId])

  const cycleMode = () => {
    setModeId(nextMode.id)
    setTaskDecisions((current) => {
      if (!(task.id in current)) return current
      const next = { ...current }
      delete next[task.id]
      return next
    })
  }

  const decide = (status) => {
    setTaskDecisions((current) => ({
      ...current,
      [task.id]: {
        status,
        message: status === 'denied'
          ? `${sessionTime} · 已否决，任务退回队列`
          : `${sessionTime} · 已批准本次任务`,
      },
    }))
  }

  return (
    <section
      className="v3-task-inspector v4-permission-review"
      data-mode={modeId}
      data-outcome={outcome?.status ?? 'pending'}
      data-pending={needsReview ? 'true' : 'false'}
      style={{ '--agent-color': agentColor }}
      aria-labelledby="permission-review-title"
    >
      <div className="v4-permission-heading">
        <span>ACTIVE TASK · PERMISSION REVIEW</span>
        <em>{statusLabel}</em>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="v4-permission-task"
          key={task.id}
          initial={reducedMotion ? false : { opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: 4 }}
          transition={{ duration: reducedMotion ? 0 : .18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <small>{agentNames} · {task.skill}</small>
            <h3 id="permission-review-title">{task.title}</h3>
          </div>
          <span><small>REQUEST</small><b>±{requestedPosition}%</b></span>
        </motion.div>
      </AnimatePresence>

      <div className={`v4-permission-current tone-${mode.tone}`}>
        <div>
          <small>CURRENT POLICY</small>
          <b>{mode.label}</b>
          <span>{mode.scope}</span>
        </div>
        <button
          type="button"
          className="v4-permission-cycle"
          onClick={cycleMode}
          title={`切换至${nextMode.label}`}
          aria-label={`当前为${mode.label}，切换至${nextMode.label}`}
        >
          <RotateCcw size={10} />
          <span>切换</span>
        </button>
      </div>

      <div className="v4-permission-resolution" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {needsReview ? (
            <motion.div
              className="v4-permission-actions"
              key={`actions-${task.id}-${modeId}`}
              initial={reducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: reducedMotion ? 0 : .16, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className="is-deny" onClick={() => decide('denied')}>
                <X size={12} />否决
              </button>
              <button
                type="button"
                className={`is-approve tone-${mode.tone}`}
                onClick={() => decide('approved')}
              >
                <Check size={12} />{mode.action}
              </button>
            </motion.div>
          ) : (
            <motion.output
              className={`v4-permission-outcome is-${outcome.status}`}
              key={`${task.id}-${modeId}-${outcome.status}`}
              initial={reducedMotion ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: reducedMotion ? 0 : .16, ease: [0.16, 1, 0.3, 1] }}
            >
              {outcome.status === 'denied' ? <X size={12} /> : <Check size={12} />}
              <span>{outcome.message}</span>
            </motion.output>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export function RuntimePage() {
  const demo = useDemo()
  const prefersReducedMotion = useReducedMotion()
  const compactMotion = useCompactRuntimeMotion()
  const reducedMotion = prefersReducedMotion || compactMotion
  const event = events.find((item) => item.id === demo.selectedEventId) ?? events[2]
  const team = useMemo(() => uniqueTeam(demo.selectedAgentIds), [demo.selectedAgentIds])
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [runtime, setRuntime] = useState(() => createV4RuntimeState())
  const [runId, setRunId] = useState(1)
  const [focusedAgentId, setFocusedAgentId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('tape-confirmation')
  const frameRef = useRef(null)
  const lastFrameRef = useRef(null)
  const lastCommitRef = useRef(null)
  const elapsedRef = useRef(0)

  const seatByRoleId = useMemo(
    () => Object.fromEntries(V3_TEAM_IDS.map((roleId, index) => [roleId, team[index]])),
    [team],
  )

  const identityForRole = (roleId) => {
    const roleIndex = V3_TEAM_IDS.indexOf(roleId)
    const seatedAgent = seatByRoleId[roleId]
    return AGENT_IDENTITY[seatedAgent?.id] ?? identityFallback[roleIndex] ?? identityFallback[0]
  }

  const runtimeTasks = useMemo(
    () => getV4RuntimeTasks(runtime).map((task) => ({
      ...task,
      owner: seatByRoleId[task.ownerId] ?? team[0],
    })),
    [runtime, seatByRoleId, team],
  )

  const taskById = useMemo(
    () => Object.fromEntries(runtimeTasks.map((task) => [task.id, task])),
    [runtimeTasks],
  )

  const laneTaskGroups = useMemo(
    () => RUNTIME_LANES.map((_, laneIndex) => {
      const tasks = getV4LaneTasks(runtime, laneIndex).map((task) => taskById[task.id])
      return {
        tasks,
        hiddenTaskCount: Math.max(0, tasks.length - LANE_VISIBLE_TASK_LIMIT),
        visibleTasks: tasks.slice(0, LANE_VISIBLE_TASK_LIMIT),
      }
    }),
    [runtime, taskById],
  )

  const selectedTask = taskById[selectedTaskId] ?? runtimeTasks[0]
  const approvalTask = runtimeTasks
    .filter((task) => task.lane === 2)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? selectedTask
  const approvalTaskAgents = approvalTask ? getV4TaskAgents(runtime, approvalTask.id) : []
  const activeTaskCount = getV4ActiveTaskCount(runtime)
  const sessionTime = formatV4Time(runtime.timeMs)
  const candles = useMemo(
    () => createV4Candles(runtime.timeMs, runtime.tradeMarkers, 28),
    [runtime.timeMs, runtime.tradeMarkers],
  )
  const latestCandle = candles.at(-1)
  const paperAssets = getV4PaperAssets(runtime)
  const displayAssets = Math.round(paperAssets / 1_000) * 1_000
  const alpha = getV4Alpha(paperAssets)
  const livePosition = getV4LivePosition(runtime)
  const teamCore = getV4TeamCoreState(runtime.timeMs)
  const equityHistory = useMemo(() => createV4EquityHistory(runtime), [runtime])
  const alertActor = runtime.alert?.actorId ? seatByRoleId[runtime.alert.actorId] : null
  const alertIdentity = runtime.alert?.actorId ? identityForRole(runtime.alert.actorId) : null

  const resolveActor = (actor) => {
    if (actor === 'TEAM CORE') return { name: 'TEAM CORE', identity: null }
    if (actor === 'ALL') return { name: '全体成员', identity: null }
    const roleIndex = V3_TEAM_IDS.indexOf(actor)
    const agent = roleIndex >= 0 ? team[roleIndex] : null
    return {
      name: agent?.name ?? actor,
      identity: roleIndex >= 0 ? identityForRole(actor) : null,
    }
  }

  useEffect(() => {
    const frame = (now) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = now
        lastCommitRef.current = now
      }

      const rawDelta = Math.min(120, Math.max(0, now - lastFrameRef.current))
      lastFrameRef.current = now

      if (!paused) {
        elapsedRef.current += rawDelta * speed
        if (now - lastCommitRef.current >= FRAME_COMMIT_MS) {
          const elapsed = elapsedRef.current
          elapsedRef.current = 0
          lastCommitRef.current = now
          setRuntime((current) => advanceV4Runtime(current, elapsed))
        }
      } else {
        elapsedRef.current = 0
        lastCommitRef.current = now
      }

      frameRef.current = window.requestAnimationFrame(frame)
    }

    frameRef.current = window.requestAnimationFrame(frame)
    return () => {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      lastFrameRef.current = null
      lastCommitRef.current = null
      elapsedRef.current = 0
    }
  }, [paused, speed])

  const togglePaused = () => setPaused((current) => !current)

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed)
    setSpeed(speeds[(currentIndex + 1) % speeds.length])
  }

  const restartRuntime = () => {
    setRuntime(createV4RuntimeState())
    setRunId((current) => current + 1)
    setFocusedAgentId('')
    setSelectedTaskId('tape-confirmation')
    setPaused(false)
  }

  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.52 / speed, ease: [0.16, 1, 0.3, 1] }

  return (
    <div
      className={`page v3-runtime-page v4-runtime-page ${paused ? 'is-paused' : 'is-running'} ${reducedMotion ? 'is-reduced-motion' : ''}`}
      data-runtime-version="v4"
      data-alert={runtime.alert?.status ?? 'none'}
      style={{ '--runtime-speed': speed }}
    >
      <section className="v3-runtime-shell" aria-label="历史副本实时模拟控制台">
        <header className="v3-runtime-topbar">
          <div className="v3-scenario-title">
            <span>HISTORICAL RUNTIME · 04</span>
            <div><b>{event.year}</b><h1>{event.name}</h1></div>
            <small>{teamCore.phaseLabel} · PAPER REPLAY</small>
          </div>

          <div className="v3-runtime-kpis" aria-label="模拟关键指标">
            <div>
              <span>ACTIVE TASKS</span>
              <b>{activeTaskCount}<small>/ {runtimeTasks.length}</small></b>
              <em>实时任务</em>
            </div>
            <div>
              <span>AVG CYCLE</span>
              <b>{runtime.metrics.averageCycle}</b>
              <em>平均处理时间</em>
            </div>
            <div className="v3-kpi-assets">
              <span>PAPER ASSETS</span>
              <b>{paperAssetFormatter.format(displayAssets)}</b>
              <em>模拟账户净值</em>
            </div>
            <div className="v3-kpi-alpha">
              <span>PAPER ALPHA</span>
              <div className="v3-kpi-curve-row">
                <b className={alpha < 0 ? 'tone-rose' : 'tone-acid'}>
                  {alpha > 0 ? '+' : ''}{alpha.toFixed(1)}%
                </b>
                <AlphaSparkline values={equityHistory} negative={alpha < 0} />
              </div>
              <em>近 18 个运行刻</em>
            </div>
            <div>
              <span>RISK BUDGET</span>
              <b>{runtime.metrics.risk}%</b>
              <em>可用风险预算</em>
            </div>
          </div>

          <div className="v3-runtime-clock">
            <span>{paused ? 'PAUSED' : `${speed}× RUNNING`}</span>
            <b>{sessionTime}</b>
            <small>SYNC {runtime.metrics.sync}</small>
          </div>
        </header>

        <RuntimeAlert
          alert={runtime.alert}
          actor={alertActor}
          identity={alertIdentity}
          reducedMotion={reducedMotion}
        />

        <div className="v3-operations-grid">
          <aside className="v3-agent-roster" aria-label="Alpha Team 成员状态">
            <div className="v3-panel-heading">
              <div><span>ALPHA TEAM</span><b>五人编制</b></div>
              <em>{Object.values(runtime.agents).filter((agent) => agent.taskId).length}/5 ACTIVE</em>
            </div>

            <div className="v3-agent-list">
              {V3_TEAM_IDS.map((roleId, index) => {
                const agent = team[index]
                const identity = identityForRole(roleId)
                const status = runtime.agents[roleId]
                const focused = focusedAgentId === roleId
                return (
                  <button
                    type="button"
                    className={`v3-agent-card ${focused ? 'is-focused' : ''}`}
                    style={{ '--agent-color': identity.color }}
                    key={roleId}
                    onClick={() => setFocusedAgentId((current) => current === roleId ? '' : roleId)}
                    aria-pressed={focused}
                    data-state-tone={status.stateTone}
                  >
                    <div className="v3-agent-card-head">
                      <i aria-hidden="true" />
                      <div><strong>{agent.name}</strong><span>{identity.shortRole}</span></div>
                      <em>{status.stateLabel}</em>
                    </div>
                    <p>{status.humor}</p>
                    <small>{status.detail}</small>
                    <div className="v3-agent-meta"><span>{agentOrganizationLine(agent)}</span><em>{status.skill}</em></div>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="v3-task-board">
            <div className="v3-panel-heading v3-board-heading">
              <div>
                <span>TEAM WORKFLOW</span>
                <b>{teamCore.label}</b>
              </div>
              <div className="v3-stream-indicator">
                <RadioTower size={14} />
                <span>{paused ? 'HOLD' : 'ASYNC FLOW'}</span>
              </div>
            </div>

            <LayoutGroup id={`v4-runtime-board-${runId}`}>
              <div className="v3-lanes">
                {RUNTIME_LANES.map((lane, laneIndex) => {
                  const { tasks: laneTasks, hiddenTaskCount, visibleTasks } = laneTaskGroups[laneIndex]
                  return (
                    <section className="v3-lane" key={lane.id} aria-labelledby={`lane-${lane.id}`}>
                      <header>
                        <div><span>{lane.index}</span><h2 id={`lane-${lane.id}`}>{lane.label}</h2></div>
                        <em title={hiddenTaskCount ? `${hiddenTaskCount} 个任务位于可视窗口之外` : undefined}>
                          {laneTasks.length.toString().padStart(2, '0')} TASKS
                        </em>
                        <small>{lane.meta}</small>
                      </header>

                      <div className="v3-lane-stack" data-overflow-count={hiddenTaskCount}>
                        <AnimatePresence initial={false} mode="popLayout">
                          {visibleTasks.map((task, visibleIndex) => {
                            const taskAgents = getV4TaskAgents(runtime, task.id)
                            const visibleAgents = taskAgents.slice(0, 2)
                            const overflowAgents = Math.max(0, taskAgents.length - visibleAgents.length)
                            const ownerRoleIndex = V3_TEAM_IDS.indexOf(task.ownerId)
                            const domainIdentity = identityForRole(task.ownerId)
                            const visualIdentity = taskAgents.length
                              ? identityForRole(taskAgents[0].agentId)
                              : domainIdentity
                            const hasActiveAgent = taskAgents.length > 0
                            const dimmed = focusedAgentId && !taskAgents.some((item) => item.agentId === focusedAgentId)
                            const isMoving = task.movingUntil > runtime.timeMs
                            const cardOpacity = dimmed ? .2 : hasActiveAgent ? 1 : .5
                            const cardFilter = dimmed
                              ? 'brightness(.62) saturate(.18)'
                              : hasActiveAgent
                                ? 'brightness(1) saturate(1)'
                                : 'brightness(.76) saturate(.32)'

                            return (
                              <motion.button
                                layout="position"
                                layoutId={`v4-task-${task.id}`}
                                key={task.id}
                                type="button"
                                className={`v3-task-card ${visibleIndex === 0 ? 'is-lane-lead' : ''} ${hasActiveAgent ? 'has-active-agent' : 'is-unassigned'} ${selectedTaskId === task.id ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''} ${isMoving ? 'is-moving' : ''}`}
                                style={{
                                  '--agent-color': visualIdentity.color,
                                  '--domain-color': domainIdentity.color,
                                  '--agent-tint': `${visualIdentity.color}12`,
                                }}
                                transition={layoutTransition}
                                initial={false}
                                animate={{ opacity: cardOpacity, scale: isMoving && !reducedMotion ? 1.012 : 1, filter: cardFilter }}
                                exit={reducedMotion
                                  ? { opacity: 0 }
                                  : {
                                      opacity: [1, 1, 0],
                                      scaleY: [1, .035, 0],
                                      filter: ['brightness(1)', 'brightness(2.6)', 'brightness(4)'],
                                      transition: {
                                        duration: .38 / speed,
                                        ease: [0.7, 0, 0.84, 0],
                                        times: [0, .72, 1],
                                      },
                                    }}
                                onClick={() => {
                                  setSelectedTaskId(task.id)
                                  setFocusedAgentId(taskAgents[0]?.agentId ?? '')
                                }}
                              >
                                <div className="v3-task-owner">
                                  <span><i />{identityFallback[ownerRoleIndex]?.shortRole ?? domainIdentity.shortRole}任务</span>
                                  <em className={`tone-${taskTone(task.state)}`}>{task.state}</em>
                                </div>
                                <h3>{task.title}</h3>
                                <p>{task.skill}</p>
                                <small>{task.factor}</small>
                                {task.lane === 1 && (
                                  <div className="v3-task-progress" aria-label={`任务进度 ${task.progress}%`}>
                                    <span style={{ transform: `scaleX(${task.progress / 100})` }} />
                                  </div>
                                )}
                                <div className="v3-task-card-footer"><span>{task.deliverable}</span><ArrowRight size={13} /></div>

                                <div
                                  className={`v4-agent-presence-dock has-${Math.min(3, taskAgents.length)}`}
                                  aria-label={taskAgents.length
                                    ? `${taskAgents.length} 位 Agent 正在处理此任务`
                                    : '当前没有 Agent 处理此任务'}
                                >
                                  {visibleAgents.map((runtimeAgent, agentIndex) => {
                                    const roleIndex = V3_TEAM_IDS.indexOf(runtimeAgent.agentId)
                                    const agent = team[roleIndex]
                                    const identity = identityForRole(runtimeAgent.agentId)
                                    const agentMoving = runtimeAgent.movingUntil > runtime.timeMs
                                    return (
                                      <motion.div
                                        layout
                                        layoutId={`v4-agent-presence-${runtimeAgent.agentId}`}
                                        key={runtimeAgent.agentId}
                                        className={`v3-agent-presence ${agentMoving ? 'is-travelling' : ''}`}
                                        style={{
                                          '--agent-color': identity.color,
                                          '--presence-order': agentIndex,
                                        }}
                                        initial={reducedMotion ? false : { opacity: 0, scale: .92 }}
                                        animate={{ opacity: 1, scale: agentMoving && !reducedMotion ? 1.025 : 1 }}
                                        exit={{ opacity: 0, scale: .94 }}
                                        transition={reducedMotion
                                          ? { duration: 0 }
                                          : {
                                              layout: { duration: .56 / speed, ease: [0.16, 1, 0.3, 1] },
                                              opacity: { duration: .18 / speed },
                                              scale: { duration: .24 / speed, ease: [0.16, 1, 0.3, 1] },
                                            }}
                                      >
                                        <MousePointer2
                                          className="v3-agent-presence-pointer"
                                          size={18}
                                          aria-hidden="true"
                                        />
                                        <span>
                                          <b>{agent?.name}</b>
                                          <em>{runtimeAgent.stateLabel}</em>
                                        </span>
                                      </motion.div>
                                    )
                                  })}

                                  {overflowAgents > 0 && (
                                    <motion.span
                                      className="v4-agent-overflow"
                                      initial={{ opacity: 0, scale: .9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                    >
                                      +{overflowAgents}
                                    </motion.span>
                                  )}
                                </div>
                              </motion.button>
                            )
                          })}
                        </AnimatePresence>

                        {Array.from({ length: Math.max(0, LANE_VISIBLE_TASK_LIMIT - visibleTasks.length) }, (_, index) => (
                          <div className="v3-empty-task-slot" key={`empty-${lane.id}-${index}`} aria-hidden="true">
                            <span>SLOT {String(index + visibleTasks.length + 1).padStart(2, '0')}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </LayoutGroup>
          </section>

          <aside className="v3-activity-rail" aria-label="团队实时活动">
            <div className="v3-panel-heading">
              <div><span>ACTIVITY FEED</span><b>因果事件流</b></div>
              <em>LIVE · {runtime.activities.length.toString().padStart(2, '0')}</em>
            </div>

            <div className="v3-activity-list v4-activity-list" aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                {runtime.activities.slice(0, 5).map((entry) => {
                  const from = resolveActor(entry.from)
                  const to = resolveActor(entry.to)
                  return (
                    <motion.div
                      layout="position"
                      className={`v3-activity-entry tone-${entry.tone}`}
                      key={entry.id}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      transition={{ duration: reducedMotion ? 0.08 : 0.24 / speed, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <time>{formatV4Time(entry.at)}</time>
                      <div>
                        <div className="v3-activity-route">
                          <b style={{ '--actor-color': from.identity?.color }}>{from.name}</b>
                          <ArrowRight size={11} />
                          <span style={{ '--actor-color': to.identity?.color }}>{to.name}</span>
                        </div>
                        <strong>{entry.action}</strong>
                        <small>{entry.detail}</small>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <PermissionReviewCard
              task={approvalTask}
              taskAgents={approvalTaskAgents}
              team={team}
              agentColor={approvalTaskAgents[0]
                ? identityForRole(approvalTaskAgents[0].agentId).color
                : identityForRole(approvalTask.ownerId).color}
              sessionTime={sessionTime}
              runId={runId}
              reducedMotion={reducedMotion}
            />
          </aside>
        </div>

        <div className="v3-market-strip">
          <section className="v3-market-panel">
            <div className="v3-market-panel-head">
              <div><span>MARKET CONTEXT</span><b>{latestCandle?.close.toFixed(2) ?? '--'}</b></div>
              <div>
                <span>VOL</span><b className="tone-rose">{teamCore.volatility.toFixed(1)}</b>
                <span>LIQ</span><b className="tone-ember">{teamCore.liquidity}</b>
              </div>
            </div>
            <MarketChart candles={candles} paused={paused} />
          </section>

          <section className="v3-team-core">
            <span>TEAM CORE · {sessionTime}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="v4-team-core-copy"
                key={teamCore.phaseSequence}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion
                  ? undefined
                  : {
                      opacity: 0,
                      scaleY: .04,
                      filter: 'brightness(2.4)',
                    }}
                transition={{ duration: reducedMotion ? 0 : .34 / speed, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2
                  aria-label={teamCore.label}
                  data-text={teamCore.label}
                >
                  {teamCore.label}
                </h2>
                <p>{teamCore.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="v3-phase-progress" aria-label={`Team Core 时间节奏 ${teamCore.progressPercent}%`}>
              {Array.from({ length: teamCore.stageCount }, (_, index) => (
                <i key={index} className={index <= teamCore.stageIndex ? 'is-active' : ''} />
              ))}
            </div>
          </section>

          <section className="v3-portfolio-state">
            <div><span>CURRENT POSITION</span><em>{teamCore.phaseLabel}</em></div>
            <b aria-label={`当前仓位 ${livePosition}%`}>
              <span className="v4-position-number">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={livePosition}
                    initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
                    transition={{ duration: reducedMotion ? 0 : .14 / speed, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {livePosition}
                  </motion.span>
                </AnimatePresence>
              </span>
              <small>%</small>
            </b>
            <div className="v3-position-meter"><span style={{ transform: `scaleX(${livePosition / 100})` }} /></div>
            <dl>
              <div><dt>风险预算</dt><dd>{runtime.metrics.risk}%</dd></div>
              <div><dt>团队协同</dt><dd>{runtime.metrics.sync}</dd></div>
              <div><dt>模拟 Alpha</dt><dd className={alpha < 0 ? 'tone-rose' : 'tone-acid'}>{alpha > 0 ? '+' : ''}{alpha.toFixed(1)}%</dd></div>
            </dl>
          </section>
        </div>

        <footer className="v3-runtime-controls">
          <div>
            <button type="button" onClick={togglePaused}>
              {paused ? <CirclePlay size={16} /> : <CirclePause size={16} />}
              {paused ? '继续模拟' : '暂停模拟'}
            </button>
            <button type="button" onClick={cycleSpeed}><FastForward size={16} />{speed}×</button>
            <button type="button" onClick={restartRuntime}><RotateCcw size={15} />重新播放</button>
          </div>
          <div className="v3-runtime-live-state">
            <Activity size={15} />
            <span>
              {paused
                ? '行情、事件队列、Agent 与仓位已冻结'
                : `${sessionTime} · ${teamCore.phaseLabel} · 独立事件队列运行中`}
            </span>
          </div>
          <Action to="/result">结束并复盘</Action>
        </footer>
      </section>
    </div>
  )
}
