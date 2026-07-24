import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Database, ShieldAlert } from 'lucide-react'
import { agentOrganizationLine, agents } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action, AgentPlate, DataRule, Eyebrow, Reveal, SectionHead, SignalBar } from '../components/UI.jsx'

export function AgentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const demo = useDemo()
  const agent = agents.find((item) => item.id === id) ?? agents[0]
  const inTeam = demo.selectedAgentIds.includes(agent.id)
  const partners = agents.filter((item) => item.id !== agent.id && item.role !== agent.role).slice(0, 3)

  const handleTeam = () => {
    if (!inTeam) demo.addAgent(agent.id)
    navigate('/team')
  }

  return (
    <div className="page detail-page">
      <section className="detail-hero chapter">
        <button className="back-link" onClick={() => navigate('/agents')}><ArrowLeft size={15} /> 返回智能体广场</button>
        <Reveal className="detail-code"><span>{agent.grade}</span><p>{agent.department} · {agent.position}</p></Reveal>
        <Reveal className="detail-identity" delay={0.06}>
          <Eyebrow index="01">AGENT IDENTITY</Eyebrow>
          <h1>{agent.name}</h1><div className="detail-latin">{agent.latin}</div>
          <p>{agent.thesis}</p>
          <div className="detail-actions"><Action onClick={handleTeam}>{inTeam ? '查看战队' : '加入并组队'}</Action><Action to="/agents" variant="quiet">浏览其他 Agent</Action></div>
        </Reveal>
        <Reveal className="detail-scoreboard" delay={0.1}>
          <div className="score-primary"><span>SIMULATED RETURN</span><b>+{agent.return}<small>%</small></b><em>过去 24 个历史场景</em></div>
          <div className="score-pair"><div><span>胜率</span><b>{agent.winRate}%</b></div><div><span>风险值</span><b>{agent.risk}</b></div></div>
          <DataRule label="最佳战队槽位" value={agent.role} tone="acid" />
          <DataRule label="协作稳定性" value={`${Math.round((agent.winRate + (100 - agent.risk)) / 2)} / 100`} tone="cyan" />
        </Reveal>
      </section>

      <section className="strategy-chapter chapter">
        <Reveal><SectionHead index="02" eyebrow="STRATEGY SYSTEM" title="策略 DNA 与适用边界" text="用关键因子和适配场景理解这套策略，不用人格故事替代证据。" /></Reveal>
        <div className="strategy-layout">
          <Reveal className="strategy-core">
            <div className="core-heading"><span>{agent.grade}</span><h3>{agentOrganizationLine(agent)} · {agent.role}决策核心</h3></div>
            {agent.factors.map((factor, index) => <SignalBar key={factor} label={factor} value={[88, 76, 69][index]} tone={agent.color} />)}
            <div className="source-register"><Database size={18} /><div><span>信号来源</span><p>公开财务数据 · 宏观数据 · 历史价格 · 新闻事件</p></div></div>
          </Reveal>
          <Reveal className="fit-boundaries" delay={0.08}>
            <div className="fit-column"><span>适合市场</span>{agent.fit.map((item) => <DataRule key={item} label={item} value="FIT" tone="acid" />)}</div>
            <div className="fit-column"><span>谨慎使用</span>{agent.avoid.map((item) => <DataRule key={item} label={item} value="WATCH" tone="risk" />)}<div className="risk-note"><ShieldAlert size={18} /><p>模拟表现不代表未来收益。风险阈值来自历史场景。</p></div></div>
          </Reveal>
        </div>
        <Reveal className="partner-strip">
          <div className="partner-copy"><Eyebrow index="03">TEAM PARTNERS</Eyebrow><h3>推荐协作对象</h3><p>降低单一风格暴露，优先选择证据与决策周期互补的 Agent。</p></div>
          {partners.map((item) => <div key={item.id} className="partner-plate"><AgentPlate agent={item} size="compact" /><Action to={`/agents/${item.id}`} variant="text">查看</Action></div>)}
        </Reveal>
      </section>
    </div>
  )
}
