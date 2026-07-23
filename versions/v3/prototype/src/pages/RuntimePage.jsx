import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CirclePause,
  CirclePlay,
  FastForward,
  RadioTower,
  RotateCcw,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { agentOrganizationLine, agents, events } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action } from '../components/UI.jsx'
import { MarketChart } from '../components/Charts.jsx'
import {
  AGENT_IDENTITY,
  RUNTIME_LANES,
  V3_RUNTIME_STAGE_TICKS,
  V3_TEAM_IDS,
  createV3Candles,
  formatV3Time,
  getV3AgentAttention,
  getV3Position,
  getV3RuntimeSnapshot,
} from '../runtimeV3Mock.js'
import '../v3-runtime.css'

const speeds = [1, 2, 4]
const identityFallback = Object.values(AGENT_IDENTITY)
const LANE_VISIBLE_TASK_LIMIT = 5
const paperAssetFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

function paperEquityAt(tick) {
  const snapshot = getV3RuntimeSnapshot(Math.max(0, tick))
  const base = 3_200_000
  const phaseContribution = base * (snapshot.phase.alpha / 100)
  const intraphaseDrift = snapshot.phaseTick * 3_800
  const marketNoise = Math.sin(tick * .74) * 6_200 + Math.cos(tick * .31) * 3_100
  return Math.round(base + phaseContribution + intraphaseDrift + marketNoise)
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
      aria-label="最近十八个运行刻的模拟净值变化"
      preserveAspectRatio="none"
    >
      <title>最近十八个运行刻的模拟净值变化</title>
      <path d="M0 24H100" />
      <polyline points={points} />
      <circle cx={latestPoint[0]} cy={latestPoint[1]} r="2.1" />
    </svg>
  )
}

function taskTone(state) {
  if (state === '待复核' || state === '执行中') return 'ember'
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

export function RuntimePage() {
  const demo = useDemo()
  const reducedMotion = useReducedMotion()
  const event = events.find((item) => item.id === demo.selectedEventId) ?? events[2]
  const team = useMemo(() => uniqueTeam(demo.selectedAgentIds), [demo.selectedAgentIds])
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [tick, setTick] = useState(14)
  const [focusedAgentId, setFocusedAgentId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('tape-confirmation')
  const runtimeTimerRef = useRef(null)

  const snapshot = getV3RuntimeSnapshot(tick)
  const { phase, phaseIndex, phaseTick } = snapshot
  const sessionTime = formatV3Time(tick)
  const candles = useMemo(() => createV3Candles(tick, 28), [tick])
  const position = getV3Position(tick, phase)
  const latestCandle = candles.at(-1)
  const paperAssets = useMemo(() => paperEquityAt(tick), [tick])
  const equityHistory = useMemo(
    () => Array.from({ length: 18 }, (_, index) => paperEquityAt(tick - 17 + index)),
    [tick],
  )

  const seatByRoleId = useMemo(
    () => Object.fromEntries(V3_TEAM_IDS.map((roleId, index) => [roleId, team[index]])),
    [team],
  )

  const runtimeTasks = useMemo(() => snapshot.tasks.map((task) => ({
    ...task,
    owner: seatByRoleId[task.ownerId] ?? team[0],
  })), [snapshot.tasks, seatByRoleId, team])
  const laneTaskGroups = useMemo(() => RUNTIME_LANES.map((_, laneIndex) => {
    const tasks = runtimeTasks.filter((task) => task.lane === laneIndex)
    const hiddenTaskCount = Math.max(0, tasks.length - LANE_VISIBLE_TASK_LIMIT)
    return {
      tasks,
      hiddenTaskCount,
      visibleTasks: tasks.slice(hiddenTaskCount),
    }
  }), [runtimeTasks])
  const agentAttention = useMemo(
    () => getV3AgentAttention(tick, laneTaskGroups.flatMap((lane) => lane.visibleTasks)),
    [tick, laneTaskGroups],
  )
  const attentionByTask = useMemo(() => agentAttention.reduce((tasks, attention) => {
    const identityIndex = V3_TEAM_IDS.indexOf(attention.agentId)
    const agent = seatByRoleId[attention.agentId] ?? team[identityIndex]
    const identity = AGENT_IDENTITY[agent?.id] ?? identityFallback[identityIndex]
    tasks[attention.taskId] = [
      ...(tasks[attention.taskId] ?? []),
      { ...attention, agent, identity },
    ]
    return tasks
  }, {}), [agentAttention, seatByRoleId, team])

  const selectedTask = runtimeTasks.find((task) => task.id === selectedTaskId) ?? runtimeTasks[0]
  const visibleActivityCount = Math.min(phase.activity.length, 1 + phaseTick)
  const visibleActivity = phase.activity.slice(0, visibleActivityCount)
  const activeTaskCount = runtimeTasks.filter((task) => task.lane === 1 || task.lane === 2).length
  const selectedAttention = attentionByTask[selectedTask.id]?.[0]

  const resolveActor = (actor) => {
    if (actor === 'TEAM CORE') return { name: 'TEAM CORE', identity: null }
    if (actor === 'ALL') return { name: '全体成员', identity: null }
    const roleIndex = V3_TEAM_IDS.indexOf(actor)
    const agent = roleIndex >= 0 ? team[roleIndex] : null
    return {
      name: agent?.name ?? actor,
      identity: agent ? (AGENT_IDENTITY[agent.id] ?? identityFallback[roleIndex]) : null,
    }
  }

  useEffect(() => {
    if (paused) {
      runtimeTimerRef.current = null
      return undefined
    }
    runtimeTimerRef.current = window.setInterval(() => setTick((current) => current + speed), 900)
    return () => {
      window.clearInterval(runtimeTimerRef.current)
      runtimeTimerRef.current = null
    }
  }, [paused, speed])

  const togglePaused = () => {
    if (!paused && runtimeTimerRef.current) {
      window.clearInterval(runtimeTimerRef.current)
      runtimeTimerRef.current = null
    }
    setPaused((current) => !current)
  }

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed)
    setSpeed(speeds[(currentIndex + 1) % speeds.length])
  }

  const motionTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.16, 1, 0.3, 1] }

  return (
    <div className="page v3-runtime-page" data-phase={phase.id}>
      <section className="v3-runtime-shell" aria-label="历史副本实时模拟控制台">
        <header className="v3-runtime-topbar">
          <div className="v3-scenario-title">
            <span>HISTORICAL RUNTIME · {String(phaseIndex + 1).padStart(2, '0')}</span>
            <div><b>{event.year}</b><h1>{event.name}</h1></div>
            <small>{phase.label} · PAPER REPLAY</small>
          </div>

          <div className="v3-runtime-kpis" aria-label="模拟关键指标">
            <div><span>ACTIVE TASKS</span><b>{activeTaskCount}<small>/ {runtimeTasks.length}</small></b><em>实时任务</em></div>
            <div><span>AVG CYCLE</span><b>{phase.averageCycle}</b><em>平均处理时间</em></div>
            <div className="v3-kpi-assets"><span>PAPER ASSETS</span><b>{paperAssetFormatter.format(paperAssets)}</b><em>模拟账户净值</em></div>
            <div className="v3-kpi-alpha">
              <span>PAPER ALPHA</span>
              <div className="v3-kpi-curve-row">
                <b className={phase.alpha < 0 ? 'tone-rose' : 'tone-acid'}>{phase.alpha > 0 ? '+' : ''}{phase.alpha.toFixed(1)}%</b>
                <AlphaSparkline values={equityHistory} negative={phase.alpha < 0} />
              </div>
              <em>近 18 个运行刻</em>
            </div>
            <div><span>RISK BUDGET</span><b>{phase.risk}%</b><em>可用风险预算</em></div>
          </div>

          <div className="v3-runtime-clock">
            <span>{paused ? 'PAUSED' : `${speed}× RUNNING`}</span>
            <b>{sessionTime}</b>
            <small>SYNC {phase.sync}</small>
          </div>
        </header>

        <div className="v3-operations-grid">
          <aside className="v3-agent-roster" aria-label="Alpha Team 成员状态">
            <div className="v3-panel-heading">
              <div><span>ALPHA TEAM</span><b>五人编制</b></div>
              <em>5 / 5 LIVE</em>
            </div>

            <div className="v3-agent-list">
              {team.map((agent, index) => {
                const roleId = V3_TEAM_IDS[index]
                const identity = AGENT_IDENTITY[agent.id] ?? identityFallback[index]
                const status = phase.agents[roleId] ?? phase.agents[V3_TEAM_IDS[index]]
                const active = focusedAgentId === agent.id
                return (
                  <button
                    key={agent.id}
                    type="button"
                    className={`v3-agent-card ${active ? 'is-focused' : ''}`}
                    style={{ '--agent-color': identity.color, '--agent-tint': `${identity.color}14` }}
                    onClick={() => setFocusedAgentId((current) => current === agent.id ? '' : agent.id)}
                    aria-pressed={active}
                  >
                    <div className="v3-agent-card-head">
                      <i aria-hidden="true" />
                      <div><strong>{agent.name}</strong><span>{identity.shortRole}</span></div>
                    </div>
                    <p>{status?.[0]}</p>
                    <small>{status?.[1]}</small>
                    <div className="v3-agent-meta"><span>{agentOrganizationLine(agent)}</span><em>{status?.[2]}</em></div>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="v3-task-board">
            <div className="v3-panel-heading v3-board-heading">
              <div>
                <span>TEAM WORKFLOW</span>
                <b>{phase.decision}</b>
              </div>
              <div className="v3-stream-indicator"><RadioTower size={14} /><span>{paused ? 'HOLD' : 'LIVE FLOW'}</span></div>
            </div>

            <LayoutGroup id="runtime-board">
              <div className="v3-lanes">
                {RUNTIME_LANES.map((lane, laneIndex) => {
                  const { tasks: laneTasks, hiddenTaskCount, visibleTasks: visibleLaneTasks } = laneTaskGroups[laneIndex]
                  return (
                    <section className="v3-lane" key={lane.id} aria-labelledby={`lane-${lane.id}`}>
                      <header>
                        <div><span>{lane.index}</span><h2 id={`lane-${lane.id}`}>{lane.label}</h2></div>
                        <em title={hiddenTaskCount ? `${hiddenTaskCount} 个较早任务已收束` : undefined}>
                          {laneTasks.length.toString().padStart(2, '0')} TASKS
                        </em>
                        <small>{lane.meta}</small>
                      </header>
                      <div className="v3-lane-stack" data-overflow-count={hiddenTaskCount}>
                        <AnimatePresence initial={false} mode="popLayout">
                          {visibleLaneTasks.map((task, visibleIndex) => {
                            const laneLead = visibleIndex === 0
                            const taskAttention = attentionByTask[task.id] ?? []
                            const activeAttention = taskAttention[0]
                            const identity = AGENT_IDENTITY[task.owner?.id] ?? identityFallback[V3_TEAM_IDS.indexOf(task.ownerId)]
                            const visualIdentity = activeAttention?.identity ?? identity
                            const hasActiveAgent = taskAttention.length > 0
                            const dimmed = focusedAgentId && !taskAttention.some((attention) => attention.agent?.id === focusedAgentId)
                            const cardOpacity = dimmed ? .2 : hasActiveAgent ? 1 : .52
                            const cardFilter = dimmed
                              ? 'brightness(.62) saturate(.18)'
                              : hasActiveAgent
                                ? 'brightness(1) saturate(1)'
                                : 'brightness(.76) saturate(.32)'
                            return (
                              <motion.button
                                layout
                                layoutId={`task-${task.id}`}
                                key={task.id}
                                type="button"
                                className={`v3-task-card ${laneLead ? 'is-lane-lead' : ''} ${hasActiveAgent ? 'has-active-agent' : 'is-unassigned'} ${selectedTaskId === task.id ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''}`}
                                style={{
                                  '--agent-color': visualIdentity.color,
                                  '--domain-color': identity.color,
                                  '--agent-tint': `${visualIdentity.color}12`,
                                }}
                                transition={motionTransition}
                                initial={reducedMotion || !laneLead ? false : { opacity: 0, scaleY: 0.035, filter: 'brightness(2.8)' }}
                                animate={{ opacity: cardOpacity, scaleY: 1, filter: cardFilter }}
                                exit={reducedMotion
                                  ? { opacity: 0 }
                                  : {
                                      opacity: [1, 1, 0],
                                      scaleY: [1, 0.025, 0],
                                      filter: ['brightness(1)', 'brightness(2.8)', 'brightness(4)'],
                                      transition: {
                                        duration: 0.42,
                                        delay: visibleIndex * 0.07,
                                        ease: [0.4, 0, 0.2, 1],
                                        times: [0, 0.72, 1],
                                      },
                                    }}
                                onClick={() => {
                                  setSelectedTaskId(task.id)
                                  setFocusedAgentId(activeAttention?.agent?.id ?? '')
                                }}
                              >
                                <div className="v3-task-owner">
                                  <span><i />{identity.shortRole}任务</span>
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
                                <div className="v3-agent-presence-rail" aria-hidden="true">
                                  {taskAttention.map((attention, attentionIndex) => (
                                    <motion.div
                                      layout
                                      layoutId={`agent-presence-${attention.agentId}`}
                                      key={attention.agentId}
                                      className="v3-agent-presence"
                                      style={{
                                        '--agent-color': attention.identity.color,
                                        '--presence-order': attentionIndex,
                                        marginRight: `${attention.anchor * 10}px`,
                                      }}
                                      initial={reducedMotion ? false : { opacity: 0, scale: .92 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={reducedMotion
                                        ? { duration: 0 }
                                        : {
                                            layout: { duration: .46, ease: [0.16, 1, 0.3, 1] },
                                            opacity: { duration: .18 },
                                            scale: { duration: .24, ease: [0.16, 1, 0.3, 1] },
                                          }}
                                    >
                                      <i />
                                      <span>
                                        <b>{attention.agent?.name}</b>
                                        <em>{attention.state}</em>
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.button>
                            )
                          })}
                        </AnimatePresence>
                        {Array.from({ length: Math.max(0, LANE_VISIBLE_TASK_LIMIT - visibleLaneTasks.length) }, (_, index) => (
                          <div className="v3-empty-task-slot" key={`empty-${lane.id}-${index}`} aria-hidden="true">
                            <span>SLOT {String(index + visibleLaneTasks.length + 1).padStart(2, '0')}</span>
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
              <div><span>ACTIVITY FEED</span><b>协作事件</b></div>
              <em>{visibleActivityCount}/5 LIVE</em>
            </div>

            <div className="v3-activity-list" aria-live="polite">
              {phase.activity.map((entry, index) => {
                const visible = Boolean(visibleActivity[index])
                const from = visible ? resolveActor(entry[0]) : null
                const to = visible ? resolveActor(entry[1]) : null
                return (
                  <div className={`v3-activity-entry ${visible ? 'is-visible' : 'is-pending'}`} key={`${phase.id}-${index}`}>
                    <time>{visible ? formatV3Time(tick - visibleActivityCount + index + 1) : '--:--'}</time>
                    {visible ? (
                      <div>
                        <div className="v3-activity-route">
                          <b style={{ '--actor-color': from.identity?.color }}>{from.name}</b>
                          <ArrowRight size={11} />
                          <span style={{ '--actor-color': to.identity?.color }}>{to.name}</span>
                        </div>
                        <strong>{entry[2]}</strong>
                        <small>{entry[3]}</small>
                      </div>
                    ) : (
                      <div><strong>等待下一条协作消息</strong><small>事件槽位已预留</small></div>
                    )}
                  </div>
                )
              })}
            </div>

            <div
              className="v3-task-inspector"
              style={{ '--agent-color': selectedAttention?.identity.color ?? (AGENT_IDENTITY[selectedTask.owner?.id] ?? identityFallback[0]).color }}
            >
              <span>ACTIVE TASK</span>
              <div><b>{selectedAttention?.agent?.name ?? '待分配'}</b><em>{selectedAttention?.state ?? selectedTask.state}</em></div>
              <h3>{selectedTask.title}</h3>
              <dl>
                <div><dt>Skill</dt><dd>{selectedTask.skill}</dd></div>
                <div><dt>因子</dt><dd>{selectedTask.factor}</dd></div>
                <div><dt>交付</dt><dd>{selectedTask.deliverable}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        <div className="v3-market-strip">
          <section className="v3-market-panel">
            <div className="v3-market-panel-head">
              <div><span>MARKET CONTEXT</span><b>{latestCandle?.close.toFixed(2) ?? '--'}</b></div>
              <div><span>VOL</span><b className="tone-rose">{phase.volatility.toFixed(1)}</b><span>LIQ</span><b className="tone-ember">{phase.liquidity}</b></div>
            </div>
            <MarketChart candles={candles} paused={paused} />
          </section>

          <section className="v3-team-core">
            <span>TEAM CORE · {sessionTime}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phase.id}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={motionTransition}
              >
                <h2>{phase.decision}</h2>
                <p>{phase.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="v3-phase-progress">
              {Array.from({ length: V3_RUNTIME_STAGE_TICKS }, (_, index) => (
                <i key={index} className={index <= phaseTick ? 'is-active' : ''} />
              ))}
            </div>
          </section>

          <section className="v3-portfolio-state">
            <div><span>CURRENT POSITION</span><em>{phase.label}</em></div>
            <b>{position}<small>%</small></b>
            <div className="v3-position-meter"><span style={{ transform: `scaleX(${position / 100})` }} /></div>
            <dl>
              <div><dt>风险预算</dt><dd>{phase.risk}%</dd></div>
              <div><dt>团队协同</dt><dd>{phase.sync}</dd></div>
              <div><dt>模拟 Alpha</dt><dd className={phase.alpha < 0 ? 'tone-rose' : 'tone-acid'}>{phase.alpha > 0 ? '+' : ''}{phase.alpha.toFixed(1)}%</dd></div>
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
            <button type="button" onClick={() => setTick(0)}><RotateCcw size={15} />重新播放</button>
          </div>
          <div className="v3-runtime-live-state">
            <Activity size={15} />
            <span>{paused ? '所有行情、任务、协作与仓位已冻结' : `${sessionTime} · ${phase.label} · 下一状态约 ${Math.max(1, V3_RUNTIME_STAGE_TICKS - phaseTick)} 秒`}</span>
          </div>
          <Action to="/result">结束并复盘</Action>
        </footer>
      </section>
    </div>
  )
}
