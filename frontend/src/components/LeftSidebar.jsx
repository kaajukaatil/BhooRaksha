import { useState } from 'react'
import { ChevronDown, ChevronRight, MapPin, TriangleAlert, Shield, TrendingUp, Link2 } from 'lucide-react'
import { getRiskColor, countByBand } from '../utils.js'

const LEGEND_ITEMS = [
  { icon: <MapPin size={13} color="#3b82f6" />, label: 'Monitoring Node' },
  { icon: <TriangleAlert size={13} color="#ef4444" />, label: 'Very High Risk Zone' },
  { icon: <Shield size={13} color="#22c55e" />, label: 'NDRF Support Unit' },
]

const RISK_FLAGS = [
  { band: 'Very High', color: '#ef4444', flag: '🚨' },
  { band: 'High',      color: '#f97316', flag: '🔴' },
  { band: 'Moderate',  color: '#eab308', flag: '🟡' },
  { band: 'Low',       color: '#22c55e', flag: '🟢' },
]

const LINKS = [
  'NDMA Guidelines',
  'IMD Rainfall Data',
  'GSI Hazard Atlas',
  'State EOC Portal',
]

export default function LeftSidebar({ nodes, selectedNode, onSelectNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('ai')
  const counts = countByBand(nodes)

  const avgRisk = nodes.length
    ? (nodes.reduce((s, n) => s + n.dynamic_risk_score, 0) / nodes.length).toFixed(1)
    : '0.0'

  if (collapsed) {
    return (
      <aside
        className="flex flex-col items-center py-3 gap-3 flex-shrink-0"
        style={{ width: 36, background: '#111111', borderRight: '1px solid #2a2a2a' }}
      >
        <button onClick={() => setCollapsed(false)} className="p-1 rounded hover:bg-[#252525] transition-colors">
          <ChevronRight size={14} color="#cfcfcf" />
        </button>
        <div style={{ writingMode: 'vertical-rl', fontSize: 10, letterSpacing: '0.12em', color: '#6a6a6a' }}>
          LEGEND
        </div>
      </aside>
    )
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 240, background: '#111111', borderRight: '1px solid #2a2a2a' }}
    >
      {/* Legend header */}
      <div className="flex items-center justify-between px-3 py-2.5"
           style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span className="section-header">Legend</span>
        <button onClick={() => setCollapsed(true)}
          className="p-0.5 rounded hover:bg-[#252525] transition-colors">
          <ChevronDown size={13} color="#6a6a6a" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {/* Marker types */}
        <div className="px-3 py-2">
          <div style={{ fontSize: 10, color: '#6a6a6a', letterSpacing: '0.08em', marginBottom: 8 }}>
            MAP MARKERS
          </div>
          {LEGEND_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              {item.icon}
              <span style={{ fontSize: 12, color: '#cfcfcf' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 12px' }} />

        {/* Risk zone counts */}
        <div className="px-3 py-2">
          <div style={{ fontSize: 10, color: '#6a6a6a', letterSpacing: '0.08em', marginBottom: 8 }}>
            RISK ZONE COUNTS
          </div>
          {RISK_FLAGS.map(({ band, color, flag }) => (
            <div key={band}
              className="flex items-center justify-between py-1.5 px-2 rounded mb-1 cursor-pointer transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12 }}>{flag}</span>
                <span style={{ fontSize: 12, color: '#cfcfcf' }}>{band}</span>
              </div>
              <span className="font-semibold text-xs px-1.5 py-0.5 rounded"
                    style={{ background: color + '22', color, border: `1px solid ${color}55` }}>
                {counts[band] || 0}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 12px' }} />

        {/* Node list */}
        <div className="px-3 py-2">
          <div style={{ fontSize: 10, color: '#6a6a6a', letterSpacing: '0.08em', marginBottom: 8 }}>
            MONITORING NODES
          </div>
          <div className="flex flex-col gap-0.5">
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id
              const color = getRiskColor(node.risk_band)
              return (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(isSelected ? null : node)}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-left w-full transition-colors"
                  style={{
                    background: isSelected ? '#1e293b' : 'transparent',
                    border: isSelected ? '1px solid #3b82f688' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                    <span className="truncate" style={{ fontSize: 11, color: '#cfcfcf' }}>
                      {node.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color, flexShrink: 0 }}>
                    {node.dynamic_risk_score.toFixed(0)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 12px' }} />

        {/* Tabs */}
        <div>
          <div className="flex" style={{ borderBottom: '1px solid #2a2a2a' }}>
            {[
              { key: 'ai', label: 'AI Risk Score' },
              { key: 'model', label: 'Model Params' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2 text-center transition-colors"
                style={{
                  fontSize: 10,
                  color: activeTab === tab.key ? '#fff' : '#6a6a6a',
                  borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                  background: 'transparent',
                  letterSpacing: '0.06em',
                }}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'ai' ? (
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} color="#8b5cf6" />
                <span style={{ fontSize: 11, color: '#cfcfcf' }}>Average AI Risk Score</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span style={{ fontSize: 32, fontWeight: 700, color: '#e8e8e8', lineHeight: 1 }}>
                  {avgRisk}
                </span>
                <span style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 4 }}>/100</span>
              </div>
              {/* Mini sparkline bars */}
              <div className="flex items-end gap-0.5 h-10 mt-3">
                {nodes.slice(0, 17).map(n => (
                  <div key={n.id}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${Math.max(4, n.dynamic_risk_score)}%`,
                      background: getRiskColor(n.risk_band),
                      opacity: 0.7
                    }}
                    title={`${n.name}: ${n.dynamic_risk_score.toFixed(1)}`}
                  />
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 4 }}>
                Scores across all nodes
              </div>
            </div>
          ) : (
            <div className="px-3 py-3">
              <div style={{ fontSize: 11, color: '#cfcfcf', marginBottom: 8 }}>
                Random Forest Classifier
              </div>
              {[
                { label: 'Algorithm', value: 'Random Forest' },
                { label: 'Features', value: '3 inputs' },
                { label: 'Output', value: 'predict_proba' },
                { label: 'Scale', value: 'Susc. ÷ 100' },
                { label: 'Threshold', value: '≥50 → Alert' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1"
                     style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: 10, color: '#6a6a6a' }}>{label}</span>
                  <span style={{ fontSize: 10, color: '#a0a0a0' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 12px' }} />

        {/* Links */}
        <div className="px-3 py-2 pb-4">
          <div style={{ fontSize: 10, color: '#6a6a6a', letterSpacing: '0.08em', marginBottom: 8 }}>
            QUICK LINKS
          </div>
          {LINKS.map(link => (
            <div key={link} className="flex items-center gap-2 py-1.5 cursor-pointer group">
              <Link2 size={10} color="#3b82f6" />
              <span style={{ fontSize: 11, color: '#6a6a6a' }}
                    className="group-hover:text-[#a0a0a0] transition-colors">
                {link}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
