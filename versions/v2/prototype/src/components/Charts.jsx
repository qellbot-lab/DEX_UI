import React from 'react'
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { performanceData } from '../data.js'

const tooltipStyle = { background: 'var(--ink)', border: '1px solid var(--line-strong)', borderRadius: 0, color: 'var(--ivory)', fontSize: 12 }

export function PerformanceChart({ compact = false }) {
  return (
    <div className="chart-a11y" role="img" aria-label="战队收益与基准收益对比曲线">
    <ResponsiveContainer width="100%" height={compact ? 210 : 360}>
      <AreaChart data={performanceData} margin={{ top: 12, right: 8, left: compact ? -24 : -12, bottom: 0 }}>
        <defs>
          <linearGradient id="teamFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--acid)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--acid)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(242,245,236,.07)" />
        <XAxis dataKey="t" hide />
        <YAxis tick={{ fill: '#7f877e', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}%`, name === 'team' ? '战队' : '基准']} labelFormatter={() => ''} />
        <Area type="monotone" dataKey="team" stroke="var(--acid)" strokeWidth={2} fill="url(#teamFill)" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="benchmark" stroke="var(--muted)" strokeDasharray="5 6" strokeWidth={1.2} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  )
}

export function MarketChart({ candles = [], paused = false }) {
  const width = 420
  const height = 232
  const padding = { top: 28, right: 54, bottom: 30, left: 34 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const values = candles.flatMap((item) => [item.low, item.high])
  const min = values.length ? Math.min(...values) - 1 : 0
  const max = values.length ? Math.max(...values) + 1 : 100
  const range = Math.max(1, max - min)
  const xStep = chartWidth / Math.max(candles.length, 1)
  const candleWidth = Math.max(5, Math.min(11, xStep * 0.44))
  const y = (value) => padding.top + ((max - value) / range) * chartHeight
  const x = (index) => padding.left + xStep * index + xStep / 2
  const latest = candles.at(-1)
  const grid = Array.from({ length: 5 }, (_, index) => {
    const value = max - (range / 4) * index
    return { value, y: y(value) }
  })
  const tradeMarkers = candles.flatMap((candle, index) => {
    if (!candle.marker) return []
    const isBuyMarker = candle.marker.label === 'B'
    const markerY = isBuyMarker
      ? Math.min(height - padding.bottom - 8, y(candle.low) + 19)
      : Math.max(10, y(candle.high) - 19)
    return [{
      id: candle.id,
      label: candle.marker.label,
      tone: candle.marker.tone,
      left: `${(x(index) / width) * 100}%`,
      top: `${(markerY / height) * 100}%`,
    }]
  })

  return (
    <div className="chart-a11y runtime-market-chart" role="img" aria-label={`历史事件动态 K 线，当前指数 ${latest?.close?.toFixed(2) ?? '--'}`} data-paused={paused}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {grid.map((line) => (
          <g key={line.y}>
            <line x1={padding.left} x2={width - padding.right} y1={line.y} y2={line.y} className="market-grid-line" />
            <text x={width - 6} y={line.y + 3} textAnchor="end" className="market-axis-label">{line.value.toFixed(1)}</text>
          </g>
        ))}
        {candles.map((candle, index) => {
          const centerX = x(index)
          const openY = y(candle.open)
          const closeY = y(candle.close)
          const isUp = candle.close >= candle.open
          const bodyY = Math.min(openY, closeY)
          const bodyHeight = Math.max(2, Math.abs(closeY - openY))
          const isBuyMarker = candle.marker?.label === 'B'
          const markerY = isBuyMarker
            ? Math.min(height - padding.bottom - 8, y(candle.low) + 19)
            : Math.max(10, y(candle.high) - 19)
          return (
            <g key={candle.id} className={`runtime-candle ${isUp ? 'is-up' : 'is-down'}`}>
              <line x1={centerX} x2={centerX} y1={y(candle.high)} y2={y(candle.low)} className="candle-wick" />
              <rect x={centerX - candleWidth / 2} y={bodyY} width={candleWidth} height={bodyHeight} className="candle-body" />
              {candle.marker && (
                <g className={`trade-marker tone-${candle.marker.tone}`}>
                  <line x1={centerX} x2={centerX} y1={isBuyMarker ? y(candle.low) + 2 : y(candle.high) - 2} y2={markerY + (isBuyMarker ? -9 : 9)} />
                </g>
              )}
              {index % 5 === 0 && <text x={centerX} y={height - 8} textAnchor="middle" className="market-axis-label">{candle.t}</text>}
            </g>
          )
        })}
        {latest && (
          <g className="current-price-guide">
            <line x1={padding.left} x2={width - padding.right} y1={y(latest.close)} y2={y(latest.close)} />
            <circle cx={x(candles.length - 1)} cy={y(latest.close)} r="3" />
            <text x={width - 7} y={y(latest.close) - 7} textAnchor="end">{latest.close.toFixed(2)}</text>
          </g>
        )}
      </svg>
      <div className="trade-marker-layer" aria-hidden="true">
        {tradeMarkers.map((marker) => (
          <span
            key={marker.id}
            className={`trade-marker-pin tone-${marker.tone}`}
            style={{ left: marker.left, top: marker.top }}
          >
            {marker.label}
          </span>
        ))}
      </div>
    </div>
  )
}
