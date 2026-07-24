import React, { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import { AppShell } from './components/AppShell.jsx'
const HomePage = lazy(() => import('./pages/HomePage.jsx').then((module) => ({ default: module.HomePage })))
const AgentsPage = lazy(() => import('./pages/AgentsPage.jsx').then((module) => ({ default: module.AgentsPage })))
const AgentDetailPage = lazy(() => import('./pages/AgentDetailPage.jsx').then((module) => ({ default: module.AgentDetailPage })))
const TeamPage = lazy(() => import('./pages/TeamPage.jsx').then((module) => ({ default: module.TeamPage })))
const EventsPage = lazy(() => import('./pages/EventsPage.jsx').then((module) => ({ default: module.EventsPage })))
const RuntimePage = lazy(() => import('./pages/RuntimePage.jsx').then((module) => ({ default: module.RuntimePage })))
const ResultPage = lazy(() => import('./pages/ResultPage.jsx').then((module) => ({ default: module.ResultPage })))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage.jsx').then((module) => ({ default: module.LeaderboardPage })))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export default function App() {
  return (
    <Tooltip.Provider delayDuration={240}>
      <ScrollToTop />
      <AppShell>
        <Suspense fallback={<div className="route-loading">正在加载界面…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:id" element={<AgentDetailPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/runtime" element={<RuntimePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Tooltip.Provider>
  )
}
