import React, { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { agentOrganizationLine, agents } from '../data.js'
import { useDemo } from '../state.jsx'
import { Action, AgentPlate, EditorialTitle, EmptyAgentSlot, Eyebrow, Reveal, Tag } from '../components/UI.jsx'

const roles = ['全部', '价值', '成长', '动量', '宏观', '叙事', '风险', '量化']

export function AgentsPage() {
  const navigate = useNavigate()
  const demo = useDemo()
  const [role, setRole] = useState('全部')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(agents[0].id)
  const selectedAgent = agents.find((agent) => agent.id === active) ?? agents[0]
  const visible = useMemo(() => agents.filter((agent) => {
    const roleMatch = role === '全部' || agent.role === role
    const text = `${agent.name} ${agent.latin} ${agent.code} ${agent.role} ${agentOrganizationLine(agent)} ${agent.factors.join(' ')}`.toLowerCase()
    return roleMatch && text.includes(query.toLowerCase())
  }), [role, query])

  const team = demo.selectedAgentIds.map((id) => agents.find((agent) => agent.id === id)).filter(Boolean)

  return (
    <div className="page agents-page">
      <section className="catalog-hero chapter">
        <Reveal className="catalog-heading">
          <Eyebrow index="01">AGENT MARKETPLACE</Eyebrow>
          <EditorialTitle desktop={['召集你的', { text: '全球顶级', tone: 'muted' }, { text: '交易战队。', tone: 'muted' }]} mobile={['召集你的', { text: '全球顶级', tone: 'muted' }, { text: '交易战队。', tone: 'muted' }]} />
          <p>每个 Agent 代表一套公开策略信号。根据证据、风险和决策节奏选择适合你的判断风格。</p>
        </Reveal>
        <Reveal className="team-dock" delay={0.08}>
          <div className="team-dock-head"><span>当前战队</span><b>{team.length} / 3</b></div>
          <div className="team-dock-slots">
            {team.map((agent, index) => (
              <button key={agent.id} className="dock-agent" onClick={() => demo.removeAgent(agent.id)}>
                <span>0{index + 1}</span><div><b>{agent.name}</b><small>{agentOrganizationLine(agent)}</small></div><X size={14} />
              </button>
            ))}
            {Array.from({ length: 3 - team.length }, (_, index) => <EmptyAgentSlot key={index} index={team.length + index + 1} />)}
          </div>
          <Action to="/team" variant={team.length >= 2 ? 'primary' : 'secondary'} disabled={team.length < 2}>继续组队</Action>
          {team.length < 2 && <p className="dock-hint">至少选择 2 个 Agent</p>}
        </Reveal>

        <Reveal className="catalog-controls">
          <label className="search-field"><Search size={17} /><input aria-label="搜索智能体" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名、策略或代码" /></label>
          <div className="role-filters" aria-label="角色筛选"><SlidersHorizontal size={16} />{roles.map((item) => <button key={item} className={role === item ? 'is-active' : ''} onClick={() => setRole(item)}>{item}</button>)}</div>
        </Reveal>

        <div className="agent-mosaic">
          {visible.map((agent, index) => (
            <Reveal key={agent.id} className={index === 0 || index === 5 ? 'mosaic-wide' : ''} delay={(index % 4) * 0.04}>
              <AgentPlate agent={agent} interactive selected={agent.id === active} onSelect={() => setActive(agent.id)} showAction size={index === 0 || index === 5 ? 'wide' : 'regular'} />
            </Reveal>
          ))}
          {!visible.length && <div className="empty-result">没有匹配的 Agent。请调整筛选条件。</div>}
        </div>
      </section>

      <section className="agent-inspection chapter">
        <Reveal className="inspection-code"><span>{selectedAgent.grade}</span><small>{selectedAgent.department} · {selectedAgent.position}</small></Reveal>
        <Reveal className="inspection-copy" delay={0.06}>
          <Eyebrow index="02">INSPECTION</Eyebrow>
          <h2>{selectedAgent.name}<small>{selectedAgent.role}策略智能体</small></h2>
          <p>{selectedAgent.thesis}</p>
          <div className="inspection-tags">{selectedAgent.factors.map((factor) => <Tag key={factor}>{factor}</Tag>)}</div>
        </Reveal>
        <Reveal className="inspection-metrics" delay={0.12}>
          <div><span>模拟收益</span><b>+{selectedAgent.return}%</b></div>
          <div><span>胜率</span><b>{selectedAgent.winRate}%</b></div>
          <div><span>风险值</span><b>{selectedAgent.risk}</b></div>
          <div className="inspection-actions"><Action onClick={() => demo.addAgent(selectedAgent.id)} variant="secondary" disabled={demo.selectedAgentIds.includes(selectedAgent.id) || demo.selectedAgentIds.length >= 3}>加入战队</Action><Action onClick={() => navigate(`/agents/${selectedAgent.id}`)}>查看详情</Action></div>
        </Reveal>
      </section>
    </div>
  )
}
