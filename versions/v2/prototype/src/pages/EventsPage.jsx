import React, { useEffect, useMemo, useState } from 'react'
import { CalendarRange, Gauge, TimerReset, TrendingDown } from 'lucide-react'
import { events } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action, DataRule, EditorialTitle, Eyebrow, Reveal, SignalBar, Tag } from '../components/UI.jsx'

const categories = ['全部', '危机', '美股', '加密', '趋势']

export function EventsPage() {
  const demo = useDemo()
  const [category, setCategory] = useState('全部')
  const [presence, setPresence] = useState(() => Object.fromEntries(events.map((event) => [event.id, event.activeAgents])))
  const selected = events.find((event) => event.id === demo.selectedEventId) ?? events[0]
  const visible = useMemo(() => events.filter((event) => {
    if (category === '全部') return true
    if (category === '加密') return event.market.includes('BTC')
    if (category === '美股') return event.market.includes('股') || event.market.includes('纳斯达克')
    if (category === '趋势') return event.move.startsWith('+')
    return event.move.startsWith('−') && event.difficulty >= 85
  }), [category])

  useEffect(() => {
    let tick = 0
    const deltas = [-3, 2, 1, -1, 4, -2]
    const timer = window.setInterval(() => {
      tick += 1
      setPresence((current) => Object.fromEntries(events.map((event, index) => {
        const next = current[event.id] + deltas[(tick + index) % deltas.length]
        return [event.id, Math.max(event.activeAgents - 12, Math.min(event.activeAgents + 16, next))]
      })))
    }, 10000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="page events-page">
      <section className="event-library chapter">
        <Reveal className="event-heading">
          <Eyebrow index="01">HISTORICAL SCENARIOS</Eyebrow>
          <EditorialTitle desktop={['把真实的金融史，', { text: '变成战队的', tone: 'muted' }, { text: '训练场。', tone: 'muted' }]} mobile={['把真实的', { text: '金融史变成', tone: 'muted' }, { text: '战队训练场。', tone: 'muted' }]} />
          <p>每个副本只呈现当时可获得的信息，让战队在真实市场条件下完成判断与复盘。</p>
        </Reveal>
        <Reveal className="event-library-stat" delay={0.08}><span>SCENARIO LIBRARY</span><b>24</b><small>覆盖 1987—2025</small></Reveal>
        <Reveal className="event-filters"><span>按市场结构筛选</span>{categories.map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</Reveal>
        <div className="event-shelf">
          {visible.map((event, index) => (
            <Reveal key={event.id} className={index === 0 ? 'event-card event-card-feature' : 'event-card'} delay={(index % 4) * 0.05}>
              <button
                className={`${selected.id === event.id ? 'is-selected ' : ''}tone-${event.tone}`}
                data-direction={event.move.startsWith('+') ? 'up' : event.tone === 'cyan' ? 'structure' : 'down'}
                onClick={() => demo.setSelectedEvent(event.id)}
              >
                <div className="event-card-top"><span>{event.year}</span><div className="event-card-meta"><span className="event-presence" aria-label={`模拟运行中的 Agent：${presence[event.id]}`}><i /><b className="presence-number" key={presence[event.id]}>{presence[event.id]}</b><small>SIM AGENTS</small></span><Tag tone={event.tone}>{event.market}</Tag></div></div>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <div className="event-fingerprint"><strong>{event.move}</strong><span>{event.duration}</span><i style={{ '--difficulty': `${event.difficulty}%` }} /></div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="event-detail chapter">
        <Reveal className="selected-event-mark"><span>{selected.year}</span><small>SELECTED SCENARIO</small></Reveal>
        <Reveal className="selected-event-copy" delay={0.05}>
          <Eyebrow index="02">SCENARIO BRIEF</Eyebrow><h2>{selected.name}</h2><p>{selected.description}</p>
          <div className="event-objective"><span>任务目标</span><strong>{selected.objective}</strong></div>
          <div className="event-actions"><Action to="/runtime">进入模拟</Action><Action to="/team" variant="quiet">调整战队</Action></div>
        </Reveal>
        <Reveal className="event-instruments" delay={0.1}>
          <div className="event-instrument-row"><TrendingDown size={18} /><span>市场变化</span><b>{selected.move}</b></div>
          <div className="event-instrument-row"><TimerReset size={18} /><span>关键阶段</span><b>{selected.duration}</b></div>
          <div className="event-instrument-row"><Gauge size={18} /><span>难度</span><b>{selected.difficulty} / 100</b></div>
          <div className="event-instrument-row"><CalendarRange size={18} /><span>数据完整度</span><b>94%</b></div>
          <SignalBar label="历史波动" value={selected.volatility} tone={selected.tone} />
          <SignalBar label="团队适配" value={82} tone="acid" />
        </Reveal>
        <Reveal className="recommended-team"><span>推荐战队结构</span><DataRule label="01" value="宏观 / 判断政策与周期" tone="cyan" /><DataRule label="02" value="风险 / 约束尾部损失" tone="risk" /><DataRule label="03" value="价值或动量 / 负责再入场" tone="acid" /></Reveal>
      </section>
    </div>
  )
}
