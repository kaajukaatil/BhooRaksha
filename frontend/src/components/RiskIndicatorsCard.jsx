import { useState } from 'react'
import { countByBand, formatDateTime } from '../utils.js'

const BAND_CONFIG = [
  { band: 'Very High', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { band: 'High',      color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { band: 'Moderate',  color: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  { band: 'Low',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
]

function HBar({ label, value, max, color, bg }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{ fontSize: 10, color: '#a0a0a0', width: 58, flexShrink: 0 }}>{label}</span>
      <div className="flex-1 rounded-sm overflow-hidden" style={{ height: 10, background: '#252525' }}>
        <div
          className="bar-animate h-full rounded-sm"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>
      <span style={{ fontSize: 10, color, width: 16, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  )
}

export default function RiskIndicatorsCard({ nodes, lastFetch }) {
  const [activeTab, setActiveTab] = useState('general')
  const counts = countByBand(nodes)
  const maxCount = Math.max(...Object.values(counts), 1)

  // "By District" view groups by state
  const byState = nodes.reduce((acc, n) => {
    acc[n.state] = acc[n.state] || []
    acc[n.state].push(n)
    return acc
  }, {})

  const stateHighest = Object.entries(byState).map(([state, snodes]) => {
    const worst = snodes.reduce((a, b) => b.dynamic_risk_score > a.dynamic_risk_score ? b : a)
    return { state, count: snodes.length, score: worst.dynamic_risk_score, band: worst.risk_band }
  }).sort((a, b) => b.score - a.score).slice(0, 6)

  return (
    <div className="card mx-2 mt-2" style={{ flexShrink: 0 }}>
      {/* Header + tabs */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0"
           style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span className="section-header">Verified Risk Indicators</span>
        <div className="flex">
          {['general', 'district'].map(t => (
            <button key={t}
              onClick={() => setActiveTab(t)}
              style={{
                fontSize: 10,
                color: activeTab === t ? '#fff' : '#6a6a6a',
                padding: '4px 10px',
                background: 'transparent',
                borderBottom: activeTab === t ? '2px solid #3b82f6' : '2px solid transparent',
                letterSpacing: '0.06em',
              }}>
              {t === 'general' ? 'GENERAL' : 'BY DISTRICT'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-3">
        {activeTab === 'general' ? (
          BAND_CONFIG.map(({ band, color, bg }) => (
            <HBar key={band} label={band} value={counts[band] || 0} max={maxCount} color={color} bg={bg} />
          ))
        ) : (
          stateHighest.map(({ state, count, score, band }) => {
            const color = band === 'Very High' ? '#ef4444'
                        : band === 'High' ? '#f97316'
                        : band === 'Moderate' ? '#eab308' : '#22c55e'
            return (
              <HBar key={state} label={state.split('/')[0].slice(0, 10)}
                    value={Math.round(score)} max={100} color={color} />
            )
          })
        )}
      </div>

      <div className="flex justify-end px-3 pb-2">
        <span className="card-footer-time">Last updated: {formatDateTime(lastFetch)}</span>
      </div>
    </div>
  )
}
