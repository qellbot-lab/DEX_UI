import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useDemo } from '../state.jsx'

export function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ index, children, tone = 'acid' }) {
  return <div className={`eyebrow tone-${tone}`}><span>{index}</span>{children}</div>
}

export function SectionHead({ index, eyebrow, title, text, align = 'left' }) {
  return (
    <div className={`section-head align-${align}`}>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

export function EditorialTitle({ as = 'h1', desktop, mobile = desktop, className = '' }) {
  const Heading = as
  const accessibleLabel = desktop.map((line) => typeof line === 'string' ? line : line.text).join('')
  const renderLines = (lines) => lines.map((line, index) => {
    const item = typeof line === 'string' ? { text: line } : line
    return <span className={`editorial-title-line ${item.tone ? `is-${item.tone}` : ''}`} key={`${item.text}-${index}`}>{item.text}</span>
  })

  return (
    <Heading className={`editorial-title ${className}`}>
      <span className="editorial-title-copy editorial-title-desktop" aria-hidden="true">{renderLines(desktop)}</span>
      <span className="editorial-title-copy editorial-title-mobile" aria-hidden="true">{renderLines(mobile)}</span>
      <span className="sr-only">{accessibleLabel}</span>
    </Heading>
  )
}

export function Action({ to, children, variant = 'primary', icon = true, onClick, disabled = false }) {
  const className = `action action-${variant} ${disabled ? 'is-disabled' : ''}`
  const refracts = variant === 'primary' || variant === 'secondary'
  const moveRefraction = (event) => {
    if (!refracts || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.dataset.hovered = 'true'
    event.currentTarget.style.setProperty('--refraction-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--refraction-y', `${event.clientY - rect.top}px`)
  }
  const enterRefraction = (event) => {
    if (refracts && event.pointerType !== 'touch') event.currentTarget.dataset.hovered = 'true'
  }
  const leaveRefraction = (event) => {
    if (refracts) delete event.currentTarget.dataset.hovered
  }
  const content = <><span className="action-label">{children}</span>{icon && <ArrowRight size={16} strokeWidth={1.7} />}</>
  const interactionProps = { onPointerMove: moveRefraction, onPointerEnter: enterRefraction, onPointerLeave: leaveRefraction, 'data-refraction': refracts ? 'true' : undefined }
  if (to && !disabled) return <Link className={className} to={to} {...interactionProps}>{content}</Link>
  return <button className={className} onClick={onClick} disabled={disabled} {...interactionProps}>{content}</button>
}

export function Metric({ label, value, suffix, tone = 'default', note }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}<small>{suffix}</small></strong>
      {note && <em>{note}</em>}
    </div>
  )
}

export function SignalBar({ label, value, tone = 'acid', compact = false }) {
  return (
    <div className={`signal-bar ${compact ? 'is-compact' : ''}`}>
      <div><span>{label}</span><b>{value}</b></div>
      <div className="signal-track"><i className={`tone-${tone}`} style={{ width: `${Math.max(4, Math.min(value, 100))}%` }} /></div>
    </div>
  )
}

export function AgentPlate({ agent, selected = false, interactive = false, size = 'regular', onSelect, showAction = false }) {
  const demo = useDemo()
  const inTeam = demo.selectedAgentIds.includes(agent.id)
  const maxed = demo.selectedAgentIds.length >= 3 && !inTeam
  const toggle = (event) => {
    event.stopPropagation()
    if (inTeam) demo.removeAgent(agent.id)
    else if (!maxed) demo.addAgent(agent.id)
  }

  return (
    <article
      className={`agent-plate size-${size} tone-${agent.color} ${selected ? 'is-selected' : ''} ${interactive ? 'is-interactive' : ''}`}
      onClick={onSelect}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-label={interactive ? `${agent.name}，${agent.role}策略智能体` : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.() }
      } : undefined}
    >
      <div className="plate-register"><span>{agent.code}</span><span>{agent.role}</span></div>
      <div className="plate-name"><h3>{agent.name}</h3><p>{agent.latin}</p></div>
      <div className="plate-thesis">{agent.thesis}</div>
      <div className="plate-metrics">
        <span><b>+{agent.return}%</b> 模拟收益</span>
        <span><b>{agent.risk}</b> 风险</span>
      </div>
      <div className="plate-factor-row">{agent.factors.map((factor) => <span key={factor}>{factor}</span>)}</div>
      {showAction && (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="plate-toggle" disabled={maxed} onClick={toggle} aria-label={inTeam ? `移除${agent.name}` : `加入${agent.name}`}>
              {inTeam ? <Check size={16} /> : maxed ? <Minus size={16} /> : <Plus size={16} />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal><Tooltip.Content className="tooltip" sideOffset={8}>{inTeam ? '从战队移除' : maxed ? '战队已满' : '加入战队'}</Tooltip.Content></Tooltip.Portal>
        </Tooltip.Root>
      )}
    </article>
  )
}

export function Tag({ children, tone = 'neutral' }) {
  return <span className={`tag tone-${tone}`}>{children}</span>
}

export function DataRule({ label, value, tone = 'neutral' }) {
  return <div className={`data-rule tone-${tone}`}><span>{label}</span><b>{value}</b></div>
}

export function EmptyAgentSlot({ index }) {
  return <div className="empty-agent-slot"><span>0{index}</span><p>等待加入 Agent</p><Link to="/agents">浏览智能体 <Plus size={14} /></Link></div>
}
