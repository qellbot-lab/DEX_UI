import React from 'react'
import { ArrowDown, CircleCheck, Gauge, History, ShieldCheck } from 'lucide-react'
import { agents, events, leaderboard } from '../data.js'
import { Action, AgentPlate, DataRule, EditorialTitle, Eyebrow, Metric, Reveal, SectionHead } from '../components/UI.jsx'

export function HomePage() {
  const featured = [agents[0], agents[3], agents[5]]
  return (
    <div className="page home-page">
      <section className="home-hero chapter">
        <div className="hero-atmosphere" aria-hidden="true" />
        <Reveal className="hero-copy">
          <Eyebrow index="01">ALPHA TEAM STUDIO</Eyebrow>
          <EditorialTitle desktop={['让每个交易者', '拥有自己的', { text: '专属量化战队。', tone: 'muted' }]} mobile={['让每个交易者', '拥有自己的', { text: '专属量化战队。', tone: 'muted' }]} />
          <p>召集风格互补的交易智能体，进入真实历史行情，观察战队如何协作、分歧并修正决策。</p>
          <div className="hero-actions">
            <Action to="/agents">探索智能体</Action>
            <Action to="/events" variant="quiet">查看历史副本</Action>
          </div>
        </Reveal>

        <Reveal className="hero-team-stack" delay={0.12}>
          <div className="stack-heading"><span>FEATURED COMPOSITION</span><b>03 / 03</b></div>
          {featured.map((agent, index) => (
            <div className="stack-item" key={agent.id} style={{ '--stack': index }}>
              <AgentPlate agent={agent} size="compact" />
            </div>
          ))}
          <div className="team-result-line">
            <span>协同置信度</span><b>84</b><em>/ 100</em>
          </div>
        </Reveal>
        <a className="scroll-cue" href="#system"><ArrowDown size={16} /> 了解工作方式</a>
      </section>

      <section className="system-chapter chapter" id="system">
        <Reveal><SectionHead index="02" eyebrow="HOW IT WORKS" title="把直觉变成可以验证的系统" text="QELL 把公开策略信号组织为可观察、可比较、可复盘的历史模拟，并持续标明风险边界。" /></Reveal>
        <div className="capability-stage">
          <Reveal className="capability-lead">
            <div className="capability-number">01</div>
            <History size={30} strokeWidth={1.25} />
            <h3>历史市场重放</h3>
            <p>进入金融危机、疫情熔断与加密周期，检验战队在不同结构下的反应。</p>
            <DataRule label="场景库" value="24 个关键事件" tone="cyan" />
          </Reveal>
          <div className="capability-pair">
            <Reveal className="capability-item" delay={0.08}>
              <Gauge size={24} strokeWidth={1.3} /><span>02</span><h3>决策过程可见</h3><p>用因子调用、执行记录和仓位变化解释结果。</p>
            </Reveal>
            <Reveal className="capability-item" delay={0.14}>
              <ShieldCheck size={24} strokeWidth={1.3} /><span>03</span><h3>风险边界清楚</h3><p>模拟、公开信号与非投资建议始终保持可见。</p>
            </Reveal>
          </div>
        </div>
        <Reveal className="journey-sequence">
          {['选择 Agent', '组建战队', '选择副本', '观察模拟', '复盘归因', '比较排名'].map((item, index) => (
            <div key={item}><span>0{index + 1}</span><b>{item}</b>{index < 5 && <i />}</div>
          ))}
        </Reveal>
      </section>

      <section className="proof-chapter chapter">
        <Reveal><SectionHead index="03" eyebrow="STARTING POINTS" title="从一次压力测试开始" text="选择一个场景，或者先查看已经被验证过的战队结构。" /></Reveal>
        <div className="proof-layout">
          <Reveal className="event-feature">
            <span className="event-year">{events[2].year}</span>
            <div className="event-feature-copy"><small>FEATURED EVENT</small><h3>{events[2].name}</h3><p>{events[2].description}</p></div>
            <div className="event-feature-metrics"><Metric label="市场跌幅" value="−57" suffix="%" tone="risk" /><Metric label="难度" value="96" suffix="/100" /></div>
            <Action to="/events" variant="secondary">选择历史副本</Action>
          </Reveal>
          <Reveal className="rank-preview" delay={0.1}>
            <div className="rank-preview-head"><span>SEASON 04 / TOP TEAMS</span><Action to="/leaderboard" variant="text">完整排行榜</Action></div>
            {leaderboard.slice(0, 3).map((team) => <DataRule key={team.code} label={`${String(team.rank).padStart(2, '0')}  ${team.name}`} value={team.alpha.toFixed(1)} tone={team.rank === 1 ? 'acid' : 'neutral'} />)}
            <div className="reward-progress"><CircleCheck size={18} /><span>完成 3 次副本，可解锁高级归因报告</span><b>2 / 3</b></div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
