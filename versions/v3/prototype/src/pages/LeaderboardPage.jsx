import React, { useState } from 'react'
import { ArrowUpRight, Medal, Trophy } from 'lucide-react'
import { leaderboard } from '../data.js'
import { Action, DataRule, EditorialTitle, Eyebrow, Reveal, SectionHead, SignalBar, Tag } from '../components/UI.jsx'

export function LeaderboardPage() {
  const [period, setPeriod] = useState('赛季')
  const [dimension, setDimension] = useState('综合 Alpha')
  const [selected, setSelected] = useState(leaderboard[5])

  return (
    <div className="page leaderboard-page">
      <section className="leaderboard-field chapter">
        <Reveal className="leaderboard-title"><Eyebrow index="01">ALPHA RANK FIELD</Eyebrow><EditorialTitle desktop={['让策略表现', { text: '公开、可比较、', tone: 'muted' }, { text: '可验证。', tone: 'muted' }]} mobile={['让策略表现', { text: '公开、可比较、', tone: 'muted' }, { text: '可验证。', tone: 'muted' }]} /><p>按收益、稳定、回撤与执行质量综合比较战队在不同市场中的表现。</p></Reveal>
        <Reveal className="season-mark" delay={0.08}><span>SEASON 04</span><b>18</b><small>DAYS REMAINING</small></Reveal>
        <Reveal className="leaderboard-controls"><div>{['赛季', '月度', '全部'].map((item) => <button key={item} className={period === item ? 'is-active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div><label><span>排名维度</span><select value={dimension} onChange={(event) => setDimension(event.target.value)}><option>综合 Alpha</option><option>风险控制</option><option>执行质量</option><option>协同稳定</option></select></label></Reveal>

        <div className="leaderboard-layout">
          <Reveal className="rank-table">
            <div className="rank-table-head"><span>RANK / TEAM</span><span>ALPHA</span><span>DD</span><span>CONSISTENCY</span><span>MOVE</span></div>
            {leaderboard.map((team) => <button key={team.code} className={`${selected.code === team.code ? 'is-selected' : ''} ${team.mine ? 'is-mine' : ''}`} onClick={() => setSelected(team)}><span className="rank-number">{String(team.rank).padStart(2, '0')}</span><span className="rank-name"><b>{team.name}</b><small>{team.code}{team.mine ? ' · YOU' : ''}</small></span><strong>{team.alpha}</strong><em>−{team.drawdown}%</em><span>{team.consistency}</span><i>{team.trend}</i></button>)}
          </Reveal>
          <Reveal className="rank-profile" delay={0.06}>
            <div className="profile-rank"><span>SELECTED TEAM</span><b>#{String(selected.rank).padStart(2, '0')}</b></div>
            <h2>{selected.name}</h2><p>{selected.code} · {period} · {dimension}</p>
            <div className="profile-score"><span>ALPHA SCORE</span><b>{selected.alpha}</b><small>/ 100</small></div>
            <SignalBar label="稳定性" value={selected.consistency} /><SignalBar label="回撤控制" value={100 - selected.drawdown * 2} tone="rose" /><SignalBar label="执行质量" value={86} tone="cyan" />
            <div className="profile-skills"><Tag>Liquidity Scan</Tag><Tag>Risk Gate</Tag><Tag>Execution Router</Tag></div>
            {selected.mine && <Action to="/result" variant="secondary">查看最近结果</Action>}
          </Reveal>
        </div>
      </section>

      <section className="progress-chapter chapter">
        <Reveal><SectionHead index="02" eyebrow="YOUR PROGRESSION" title="追踪策略的长期可重复性" text="把排名变化与副本表现放在一起，识别进步来自运气还是稳定结构。" /></Reveal>
        <div className="progress-layout">
          <Reveal className="personal-progress">
            <div className="personal-rank"><span>你的当前排名</span><b>#06</b><em><ArrowUpRight size={16} /> 本季上升 7 位</em></div>
            <div className="rank-trajectory">{[['07/01', 13], ['07/06', 11], ['07/10', 12], ['07/14', 8], ['07/18', 6]].map(([date, rank]) => <div key={date}><i style={{ height: `${(15 - rank) * 8 + 18}px` }} /><span>{date}</span><b>#{rank}</b></div>)}</div>
          </Reveal>
          <Reveal className="reward-ladder" delay={0.06}>
            <div className="instrument-head"><span>SEASON REWARD LADDER</span><b>2,840 PTS</b></div>
            {[['01', '1,000', '基础归因报告', true], ['02', '2,500', '高级团队分析', true], ['03', '5,000', '隐藏历史副本', false], ['04', '8,000', '赛季徽记', false]].map(([step, points, label, unlocked]) => <div className={unlocked ? 'reward-row is-unlocked' : 'reward-row'} key={step}><span>{step}</span><div><b>{label}</b><small>{points} PTS</small></div>{unlocked ? <Medal size={17} /> : <Trophy size={17} />}</div>)}
          </Reveal>
          <Reveal className="recent-runs" delay={0.12}>
            <div className="instrument-head"><span>RECENT RUNS</span><b>03</b></div>
            <DataRule label="2008 全球金融危机" value="+18.6%" tone="acid" /><DataRule label="2022 加密寒冬" value="+7.2%" tone="acid" /><DataRule label="2000 互联网泡沫" value="−3.8%" tone="risk" />
            <Action to="/result" variant="text">打开最新复盘</Action>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
