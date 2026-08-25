import { calcInfraAtRisk, formatDateTime } from '../utils.js'

const INFRA_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

function HBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{ fontSize: 10, color: '#a0a0a0', width: 80, flexShrink: 0 }}>{label}</span>
      <div className="flex-1 rounded-sm overflow-hidden" style={{ height: 10, background: '#252525' }}>
        <div
          className="bar-animate h-full rounded-sm"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>
      <span style={{ fontSize: 10, color, width: 28, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  )
}

export default function InfraRiskCard({ nodes, lastFetch }) {
  const infra = calcInfraAtRisk(nodes)
  const entries = Object.entries(infra)
  const maxVal = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="card mx-2 mt-2" style={{ flexShrink: 0 }}>
      <div className="px-3 pt-2.5 pb-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span className="section-header">Infrastructure at Risk</span>
      </div>
      <div className="px-3 py-3">
        {entries.map(([label, value], i) => (
          <HBar key={label} label={label} value={value} max={maxVal} color={INFRA_COLORS[i]} />
        ))}
      </div>
      <div className="flex justify-end px-3 pb-2">
        <span className="card-footer-time">Last updated: {formatDateTime(lastFetch)}</span>
      </div>
    </div>
  )
}
