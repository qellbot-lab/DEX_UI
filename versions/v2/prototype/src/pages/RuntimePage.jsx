import React, { useEffect, useMemo, useState } from 'react'
import { Activity, CirclePause, CirclePlay, FastForward, GitBranch, RadioTower } from 'lucide-react'
import { agents, events } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action, EditorialTitle, Eyebrow, Reveal, SignalBar, Tag } from '../components/UI.jsx'
import { MarketChart } from '../components/Charts.jsx'
import {
  RUNTIME_CYCLE_TICKS,
  RUNTIME_STAGE_TICKS,
  createRuntimeCandles,
  formatSimulationTime,
  getRuntimePosition,
  getRuntimeStage,
  runtimeStages,
} from '../runtimeMock.js'

const factorNames = ['流动性环境', '尾部凸性', '趋势确认', '安全边际', '相关性突变', '执行滑点']
const lifecycleSteps = ['降杠杆', '保护', '观察', '再入场', '持有']
const speeds = [1, 2, 4]

function resolveParticipant(value, team) {
  if (value === 'CORE') return 'TEAM CORE'
  if (value === 'ALL') return 'ALL AGENTS'
  return team[value % team.length]?.code ?? 'AGENT'
}

function metricTone(value) {
  return value < 0 ? 'rose' : 'acid'
}

export function RuntimePage() {
  const demo = useDemo()
  const event = events.find((item) => item.id === demo.selectedEventId) ?? events[2]
  const selectedTeam = demo.selectedAgentIds.map((id) => agents.find((agent) => agent.id === id)).filter(Boolean)
  const team = useMemo(() => {
    const fallback = agents.filter((agent) => !selectedTeam.some((item) => item.id === agent.id))
    return [...selectedTeam, ...fallback].slice(0, 3)
  }, [selectedTeam])
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [simulationTick, setSimulationTick] = useState(37)
  const { stage, index: activeDecision, cycleTick } = getRuntimeStage(simulationTick)
  const candles = useMemo(() => createRuntimeCandles(simulationTick, 18), [simulationTick])
  const position = getRuntimePosition(simulationTick, stage)
  const latestCandle = candles.at(-1)
  const streamCount = Math.min(stage.stream.length, 1 + (cycleTick % RUNTIME_STAGE_TICKS))
  const visibleStream = stage.stream.slice(0, streamCount)
  const confidence = Math.max(1, Math.min(99, stage.confidence + ((simulationTick % 3) - 1)))
  const pnl = stage.pnl + Math.sin(simulationTick * 0.72) * 0.35
  const sessionTime = formatSimulationTime(simulationTick)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => setSimulationTick((current) => current + speed), 850)
    return () => window.clearInterval(timer)
  }, [paused, speed])

  const selectDecision = (decisionIndex) => {
    const cycleBase = simulationTick - cycleTick
    setSimulationTick(cycleBase + decisionIndex * RUNTIME_STAGE_TICKS)
  }

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed)
    setSpeed(speeds[(currentIndex + 1) % speeds.length])
  }

  return (
    <div className={`page runtime-page ${paused ? 'is-paused' : 'is-running'}`} data-stage={stage.id} style={{ '--runtime-speed': speed }}>
      <section className="runtime-command chapter">
        <Reveal className="runtime-headline">
          <Eyebrow index="01">SIMULATION RUNTIME</Eyebrow>
          <div className="runtime-event-line"><span>{event.year}</span><h1>{event.name}</h1><em>PAPER / LIVE REPLAY</em></div>
        </Reveal>
        <Reveal className="runtime-clock" delay={0.06}><span>MARKET TIME</span><b>{sessionTime}</b><small>{paused ? 'PAUSED' : `${speed}× RUNNING`}</small></Reveal>
        <Reveal className="runtime-pnl" delay={0.1}><span>PAPER PNL</span><b className={`tone-${metricTone(pnl)}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}<small>%</small></b><em>随行情与仓位实时重估</em></Reveal>

        <div className="runtime-workbench">
          <Reveal className="market-context">
            <div className="instrument-head"><span>MARKET CONTEXT</span><Tag tone="risk">LIVE · 高波动</Tag></div>
            <MarketChart candles={candles} paused={paused} />
            <div className="market-ticks">
              <div className="market-live-rule"><span>INDEX</span><b>{latestCandle ? (latestCandle.close * 42.15).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</b></div>
              <div className="market-live-rule"><span>VOLATILITY</span><b className="tone-rose">{(stage.volatility + Math.sin(simulationTick) * 1.4).toFixed(1)}</b></div>
              <div className="market-live-rule"><span>LIQUIDITY</span><b className="tone-ember">{stage.liquidity}</b></div>
            </div>
            <div className="position-block">
              <div className="position-heading"><span>CURRENT POSITION</span><em>{stage.positionLabel}</em></div>
              <div className="position-live-value"><b>{position}<small>%</small></b><i>{position > stage.position ? '+' : ''}{position - stage.position}%</i></div>
              <div className="position-meter" aria-label={`当前净多头仓位 ${position}%`}><i style={{ width: `${position}%` }} /></div>
              <small>仓位由团队决策、风险预算与当前成交状态共同驱动。</small>
            </div>
          </Reveal>

          <Reveal className="decision-theater" delay={0.05}>
            <div className="instrument-head"><span>AGENT DECISION TAPE</span><div className="live-status"><RadioTower size={14} /> {paused ? 'HOLD' : 'STREAMING'}</div></div>
            <div className="decision-focus" aria-live="polite">
              <div className="decision-sequence">
                <div className="decision-live-meta">
                  <time>{sessionTime}</time>
                  <div className="thinking-state" role="status" aria-label={paused ? 'Agent 思考已暂停' : 'Agent 正在思考'}>
                    <span>{paused ? 'Thinking paused' : 'Thinking...'}</span>
                  </div>
                </div>
                <em>{team[activeDecision % team.length]?.code ?? 'TEAM CORE'}</em>
              </div>
              <div className="tv-title-wrap" key={stage.id}>
                <h2 className="tv-title" data-text={stage.action}>{stage.action}</h2>
              </div>
              <p>{stage.note}</p>
              <div className="decision-path"><span>{stage.skill}</span><GitBranch size={17} /><span>{stage.subagent}</span></div>
              <SignalBar label="决策置信度" value={confidence} tone={confidence > 85 ? 'acid' : 'cyan'} />
            </div>
            <div className="decision-list">
              {runtimeStages.map((item, itemIndex) => (
                <button key={item.id} className={itemIndex === activeDecision ? 'is-active' : ''} onClick={() => selectDecision(itemIndex)} aria-pressed={itemIndex === activeDecision}>
                  <span>{formatSimulationTime(itemIndex * RUNTIME_STAGE_TICKS)}</span><b>{team[itemIndex % team.length]?.code}</b><em>{item.action}</em>
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="team-operations" delay={0.1}>
            <div className="instrument-head"><span>TEAM OPERATIONS</span><Tag tone="acid">SYNC {stage.sync}</Tag></div>
            <div className="agent-state-register">
              {team.map((agent, agentIndex) => {
                const agentState = stage.agents[agentIndex]
                return (
                  <div className="agent-state-row" key={`${stage.id}-${agent.id}`}>
                    <div className="agent-state-id"><span>{agent.code}</span><i className={`tone-${agentState.tone}`} /></div>
                    <div className="agent-state-copy"><b>{agent.name}</b><em>{agentState.mood}</em><small>{agentState.task}</small></div>
                    <span className={`agent-skill tone-${agentState.tone}`}>{agentState.skill}</span>
                  </div>
                )
              })}
            </div>
            <div className="collab-stream">
              <div className="collab-stream-head"><span>AGENT BUS</span><em>{paused ? 'BUFFERED' : `${streamCount}/4 LIVE`}</em></div>
              <div className="collab-stream-list" aria-live="polite">
                {visibleStream.map((entry, streamIndex) => (
                  <div className="collab-message" key={`${stage.id}-${streamIndex}`}>
                    <span>{formatSimulationTime(simulationTick - visibleStream.length + streamIndex + 1)}</span>
                    <div><b className={`tone-${entry.tone}`}>{resolveParticipant(entry.from, team)} → {resolveParticipant(entry.to, team)}</b><em>{entry.label}</em><small>{entry.detail}</small></div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="runtime-controls">
          <button onClick={() => setPaused((current) => !current)} aria-label={paused ? '继续模拟' : '暂停模拟'}>{paused ? <CirclePlay size={18} /> : <CirclePause size={18} />}{paused ? '继续' : '暂停'}</button>
          <button onClick={cycleSpeed} aria-label={`当前 ${speed} 倍速，点击切换`}><FastForward size={18} />{speed}×</button>
          <div className="runtime-control-state" role="status"><Activity size={16} /><span>{paused ? '模拟已暂停：行情、决策、协作流与仓位均已冻结' : `${sessionTime} · ${stage.action} · 下一状态约 ${Math.max(1, RUNTIME_STAGE_TICKS - (cycleTick % RUNTIME_STAGE_TICKS))} 秒`}</span></div>
          <Action to="/result">完成模拟</Action>
        </Reveal>
      </section>

      <section className="runtime-analysis chapter">
        <Reveal className="runtime-analysis-title"><Eyebrow index="02">DECISION DOCK</Eyebrow><EditorialTitle as="h2" desktop={['每一次调用，', { text: '都留下可验证记录。', tone: 'muted' }]} mobile={['每一次调用，', { text: '都留下', tone: 'muted' }, { text: '可验证记录。', tone: 'muted' }]} /><p>输入因子、Agent 消息与仓位状态共享同一个模拟时钟，暂停或倍速会同步影响全部记录。</p></Reveal>
        <div className="runtime-analysis-grid">
          <Reveal className="factor-ledger">
            <div className="instrument-head"><span>FACTOR SKILLS</span><b>{stage.skill}</b></div>
            {factorNames.map((item, factorIndex) => <SignalBar key={item} label={item} value={Math.max(1, Math.min(99, stage.factorScores[factorIndex] + ((simulationTick + factorIndex) % 3) - 1))} tone={factorIndex === 1 || factorIndex === 4 ? 'rose' : factorIndex === 5 ? 'ember' : 'cyan'} compact />)}
          </Reveal>
          <Reveal className="execution-ledger" delay={0.06}>
            <div className="instrument-head"><span>COLLABORATION LEDGER</span><b>{streamCount.toString().padStart(2, '0')} EVENTS</b></div>
            {visibleStream.map((entry, streamIndex) => <div className="execution-row" key={`${stage.id}-ledger-${streamIndex}`}><span>0{streamIndex + 1}</span><div><b>{entry.label}</b><small>{resolveParticipant(entry.from, team)} → {resolveParticipant(entry.to, team)}</small></div><em>{streamIndex === visibleStream.length - 1 && !paused ? 'LIVE' : 'DONE'}</em></div>)}
          </Reveal>
          <Reveal className="lifecycle" delay={0.12}>
            <div className="instrument-head"><span>POSITION LIFECYCLE</span><b>{position}% NET</b></div>
            <div className="lifecycle-track">{lifecycleSteps.map((item, stepIndex) => <div key={item} className={stepIndex <= stage.lifecycle ? 'is-past' : ''}><i /><span>{item}</span></div>)}</div>
            <div className="event-tape"><span>MARKET EVENTS · {sessionTime}</span>{stage.events.map((item) => <p key={item}>{item}</p>)}</div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
