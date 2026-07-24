import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CirclePause,
  CirclePlay,
  Download,
  FastForward,
  LoaderCircle,
  MousePointer2,
  RadioTower,
  RotateCcw,
  Target,
  UsersRound,
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
import {
  MEETING_END_MS,
  MEETING_GATHER_MS,
  MEETING_WANDER_MS,
  createMeetingActivities,
  createMeetingAlert,
  createMeetingMinutes,
  createMeetingState,
  getMeetingAgentByRole,
  getMeetingPhase,
  getMeetingRoleTone,
} from '../runtimeMeeting.js'
import '../v3-runtime.css'
import '../v4-runtime-motion.css'
import '../v45-goal-demo.css'

const speeds = [1, 2, 4]
const identityFallback = Object.values(AGENT_IDENTITY)
const LANE_VISIBLE_TASK_LIMIT = 5
const FRAME_COMMIT_MS = 80
const GOAL_REEL_DURATION_MS = 3_000
const GOAL_REEL_STEP_MS = [348, 397, 443, 491]
const GOAL_REVEAL_DELAY_MS = 680
const GOAL_REDEMPTION_MS = 24 * 60 * 60 * 1_000
const createIdleGoalDemo = () => ({
  phase: 'idle',
  startedAt: 0,
  expiresAt: 0,
  targetTaskIds: [],
  winningRowIndex: -1,
})

function pickNextGoalTask(taskIds, currentTaskId) {
  if (!taskIds.length) return ''
  if (taskIds.length === 1) return taskIds[0]
  const currentIndex = Math.max(0, taskIds.indexOf(currentTaskId))
  const offset = 1 + Math.floor(Math.random() * (taskIds.length - 1))
  return taskIds[(currentIndex + offset) % taskIds.length]
}
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

function formatGoalCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1_000))
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
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

function AgentPresence({
  agentId,
  agent,
  identity,
  statusLabel,
  travelling,
  presenting,
  slacking,
  agentIndex,
  reducedMotion,
  speed,
}) {
  return (
    <motion.div
      layout
      layoutId={`v4-agent-presence-${agentId}`}
      className={`v3-agent-presence ${travelling ? 'is-travelling' : ''} ${presenting ? 'is-presenting' : ''} ${slacking ? 'is-slacking' : ''}`}
      style={{
        '--agent-color': identity.color,
        '--presence-order': agentIndex,
      }}
      initial={reducedMotion ? false : { opacity: 0, scale: .92 }}
      animate={{
        opacity: 1,
        scale: presenting && !reducedMotion
          ? 1.08
          : travelling && !reducedMotion
            ? 1.025
            : 1,
      }}
      exit={{ opacity: 0, scale: .94 }}
      transition={reducedMotion
        ? { duration: 0 }
        : {
            layout: { duration: .62, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: .18 / speed },
            scale: { duration: .24, ease: [0.16, 1, 0.3, 1] },
          }}
    >
      <MousePointer2
        className="v3-agent-presence-pointer"
        size={18}
        aria-hidden="true"
      />
      <span>
        <b>{agent?.name}</b>
        <em>{statusLabel}</em>
      </span>
    </motion.div>
  )
}

function GoalEventOverlay({
  phase,
  team,
  remainingMs,
  onClose,
  reducedMotion,
}) {
  const engaged = phase === 'aligning' || phase === 'celebrating'
  const celebrating = phase === 'celebrating'

  return (
    <AnimatePresence>
      {engaged && (
        <motion.section
          className={`v45-goal-overlay is-${phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : .18 }}
          aria-live="assertive"
          aria-label={celebrating ? 'GOAL Pro 会员兑换提示' : '五位 Agent 正在对齐'}
        >
          <div className="v45-goal-scan-field" aria-hidden="true" />

          <div className="v45-goal-agent-line" aria-label="五位 Agent 已在同一排">
            {V3_TEAM_IDS.map((agentId, index) => (
              <AgentPresence
                agentId={agentId}
                agent={team[index]}
                identity={AGENT_IDENTITY[agentId]}
                statusLabel="GOAL"
                travelling={phase === 'aligning'}
                presenting={false}
                slacking={false}
                agentIndex={index}
                reducedMotion={reducedMotion}
                speed={1}
                key={agentId}
              />
            ))}
          </div>

          <AnimatePresence>
            {celebrating && (
              <motion.div
                className="v45-goal-message"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleY: .03 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: .03 }}
                transition={{ duration: reducedMotion ? 0 : .34, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>SYSTEM ALIGNMENT · 5/5</span>
                <h2 data-text="GOAL!">GOAL!</h2>
                <p>快去兑换您的 Pro 会员吧！<b>仅限今天！</b></p>
                <time dateTime={`PT${Math.ceil(remainingMs / 1_000)}S`}>
                  {formatGoalCountdown(remainingMs)}
                </time>
                <small>24H REDEMPTION WINDOW · 精确到秒</small>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="button" className="v45-goal-exit" onClick={onClose}>
            ESC · 退出演示
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function MeetingMinutesCard({ minutes, team, sessionTime }) {
  const speakerIndex = V3_TEAM_IDS.indexOf(minutes.speakerId)
  const recorderIndex = V3_TEAM_IDS.indexOf(minutes.recorderId)
  const speaker = team[speakerIndex]?.name ?? '主汇报 Agent'
  const recorder = team[recorderIndex]?.name ?? '记录 Agent'

  const downloadMinutes = () => {
    const roleLines = V3_TEAM_IDS
      .map((agentId, index) => `- ${team[index]?.name ?? agentId}：${minutes.roles[agentId]}`)
      .join('\n')
    const report = [
      '# QELL Alpha Team 会议纪要',
      '',
      `- 议题：${minutes.targetTitle}`,
      `- 结束时间：${sessionTime}`,
      `- 结束方式：${minutes.reason === 'timeout' ? '自动结束' : '用户结束'}`,
      `- 主汇报：${speaker}`,
      `- 记录人：${recorder}`,
      '',
      '## 角色状态',
      roleLines,
      '',
      '## 结论',
      minutes.conclusion,
      '',
      '## 后续行动',
      minutes.action,
      '',
      `Skill：${minutes.skill}`,
      `Factor：${minutes.factor}`,
    ].join('\n')
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `QELL-会议纪要-${minutes.targetTaskId}.md`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section
      className="v3-task-inspector v4-meeting-minutes"
      aria-labelledby="meeting-minutes-title"
    >
      <div className="v4-minutes-heading">
        <span>ACTIVE TASK · MEETING NOTES</span>
        <em>已归档</em>
      </div>
      <div className="v4-minutes-title">
        <small>{minutes.targetTitle}</small>
        <h3 id="meeting-minutes-title">{minutes.title}</h3>
      </div>
      <dl>
        <div><dt>结论</dt><dd>{minutes.conclusion}</dd></div>
        <div><dt>行动</dt><dd>{minutes.action}</dd></div>
        <div><dt>记录</dt><dd>{speaker} 汇报 · {recorder} 归档</dd></div>
      </dl>
      <button type="button" className="v4-minutes-download" onClick={downloadMinutes}>
        <Download size={12} />
        下载报告
      </button>
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
  const [marketTimeMs, setMarketTimeMs] = useState(0)
  const [runId, setRunId] = useState(1)
  const [focusedAgentId, setFocusedAgentId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [meeting, setMeeting] = useState(null)
  const [meetingElapsedMs, setMeetingElapsedMs] = useState(0)
  const [meetingMinutes, setMeetingMinutes] = useState(null)
  const [slackerRoute, setSlackerRoute] = useState([])
  const [goalDemo, setGoalDemo] = useState(createIdleGoalDemo)
  const [goalClockMs, setGoalClockMs] = useState(() => Date.now())
  const frameRef = useRef(null)
  const lastFrameRef = useRef(null)
  const lastCommitRef = useRef(null)
  const elapsedRef = useRef(0)
  const marketElapsedRef = useRef(0)
  const meetingElapsedRef = useRef(0)
  const operationsGridRef = useRef(null)
  const meetingButtonRef = useRef(null)
  const goalCandidateTaskIdsRef = useRef([])
  const goalLaneTaskIdsRef = useRef([])
  const goalTimersRef = useRef([])
  const goalReelTimersRef = useRef([])

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

  const goalCandidateTaskIds = useMemo(
    () => laneTaskGroups
      .map(({ visibleTasks }) => visibleTasks[0]?.id)
      .filter(Boolean),
    [laneTaskGroups],
  )
  const goalLaneTaskIds = useMemo(
    () => laneTaskGroups.map(({ visibleTasks }) => visibleTasks.map((task) => task.id)),
    [laneTaskGroups],
  )

  useEffect(() => {
    goalCandidateTaskIdsRef.current = goalCandidateTaskIds
    goalLaneTaskIdsRef.current = goalLaneTaskIds
  }, [goalCandidateTaskIds, goalLaneTaskIds])

  const goalSpinning = goalDemo.phase === 'spinning'
  const goalEngaged = goalDemo.phase === 'aligning' || goalDemo.phase === 'celebrating'
  const goalActive = goalDemo.phase !== 'idle'
  const goalRemainingMs = goalDemo.expiresAt
    ? Math.max(0, goalDemo.expiresAt - goalClockMs)
    : GOAL_REDEMPTION_MS
  const goalArmSeconds = goalSpinning
    ? Math.max(1, Math.ceil((goalDemo.startedAt + GOAL_REEL_DURATION_MS - goalClockMs) / 1_000))
    : 0

  const selectedTask = selectedTaskId ? taskById[selectedTaskId] ?? null : null
  const approvalTask = runtimeTasks
    .filter((task) => task.lane === 2)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? runtimeTasks[0]
  const approvalTaskAgents = approvalTask ? getV4TaskAgents(runtime, approvalTask.id) : []
  const activeTaskCount = getV4ActiveTaskCount(runtime)
  const meetingPhase = getMeetingPhase(meeting, meetingElapsedMs)
  const marketOffsetMs = Math.max(0, marketTimeMs - runtime.timeMs)
  const displayedTradeMarkers = useMemo(
    () => meeting
      ? []
      : runtime.tradeMarkers.map((marker) => ({
          ...marker,
          at: marker.at + marketOffsetMs,
        })),
    [marketOffsetMs, meeting, runtime.tradeMarkers],
  )
  const sessionTime = formatV4Time(marketTimeMs)
  const candles = useMemo(
    () => createV4Candles(marketTimeMs, displayedTradeMarkers, 28),
    [displayedTradeMarkers, marketTimeMs],
  )
  const latestCandle = candles.at(-1)
  const paperAssets = getV4PaperAssets(runtime)
  const displayAssets = Math.round(paperAssets / 1_000) * 1_000
  const alpha = getV4Alpha(paperAssets)
  const livePosition = getV4LivePosition(runtime)
  const teamCore = getV4TeamCoreState(runtime.timeMs)
  const equityHistory = useMemo(() => createV4EquityHistory(runtime), [runtime])
  const meetingAlert = createMeetingAlert(meeting, meetingElapsedMs)
  const effectiveAlert = meeting ? meetingAlert : runtime.alert
  const alertActor = effectiveAlert?.actorId === 'TEAM CORE'
    ? { name: 'TEAM CORE' }
    : effectiveAlert?.actorId
      ? seatByRoleId[effectiveAlert.actorId]
      : null
  const alertIdentity = effectiveAlert?.actorId && V3_TEAM_IDS.includes(effectiveAlert.actorId)
    ? identityForRole(effectiveAlert.actorId)
    : null
  const meetingActivities = useMemo(
    () => createMeetingActivities(meeting, meetingElapsedMs),
    [meeting, meetingElapsedMs],
  )
  const activityEntries = meeting ? meetingActivities.slice(0, 5) : runtime.activities.slice(0, 5)
  const meetingSlackerStops = useMemo(() => {
    if (!meeting) return []
    const targetLane = taskById[meeting.targetTaskId]?.lane ?? 0
    const laneOffsets = [1, -1, 2]
    const seed = meeting.id.length + meeting.targetTaskId.length
    return laneOffsets
      .map((offset, index) => {
        const laneIndex = (targetLane + offset + RUNTIME_LANES.length) % RUNTIME_LANES.length
        const candidates = laneTaskGroups[laneIndex].visibleTasks
          .filter((task) => task.id !== meeting.targetTaskId)
        return candidates.length ? candidates[(seed + index * 2) % candidates.length].id : null
      })
      .filter(Boolean)
  }, [laneTaskGroups, meeting, taskById])
  const meetingWandererId = getMeetingAgentByRole(meeting, '摸鱼ing')
  const meetingSlackerElapsed = Math.max(0, meetingElapsedMs - MEETING_GATHER_MS)
  const meetingWandererAtButton = Boolean(
    meeting && meetingSlackerElapsed >= MEETING_WANDER_MS,
  )
  const meetingHighlightedTaskId = meeting && meetingPhase !== 'gathering'
    ? meetingSlackerElapsed < MEETING_WANDER_MS * .34
      ? meetingSlackerStops[0]
      : meetingSlackerElapsed < MEETING_WANDER_MS * .65
        ? meetingSlackerStops[1]
        : meetingSlackerElapsed < MEETING_WANDER_MS * .9
          ? meetingSlackerStops[2]
          : null
    : null
  const meetingSlackerStopKey = meetingSlackerStops.join('|')
  const slackerMotionPath = useMemo(() => ({
    x: slackerRoute.map((point) => point.x),
    y: slackerRoute.map((point) => point.y),
    rotate: [-4, 7, -9, 5, 0],
    opacity: [.72, 1, .82, 1, .86],
  }), [slackerRoute])

  const clearGoalTimers = () => {
    goalTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    goalTimersRef.current = []
    goalReelTimersRef.current.forEach((timerId) => window.clearInterval(timerId))
    goalReelTimersRef.current = []
  }

  const stopGoalDemo = () => {
    clearGoalTimers()
    setGoalDemo(createIdleGoalDemo())
    setGoalClockMs(Date.now())
  }

  const startGoalDemo = () => {
    if (meeting || goalActive) return
    clearGoalTimers()
    const startedAt = Date.now()
    setGoalClockMs(startedAt)
    const initialTaskIds = goalLaneTaskIdsRef.current.map((taskIds) => (
      taskIds[Math.floor(Math.random() * taskIds.length)] ?? ''
    ))
    setGoalDemo({
      phase: 'spinning',
      startedAt,
      expiresAt: 0,
      targetTaskIds: initialTaskIds,
      winningRowIndex: -1,
    })

    goalReelTimersRef.current = goalLaneTaskIdsRef.current.map((_, laneIndex) => (
      window.setInterval(() => {
        setGoalDemo((current) => {
          if (current.phase !== 'spinning') return current
          const laneTaskIds = goalLaneTaskIdsRef.current[laneIndex] ?? []
          const nextTaskIds = [...current.targetTaskIds]
          nextTaskIds[laneIndex] = pickNextGoalTask(
            laneTaskIds,
            current.targetTaskIds[laneIndex],
          )
          return { ...current, targetTaskIds: nextTaskIds }
        })
      }, reducedMotion ? 520 : GOAL_REEL_STEP_MS[laneIndex])
    ))

    const alignTimer = window.setTimeout(() => {
      const alignedAt = Date.now()
      goalReelTimersRef.current.forEach((timerId) => window.clearInterval(timerId))
      goalReelTimersRef.current = []
      setGoalClockMs(alignedAt)
      setGoalDemo((current) => {
        if (current.phase !== 'spinning') return current
        const laneTaskIds = goalLaneTaskIdsRef.current
        const laneRowCounts = laneTaskIds
          .map((taskIds) => taskIds.length)
          .filter((rowCount) => rowCount > 0)
        const sharedRowCount = laneRowCounts.length ? Math.min(...laneRowCounts) : 0
        const winningRowIndex = sharedRowCount > 0
          ? Math.floor(Math.random() * sharedRowCount)
          : 0
        const winningTaskIds = laneTaskIds
          .map((taskIds) => taskIds[winningRowIndex])
          .filter(Boolean)
        return {
          ...current,
          phase: 'aligning',
          expiresAt: alignedAt + GOAL_REDEMPTION_MS,
          targetTaskIds: winningTaskIds.length === RUNTIME_LANES.length
            ? winningTaskIds
            : goalCandidateTaskIdsRef.current.slice(0, RUNTIME_LANES.length),
          winningRowIndex,
        }
      })
    }, GOAL_REEL_DURATION_MS)

    const revealTimer = window.setTimeout(() => {
      setGoalDemo((current) => current.phase === 'aligning'
        ? { ...current, phase: 'celebrating' }
        : current)
    }, GOAL_REEL_DURATION_MS + GOAL_REVEAL_DELAY_MS)

    goalTimersRef.current = [alignTimer, revealTimer]
  }

  const toggleGoalDemo = () => {
    if (goalActive) {
      stopGoalDemo()
      return
    }
    startGoalDemo()
  }

  useEffect(() => {
    if (!goalActive) return undefined
    const tick = () => setGoalClockMs(Date.now())
    tick()
    const intervalId = window.setInterval(tick, 250)
    return () => window.clearInterval(intervalId)
  }, [goalActive])

  useEffect(() => {
    if (!goalActive) return undefined
    const exitOnEscape = (event) => {
      if (event.key === 'Escape') stopGoalDemo()
    }
    window.addEventListener('keydown', exitOnEscape)
    return () => window.removeEventListener('keydown', exitOnEscape)
  }, [goalActive])

  useEffect(() => () => clearGoalTimers(), [])

  useEffect(() => {
    if (!meeting || !operationsGridRef.current || !meetingButtonRef.current) {
      setSlackerRoute((current) => current.length ? [] : current)
      return undefined
    }

    const grid = operationsGridRef.current
    const meetingButton = meetingButtonRef.current
    let frameId = null

    const measureRoute = () => {
      const gridRect = grid.getBoundingClientRect()
      const targetCard = grid.querySelector(`[data-task-id="${meeting.targetTaskId}"]`)
      const stopCards = meetingSlackerStops
        .map((taskId) => grid.querySelector(`[data-task-id="${taskId}"]`))
        .filter(Boolean)
      if (!targetCard || stopCards.length < 3) return

      const targetRect = targetCard.getBoundingClientRect()
      const buttonRect = meetingButton.getBoundingClientRect()
      const stopOffsets = [
        { x: .18, y: .24 },
        { x: .72, y: .7 },
        { x: .34, y: .38 },
      ]
      const route = [
        {
          x: targetRect.left - gridRect.left + targetRect.width * .56,
          y: targetRect.top - gridRect.top + targetRect.height * .5,
        },
        ...stopCards.map((card, index) => {
          const rect = card.getBoundingClientRect()
          return {
            x: rect.left - gridRect.left + rect.width * stopOffsets[index].x,
            y: rect.top - gridRect.top + rect.height * stopOffsets[index].y,
          }
        }),
        {
          x: buttonRect.right - gridRect.left - grid.clientLeft,
          y: buttonRect.top - gridRect.top + buttonRect.height * .5 - 10,
        },
      ]
      setSlackerRoute(route)
    }

    frameId = window.requestAnimationFrame(measureRoute)
    const observer = new ResizeObserver(measureRoute)
    observer.observe(grid)
    observer.observe(meetingButton)
    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [meeting?.id, meetingSlackerStopKey])

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

  const meetingAgentStatus = (roleId) => {
    const runtimeStatus = runtime.agents[roleId]
    if (!meeting) return runtimeStatus
    if (meetingPhase === 'gathering') {
      return {
        ...runtimeStatus,
        stateLabel: '集结中',
        stateTone: 'cyan',
        humor: '前往会议室中',
        detail: `正在前往「${meeting.target.title}」`,
        skill: 'Meeting Route',
      }
    }

    const role = meeting.roles[roleId]
    const detailByRole = {
      正在汇报: `围绕「${meeting.target.title}」汇报 ${meeting.target.skill}`,
      记录中: `整理 ${meeting.target.factor} 与行动项`,
      有异议: `复核 ${meeting.target.factor} 的反向证据`,
      '摸鱼ing': meetingWandererAtButton
        ? '已晃到结束会议按钮右侧'
        : '醉步巡场，路过三张任务卡',
      申请发言: `等待补充 ${meeting.target.deliverable}`,
    }
    return {
      ...runtimeStatus,
      stateLabel: role,
      stateTone: getMeetingRoleTone(role),
      humor: role,
      detail: detailByRole[role],
      skill: role === '正在汇报'
        ? meeting.target.skill
        : role === '记录中'
          ? 'Meeting Notes'
          : role === '有异议'
            ? 'Counter Review'
            : role === '申请发言'
              ? 'Request Queue'
              : 'Ambient Listening',
    }
  }

  const startMeeting = () => {
    if (!selectedTask || meeting || goalActive) return
    setMeeting(createMeetingState(selectedTask, runId, marketTimeMs))
    setMeetingElapsedMs(0)
    meetingElapsedRef.current = 0
    setSlackerRoute([])
    setMeetingMinutes(null)
    setFocusedAgentId('')
  }

  const finishMeeting = (reason = 'manual') => {
    if (!meeting) return
    setMeetingMinutes(createMeetingMinutes(meeting, marketTimeMs, reason))
    setMeeting(null)
    setMeetingElapsedMs(0)
    meetingElapsedRef.current = 0
    setSlackerRoute([])
    setSelectedTaskId('')
    setFocusedAgentId('')
  }

  useEffect(() => {
    const frame = (now) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = now
        lastCommitRef.current = now
      }

      const rawDelta = Math.min(120, Math.max(0, now - lastFrameRef.current))
      lastFrameRef.current = now

      if (meeting) {
        marketElapsedRef.current += rawDelta * speed
        meetingElapsedRef.current += rawDelta
        if (now - lastCommitRef.current >= FRAME_COMMIT_MS) {
          const marketElapsed = marketElapsedRef.current
          const meetingElapsed = meetingElapsedRef.current
          marketElapsedRef.current = 0
          meetingElapsedRef.current = 0
          lastCommitRef.current = now
          setMarketTimeMs((current) => current + marketElapsed)
          setMeetingElapsedMs((current) => current + meetingElapsed)
        }
      } else if (!paused && !goalActive) {
        elapsedRef.current += rawDelta * speed
        marketElapsedRef.current += rawDelta * speed
        if (now - lastCommitRef.current >= FRAME_COMMIT_MS) {
          const elapsed = elapsedRef.current
          const marketElapsed = marketElapsedRef.current
          elapsedRef.current = 0
          marketElapsedRef.current = 0
          lastCommitRef.current = now
          setRuntime((current) => advanceV4Runtime(current, elapsed))
          setMarketTimeMs((current) => current + marketElapsed)
        }
      } else {
        elapsedRef.current = 0
        marketElapsedRef.current = 0
        meetingElapsedRef.current = 0
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
      marketElapsedRef.current = 0
      meetingElapsedRef.current = 0
    }
  }, [goalActive, meeting, paused, speed])

  useEffect(() => {
    if (!meeting || meetingElapsedMs < MEETING_END_MS) return
    finishMeeting('timeout')
  }, [meeting, meetingElapsedMs])

  const togglePaused = () => {
    if (meeting || goalActive) return
    setPaused((current) => !current)
  }

  const cycleSpeed = () => {
    if (goalActive) return
    const currentIndex = speeds.indexOf(speed)
    setSpeed(speeds[(currentIndex + 1) % speeds.length])
  }

  const restartRuntime = () => {
    clearGoalTimers()
    setGoalDemo(createIdleGoalDemo())
    setGoalClockMs(Date.now())
    setRuntime(createV4RuntimeState())
    setMarketTimeMs(0)
    setRunId((current) => current + 1)
    setFocusedAgentId('')
    setSelectedTaskId('')
    setMeeting(null)
    setMeetingElapsedMs(0)
    setSlackerRoute([])
    setMeetingMinutes(null)
    setPaused(false)
  }

  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.52 / speed, ease: [0.16, 1, 0.3, 1] }

  return (
    <div
      className={`page v3-runtime-page v4-runtime-page ${paused ? 'is-paused' : 'is-running'} ${meeting ? 'is-meeting' : ''} ${reducedMotion ? 'is-reduced-motion' : ''} ${goalActive ? `v45-goal-active v45-goal-${goalDemo.phase}` : ''} ${goalEngaged ? 'v45-goal-engaged' : ''}`}
      data-runtime-version="v4"
      data-alert={effectiveAlert?.status ?? 'none'}
      data-meeting-phase={meetingPhase}
      data-goal-phase={goalDemo.phase}
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
            <span>{goalEngaged
              ? 'GOAL EVENT'
              : goalSpinning
                ? `GOAL REEL · ${goalArmSeconds}s`
                : meeting
                  ? 'MEETING'
                  : paused
                    ? 'PAUSED'
                    : `${speed}× RUNNING`}</span>
            <b>{sessionTime}</b>
            <small>{meeting ? `${meetingPhase.toUpperCase()} · ` : ''}SYNC {runtime.metrics.sync}</small>
          </div>
        </header>

        <RuntimeAlert
          alert={effectiveAlert}
          actor={alertActor}
          identity={alertIdentity}
          reducedMotion={reducedMotion}
        />

        <LayoutGroup id={`v4-runtime-board-${runId}`}>
        <div className="v3-operations-grid" ref={operationsGridRef}>
          <AnimatePresence initial={false}>
            {meeting
              && meetingPhase !== 'gathering'
              && meetingWandererId
              && slackerRoute.length === 5
              && (() => {
                const roleIndex = V3_TEAM_IDS.indexOf(meetingWandererId)
                const finalPoint = slackerRoute.at(-1)
                return (
                  <motion.div
                    className={`v4-floating-slacker ${meetingWandererAtButton ? 'has-arrived' : 'is-roaming'}`}
                    key={`floating-slacker-${meeting.id}`}
                    initial={reducedMotion
                      ? { opacity: 1, x: finalPoint.x, y: finalPoint.y }
                      : {
                          opacity: 0,
                          x: slackerRoute[0].x,
                          y: slackerRoute[0].y,
                          rotate: -4,
                        }}
                    animate={reducedMotion
                      ? { opacity: 1, x: finalPoint.x, y: finalPoint.y, rotate: 0 }
                      : slackerMotionPath}
                    exit={{ opacity: 0, scale: .96 }}
                    transition={reducedMotion
                      ? { duration: 0 }
                      : {
                          duration: MEETING_WANDER_MS / 1_000,
                          times: [0, .22, .53, .78, 1],
                          ease: [.45, .02, .28, 1],
                        }}
                  >
                    <AgentPresence
                      agentId={meetingWandererId}
                      agent={team[roleIndex]}
                      identity={identityForRole(meetingWandererId)}
                      statusLabel="摸鱼ing"
                      travelling={!meetingWandererAtButton}
                      presenting={false}
                      slacking
                      agentIndex={roleIndex}
                      reducedMotion={reducedMotion}
                      speed={speed}
                    />
                  </motion.div>
                )
              })()}
          </AnimatePresence>

          <aside className="v3-agent-roster" aria-label="Alpha Team 成员状态">
            <div className="v3-panel-heading">
              <div className="v4-roster-heading-main">
                <span>ALPHA TEAM</span>
                <div className="v4-roster-heading-row">
                  <b>五人编制</b>
                  <div className="v4-meeting-room-control">
                    <button
                      ref={meetingButtonRef}
                      type="button"
                      className={`v4-meeting-room-button ${meeting ? 'is-active' : ''}`}
                      onClick={meeting ? () => finishMeeting('manual') : startMeeting}
                      disabled={!meeting && (!selectedTask || goalActive)}
                      aria-pressed={Boolean(meeting)}
                      title={!meeting && goalActive
                        ? '请先退出 GOAL 演示'
                        : !meeting && !selectedTask
                          ? '请先选择一张任务卡片'
                          : undefined}
                    >
                      <UsersRound size={11} />
                      {meeting ? '结束会议' : '召集会议'}
                    </button>
                    <button
                      type="button"
                      className={`v45-goal-button ${goalActive ? 'is-active' : ''}`}
                      onClick={toggleGoalDemo}
                      disabled={Boolean(meeting)}
                      aria-pressed={goalActive}
                      title={meeting
                        ? '会议期间不可启动 GOAL 演示'
                        : goalActive
                          ? '退出 GOAL 演示'
                          : '启动 3 秒 GOAL 抽取演示'}
                    >
                      <Target size={9} aria-hidden="true" />
                      {goalSpinning ? `GOAL ${goalArmSeconds}` : goalEngaged ? 'GOAL ×' : 'GOAL'}
                    </button>
                  </div>
                </div>
              </div>
              <em>{goalEngaged
                ? '5/5 GOAL'
                : goalSpinning
                  ? '4/4 ROLLING'
                  : meeting
                    ? '5/5 MEETING'
                    : `${Object.values(runtime.agents).filter((agent) => agent.taskId).length}/5 ACTIVE`}</em>
            </div>

            <div className="v3-agent-list">
              {V3_TEAM_IDS.map((roleId, index) => {
                const agent = team[index]
                const identity = identityForRole(roleId)
                const status = meetingAgentStatus(roleId)
                const focused = focusedAgentId === roleId
                return (
                  <button
                    type="button"
                    className={`v3-agent-card ${focused ? 'is-focused' : ''} ${meeting ? 'is-in-meeting' : ''}`}
                    style={{ '--agent-color': identity.color }}
                    key={roleId}
                    onClick={() => setFocusedAgentId((current) => current === roleId ? '' : roleId)}
                    aria-pressed={focused}
                    disabled={Boolean(meeting || goalActive)}
                    data-state-tone={status.stateTone}
                    data-meeting-role={meeting?.roles[roleId] ?? undefined}
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
                <span>{meeting ? 'MEETING FLOW' : paused ? 'HOLD' : 'ASYNC FLOW'}</span>
              </div>
            </div>

            <div className="v3-lanes">
                {RUNTIME_LANES.map((lane, laneIndex) => {
                  const { tasks: laneTasks, hiddenTaskCount, visibleTasks } = laneTaskGroups[laneIndex]
                  const isMeetingLane = visibleTasks.some(
                    (task) => task.id === meeting?.targetTaskId,
                  )
                  return (
                    <section
                      className={`v3-lane ${isMeetingLane ? `is-meeting-lane is-lane-${laneIndex}` : ''}`}
                      key={lane.id}
                      aria-labelledby={`lane-${lane.id}`}
                      style={{ '--goal-lane-index': laneIndex }}
                    >
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
                            const runtimeTaskAgents = getV4TaskAgents(runtime, task.id)
                            let displayedTaskAgents = runtimeTaskAgents
                            if (meeting) {
                              let meetingAgentIds = []
                              if (task.id === meeting.targetTaskId) {
                                meetingAgentIds = V3_TEAM_IDS.filter((agentId) => (
                                  agentId !== meetingWandererId
                                  || meetingPhase === 'gathering'
                                ))
                              }
                              displayedTaskAgents = meetingAgentIds.map((agentId) => ({
                                ...runtime.agents[agentId],
                                agentId,
                                stateLabel: meetingPhase === 'gathering'
                                  ? '集结中'
                                  : meeting.roles[agentId],
                              }))
                            }
                            const isGoalSpin = goalSpinning && goalDemo.targetTaskIds.includes(task.id)
                            const isGoalTarget = goalEngaged && goalDemo.targetTaskIds.includes(task.id)
                            const visibleAgents = goalEngaged
                              ? []
                              : meeting
                                ? displayedTaskAgents
                                : displayedTaskAgents.slice(0, 2)
                            const overflowAgents = goalEngaged
                              ? 0
                              : Math.max(0, displayedTaskAgents.length - visibleAgents.length)
                            const ownerRoleIndex = V3_TEAM_IDS.indexOf(task.ownerId)
                            const domainIdentity = identityForRole(task.ownerId)
                            const visualIdentity = displayedTaskAgents.length
                              ? identityForRole(displayedTaskAgents[0].agentId)
                              : domainIdentity
                            const hasActiveAgent = displayedTaskAgents.length > 0
                            const isMeetingTarget = meeting?.targetTaskId === task.id
                            const isSlackerPass = meetingHighlightedTaskId === task.id
                            const isSelected = selectedTaskId === task.id
                            const dimmed = meeting
                              ? !isMeetingTarget && !isSlackerPass
                              : focusedAgentId
                                && !runtimeTaskAgents.some((item) => item.agentId === focusedAgentId)
                            const isMoving = !meeting && !goalActive && task.movingUntil > runtime.timeMs
                            const cardOpacity = meeting
                              ? isMeetingTarget
                                ? 1
                                : isSlackerPass
                                  ? .82
                                  : .32
                              : dimmed
                                ? .2
                                : hasActiveAgent
                                  ? 1
                                  : .5
                            const cardFilter = meeting && isMeetingTarget
                              ? 'brightness(1.04) saturate(1)'
                              : dimmed
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
                                data-task-id={task.id}
                                className={`v3-task-card ${visibleIndex === 0 ? 'is-lane-lead' : ''} ${hasActiveAgent ? 'has-active-agent' : 'is-unassigned'} ${isSelected ? 'is-selected' : ''} ${isMeetingTarget ? 'is-meeting-target' : ''} ${isSlackerPass ? 'is-slacker-pass' : ''} ${dimmed ? 'is-dimmed' : ''} ${isMoving ? 'is-moving' : ''} ${isGoalSpin ? 'is-goal-spin' : ''} ${isGoalTarget ? 'is-goal-target' : ''}`}
                                style={{
                                  '--agent-color': visualIdentity.color,
                                  '--domain-color': domainIdentity.color,
                                  '--agent-tint': `${visualIdentity.color}12`,
                                  '--goal-order': laneIndex,
                                  '--slacker-color': meetingWandererId
                                    ? identityForRole(meetingWandererId).color
                                    : 'var(--ember)',
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
                                disabled={Boolean(meeting || goalActive)}
                                aria-pressed={isSelected}
                                onClick={() => {
                                  if (meeting || goalActive) return
                                  const nextTaskId = selectedTaskId === task.id ? '' : task.id
                                  setSelectedTaskId(nextTaskId)
                                  setFocusedAgentId(nextTaskId ? runtimeTaskAgents[0]?.agentId ?? '' : '')
                                }}
                              >
                                <div className="v3-task-owner">
                                  <span><i />{identityFallback[ownerRoleIndex]?.shortRole ?? domainIdentity.shortRole}任务</span>
                                  <em className={isGoalSpin || isGoalTarget ? 'tone-acid' : `tone-${taskTone(task.state)}`}>
                                    {isGoalTarget ? 'GOAL LOCK' : isGoalSpin ? 'ROLL' : task.state}
                                  </em>
                                </div>
                                <h3>{task.title}</h3>
                                <p>{task.skill}</p>
                                <small>{task.factor}</small>
                                {task.lane === 1 && (
                                  <div className="v3-task-progress" aria-label={`任务进度 ${task.progress}%`}>
                                    <span style={{ transform: `scaleX(${task.progress / 100})` }} />
                                  </div>
                                )}
                                <div className="v3-task-card-footer">
                                  <span>{isSelected ? '已选为会议议题' : task.deliverable}</span>
                                  {isSelected ? <Check size={12} /> : <ArrowRight size={13} />}
                                </div>

                                <div
                                  className={`v4-agent-presence-dock has-${Math.min(5, displayedTaskAgents.length)} ${isMeetingTarget ? 'is-meeting-target' : ''}`}
                                  aria-label={displayedTaskAgents.length
                                    ? `${displayedTaskAgents.length} 位 Agent 正在处理此任务`
                                    : '当前没有 Agent 处理此任务'}
                                >
                                  {visibleAgents.map((runtimeAgent, agentIndex) => {
                                    const roleIndex = V3_TEAM_IDS.indexOf(runtimeAgent.agentId)
                                    const agent = team[roleIndex]
                                    const identity = identityForRole(runtimeAgent.agentId)
                                    const meetingRole = meeting?.roles[runtimeAgent.agentId]
                                    const agentMoving = meeting
                                      ? meetingPhase === 'gathering'
                                      : runtimeAgent.movingUntil > runtime.timeMs
                                    return (
                                      <AgentPresence
                                        key={runtimeAgent.agentId}
                                        agentId={runtimeAgent.agentId}
                                        agent={agent}
                                        identity={identity}
                                        statusLabel={runtimeAgent.stateLabel}
                                        travelling={agentMoving}
                                        presenting={Boolean(
                                          meeting
                                          && meetingPhase !== 'gathering'
                                          && meetingRole === '正在汇报',
                                        )}
                                        slacking={Boolean(
                                          meetingPhase !== 'gathering' && meetingRole === '摸鱼ing',
                                        )}
                                        agentIndex={agentIndex}
                                        reducedMotion={reducedMotion}
                                        speed={speed}
                                      />
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
          </section>

          <aside className="v3-activity-rail" aria-label="团队实时活动">
            <div className="v3-panel-heading">
              <div>
                <span>ACTIVITY FEED</span>
                <b>{meeting ? '会议协作流' : '因果事件流'}</b>
              </div>
              <em>LIVE · {(meeting ? meetingActivities.length : runtime.activities.length).toString().padStart(2, '0')}</em>
            </div>

            <div className="v3-activity-list v4-activity-list" aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                {activityEntries.map((entry) => {
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
                      <time>{formatV4Time(entry.at + (meeting ? 0 : marketOffsetMs))}</time>
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

            {meetingMinutes ? (
              <MeetingMinutesCard
                minutes={meetingMinutes}
                team={team}
                sessionTime={sessionTime}
              />
            ) : (
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
            )}
          </aside>
        </div>
        <GoalEventOverlay
          phase={goalDemo.phase}
          team={team}
          remainingMs={goalRemainingMs}
          onClose={stopGoalDemo}
          reducedMotion={reducedMotion}
        />
        </LayoutGroup>

        <div className="v3-market-strip">
          <section className="v3-market-panel">
            <div className="v3-market-panel-head">
              <div><span>MARKET CONTEXT</span><b>{latestCandle?.close.toFixed(2) ?? '--'}</b></div>
              <div>
                <span>VOL</span><b className="tone-rose">{teamCore.volatility.toFixed(1)}</b>
                <span>LIQ</span><b className="tone-ember">{teamCore.liquidity}</b>
              </div>
            </div>
            <MarketChart candles={candles} paused={paused && !meeting} />
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
            <button type="button" onClick={togglePaused} disabled={Boolean(meeting || goalActive)}>
              {paused && !meeting ? <CirclePlay size={16} /> : <CirclePause size={16} />}
              {goalActive ? 'GOAL 演示中' : meeting ? '会议进行中' : paused ? '继续模拟' : '暂停模拟'}
            </button>
            <button type="button" onClick={cycleSpeed} disabled={goalActive}><FastForward size={16} />{speed}×</button>
            <button type="button" onClick={restartRuntime} disabled={Boolean(meeting || goalActive)}>
              <RotateCcw size={15} />重新播放
            </button>
          </div>
          <div className="v3-runtime-live-state">
            <Activity size={15} />
            <span>
              {meeting
                ? `${sessionTime} · 交易任务与仓位冻结 · 行情持续运行`
                : paused
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
