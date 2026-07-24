import React, { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Crown, RefreshCcw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { agents } from '../data.js'
import { TEAM_CAPACITY, useDemo } from '../state.jsx'
import { Action, AgentPlate, DataRule, EditorialTitle, EmptyAgentSlot, Eyebrow, Reveal, SectionHead, SignalBar } from '../components/UI.jsx'

export function TeamPage() {
  const demo = useDemo()
  const team = demo.selectedAgentIds.map((id) => agents.find((agent) => agent.id === id)).filter(Boolean)
  const [analysis, setAnalysis] = useState('readiness')
  const ready = team.length === TEAM_CAPACITY
  const scores = {
    readiness: [['策略互补', 84], ['风险分散', 77], ['执行同步', 81]],
    market: [['危机适配', 91], ['震荡适配', 68], ['趋势适配', 79]],
    risk: [['尾部保护', 88], ['集中度', 64], ['流动性', 82]],
  }

  return (
    <div className="page team-page">
      <section className="team-compose chapter">
        <Reveal className="team-title">
          <Eyebrow index="01">TEAM COMPOSITION</Eyebrow>
          <EditorialTitle desktop={['构建战队，', { text: '寻找最佳', tone: 'muted' }, { text: '协同分数。', tone: 'muted' }]} mobile={['构建战队，', { text: '寻找最佳', tone: 'muted' }, { text: '协同分数。', tone: 'muted' }]} />
          <p>五个专业席位共享一个风险预算。选择队长，决定最终决策如何被整合。</p>
        </Reveal>
        <Reveal className="team-status" delay={0.08}>
          <span>QELL TEST TEAM</span><div><b>{team.length}</b><small>/ {TEAM_CAPACITY} AGENTS</small></div>
          <Action to="/agents" variant="quiet" icon={false}><RefreshCcw size={14} /> 调整成员</Action>
        </Reveal>

        <div className="team-desks">
          {Array.from({ length: TEAM_CAPACITY }, (_, index) => index).map((index) => {
            const agent = team[index]
            if (!agent) return <EmptyAgentSlot key={index} index={index + 1} />
            const captain = demo.captainId === agent.id
            return (
              <Reveal className={`team-desk ${captain ? 'is-captain' : ''}`} key={agent.id} delay={index * 0.07}>
                <div className="desk-index"><span>DESK 0{index + 1}</span>{captain && <b><Crown size={13} /> CAPTAIN</b>}</div>
                <AgentPlate agent={agent} size="wide" />
                <div className="desk-actions"><button onClick={() => demo.setCaptain(agent.id)} disabled={captain}>{captain ? '当前队长' : '设为队长'}</button><button onClick={() => demo.removeAgent(agent.id)}>移除</button></div>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="team-thesis">
          <span>TEAM THESIS</span>
          <h2>{team.length >= TEAM_CAPACITY ? '宏观识别周期，量化验证信号，价值与动量负责定价和时机，风险席保留否决权。' : '补齐五个专业席位，生成完整战队论点。'}</h2>
          <div><DataRule label="队长" value={agents.find((a) => a.id === demo.captainId)?.name ?? '未选择'} tone="acid" /><DataRule label="协同度" value={ready ? '84 / 100' : '待计算'} tone="cyan" /></div>
        </Reveal>
      </section>

      <section className="readiness-chapter chapter">
        <Reveal><SectionHead index="02" eyebrow="READINESS CHECK" title="模拟前，只确认关键风险" text="不重复总结每个 Agent。这里只检查风格冲突、市场适配与执行边界。" /></Reveal>
        <Tabs.Root className="analysis-tabs" value={analysis} onValueChange={setAnalysis}>
          <Tabs.List className="tab-list" aria-label="战队分析视图"><Tabs.Trigger value="readiness">准备度</Tabs.Trigger><Tabs.Trigger value="market">市场适配</Tabs.Trigger><Tabs.Trigger value="risk">风险闸门</Tabs.Trigger></Tabs.List>
          <div className="readiness-surface">
            <Tabs.Content value={analysis} forceMount className="score-field">
              <div className="score-field-number"><span>{analysis === 'readiness' ? '84' : analysis === 'market' ? '79' : '78'}</span><small>/ 100</small><p>{analysis === 'readiness' ? 'TEAM READY' : analysis === 'market' ? 'MARKET FIT' : 'RISK CONTROL'}</p></div>
              <div className="score-field-bars">{scores[analysis].map(([label, value], index) => <SignalBar key={label} label={label} value={value} tone={index === 1 ? 'cyan' : 'acid'} />)}</div>
              <div className="score-field-note">{analysis === 'readiness' ? <><ShieldCheck size={23} /><div><b>结构完整</b><p>当前成员覆盖定价、周期与尾部风险。允许进入历史模拟。</p></div></> : analysis === 'market' ? <><TriangleAlert size={23} /><div><b>趋势响应偏慢</b><p>强趋势早期可能落后，建议在运行时观察动量确认。</p></div></> : <><ShieldCheck size={23} /><div><b>风险预算有效</b><p>单一风格暴露低于预设阈值。</p></div></> }</div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
        <Reveal className="team-next">
          <div><span>NEXT STEP</span><h3>选择一个历史场景，验证这套结构。</h3></div>
          <Action to="/events" disabled={!ready}>选择历史副本</Action>
        </Reveal>
      </section>
    </div>
  )
}
