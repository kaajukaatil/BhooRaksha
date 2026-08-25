import { countByBand, formatDateTime } from '../utils.js'

const UNITS = [
  { key: 'ndrf',   label: 'NDRF Teams',             color: '#ec4899', base: 2, perVH: 1.5 },
  { key: 'sdrf',   label: 'State Disaster Response', color: '#a855f7', base: 4, perVH: 2   },
  { key: 'dist',   label: 'District Admin',           color: '#3b82f6', base: 6, perVH: 1   },
  { key: 'police', label: 'Local Police',             color: '#14b8a6', base: 8, perVH: 1   },
]

export default function ResponseUnitsCard({ nodes, lastFetch }) {
  const counts = countByBand(nodes)
  const vhCount = counts['Very High'] || 0
  const hCount  = counts['High'] || 0

  return (
    <div className="card mx-2 mt-2 mb-2" style={{ flexShrink: 0 }}>
      <div className="px-3 pt-2.5 pb-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span className="section-header">Response Units Available</span>
      </div>

      <div className="px-3 py-2">
        {UNITS.map(u => {
          const count = Math.round(u.base + vhCount * u.perVH + hCount * (u.perVH / 2))
          return (
            <div key={u.key}
                 className="flex items-center justify-between py-2"
                 style={{ borderBottom: '1px solid #1f1f1f' }}>
              <div className="flex items-center gap-2">
                {/* Magenta/colored bullet */}
                <div className="flex-shrink-0 flex items-center justify-center"
                     style={{ width: 20, height: 20 }}>
                  <span style={{ fontSize: 16, color: u.color, lineHeight: 1 }}>●</span>
                </div>
                <span style={{ fontSize: 11, color: '#cfcfcf' }}>{u.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 700, color: u.color }}>{count}</span>
                <span style={{ fontSize: 9, color: '#4a4a4a' }}>UNITS</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Readiness bar */}
      <div className="px-3 pb-3">
        <div className="flex justify-between mb-1 mt-2">
          <span style={{ fontSize: 10, color: '#6a6a6a' }}>Operational Readiness</span>
          <span style={{ fontSize: 10, color: '#22c55e' }}>87%</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#252525' }}>
          <div className="bar-animate h-full rounded-full"
               style={{ width: '87%', background: 'linear-gradient(90deg, #22c55e, #14b8a6)' }} />
        </div>
      </div>

      <div className="flex justify-end px-3 pb-2">
        <span className="card-footer-time">Last updated: {formatDateTime(lastFetch)}</span>
      </div>
    </div>
  )
}
