import React, { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Award, CircleCheck, RotateCcw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { agents, events } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action, DataRule, Eyebrow, Reveal, SectionHead, SignalBar } from '../components/UI.jsx'
import { PerformanceChart } from '../components/Charts.jsx'

export function ResultPage() {
  const demo = useDemo()
  const event = events.find((item) => item.id === demo.selectedEventId) ?? events[2]
  const team = demo.selectedAgentIds.map((id) => agents.find((agent) => agent.id === id)).filter(Boolean)
  const [tab, setTab] = useState('result')

  return (
    <div className="page result-page">
      <section className="result-summary chapter">
        <Reveal className="result-kicker"><Eyebrow index="01">SIMULATION COMPLETE</Eyebrow><span>{event.year} · {event.name}</span></Reveal>
        <Reveal className="result-primary" delay={0.05}><span>FINAL RETURN</span><h1>+18.6<small>%</small></h1><p>战队在最大回撤阶段削减风险，并在流动性稳定后分批重建仓位。</p></Reveal>
        <Reveal className="result-rank" delay={0.1}><div><span>GLOBAL RANK</span><b>#06</b><em>↑ 7</em></div><div><span>POINTS</span><b>+860</b><em>SEASON 04</em></div></Reveal>

        <Reveal className="result-chart">
          <div className="instrument-head"><span>TEAM PERFORMANCE / BENCHMARK</span><div><i className="legend-team" />战队 <i className="legend-base" />基准</div></div>
          <PerformanceChart />
          <div className="result-chart-footer"><DataRule label="战队收益" value="+18.6%" tone="acid" /><DataRule label="基准收益" value="+6.4%" /><DataRule label="最大回撤" value="−11.7%" tone="risk" /></div>
        </Reveal>

        <Reveal className="settlement-card" delay={0.08}>
          <Award size={30} strokeWidth={1.25} /><span>PERFORMANCE GRADE</span><b>A−</b><p>风险控制与再入场优于本季 87% 的战队。</p>
          <Action variant="secondary" onClick={() => document.getElementById('postmortem')?.scrollIntoView({ behavior: 'smooth' })}>查看归因</Action>
        </Reveal>
      </section>

      <section className="postmortem chapter" id="postmortem">
        <Reveal><SectionHead index="02" eyebrow="POST-MORTEM" title="把结果拆回决策" text="区分收益贡献、风险贡献和执行质量，避免只用最终 PnL 评价战队。" /></Reveal>
        <Tabs.Root className="result-tabs" value={tab} onValueChange={setTab}>
          <Tabs.List className="tab-list"><Tabs.Trigger value="result">结果归因</Tabs.Trigger><Tabs.Trigger value="risk">风险复盘</Tabs.Trigger><Tabs.Trigger value="replay">关键回放</Tabs.Trigger></Tabs.List>
          <Tabs.Content value="result" className="postmortem-grid">
            <div className="contribution-field">
              <span>AGENT CONTRIBUTION</span>
              {team.map((agent, index) => <div className="contribution-row" key={agent.id}><b>{agent.grade}</b><div><span>{agent.name}</span><small>{agent.department} · {agent.position}</small></div><i style={{ width: `${[78, 62, 88][index] ?? 68}%` }} /><em>+{[7.4, 4.1, 5.8][index] ?? 3.2}%</em></div>)}
            </div>
            <div className="decision-review"><div className="review-positive"><CircleCheck size={20} /><span>最佳决策</span><h3>波动率断层前建立尾部保护</h3><p>减少约 8.2% 的潜在回撤。</p></div><div className="review-negative"><TriangleAlert size={20} /><span>最大失误</span><h3>再入场比价格结构慢 14 分钟</h3><p>损失约 2.1% 的反弹收益。</p></div></div>
          </Tabs.Content>
          <Tabs.Content value="risk" className="postmortem-grid"><div className="risk-score"><ShieldCheck size={28} /><span>RISK DISCIPLINE</span><b>88</b><p>集中度、尾部保护和暂停条件均在阈值内。</p></div><div className="score-field-bars"><SignalBar label="风险预算" value={91} /><SignalBar label="尾部保护" value={88} tone="rose" /><SignalBar label="相关性控制" value={79} tone="cyan" /></div></Tabs.Content>
          <Tabs.Content value="replay" className="postmortem-grid"><div className="replay-timeline">{['09:31 降低风险预算', '09:36 建立尾部保护', '09:47 等待反转确认', '10:18 分批再入场'].map((item, index) => <div key={item}><span>0{index + 1}</span><b>{item}</b><p>{['避免高杠杆进入下跌段', '锁定最大损失边界', '避免第一次假反弹', '回到高质量资产'][index]}</p></div>)}</div></Tabs.Content>
        </Tabs.Root>
        <Reveal className="result-next"><div><span>NEXT DECISION</span><h3>改变场景，还是改变战队？</h3></div><div><Action to="/events" variant="secondary"><RotateCcw size={15} /> 再试一次</Action><Action to="/team" variant="quiet">调整战队</Action><Action to="/leaderboard">查看排行榜</Action></div></Reveal>
      </section>
    </div>
  )
}
