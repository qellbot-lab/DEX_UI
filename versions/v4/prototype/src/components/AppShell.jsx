import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { TEAM_CAPACITY, useDemo } from '../state.jsx'

const nav = [
  ['/agents', '智能体'], ['/team', '战队'], ['/events', '历史副本'], ['/leaderboard', '排行榜'],
]

const steps = ['/agents', '/team', '/events', '/runtime', '/result']

export function AppShell({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { selectedAgentIds } = useDemo()
  const stepIndex = steps.findIndex((path) => location.pathname.startsWith(path))

  return (
    <div className="app-frame">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="QELL 首页">
          <img src="/assets/logos/qell-logo.svg" alt="QELL" />
          <span>PREPDEX</span>
        </Link>
        <nav id="main-navigation" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="主导航">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
        <div className="header-status">
          <span className="live-dot" aria-hidden="true" />
          <span>PAPER DEMO</span>
          <Link className="team-count" to="/team">TEAM {selectedAgentIds.length}/{TEAM_CAPACITY}</Link>
        </div>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="切换导航" aria-expanded={open} aria-controls="main-navigation">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {stepIndex >= 0 && (
        <div className="journey-rail" aria-label="体验进度">
          {steps.map((path, index) => (
            <span key={path} className={index === stepIndex ? 'is-current' : index < stepIndex ? 'is-past' : ''} />
          ))}
        </div>
      )}

      <main>{children}</main>

      <footer className="site-footer">
        <div><img src="/assets/logos/qell-q-logo.svg" alt="" /><span>QELL PREPDEX</span></div>
        <p>公开信号的历史模拟界面。所有数据均为演示，不构成投资建议。</p>
        <span>V4 / 2026</span>
      </footer>
    </div>
  )
}
