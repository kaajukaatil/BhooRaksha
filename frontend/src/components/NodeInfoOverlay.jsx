import { getRiskColor } from '../utils.js'

export default function NodeInfoOverlay({ selectedNode, onClose, className = '', style = {} }) {
  if (!selectedNode) return null

  return (
    <div className={`card p-3 ${className}`}
         style={{ minWidth: 200, maxWidth: 260, ...style }}>
      <div className="flex items-center justify-between mb-2">
        <span className="section-header" style={{ fontSize: 10 }}>Selected Node</span>
        <button onClick={onClose}
          style={{ fontSize: 14, color: '#6a6a6a', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>
          ✕
        </button>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 2 }}>
        {selectedNode.name}
      </div>
      <div style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 6 }}>
        {selectedNode.state}
      </div>

      <div className="flex justify-between">
        <span style={{ fontSize: 11, color: '#a0a0a0' }}>AI Risk Score</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: getRiskColor(selectedNode.risk_band) }}>
          {selectedNode.dynamic_risk_score.toFixed(1)}
        </span>
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 11, color: '#a0a0a0' }}>Band</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: getRiskColor(selectedNode.risk_band) }}>
          {selectedNode.risk_band}
        </span>
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 11, color: '#a0a0a0' }}>Static Susceptibility</span>
        <span style={{ fontSize: 11, color: '#cfcfcf' }}>
          {selectedNode.static_susceptibility}
        </span>
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 11, color: '#a0a0a0' }}>Location</span>
        <span style={{ fontSize: 10, color: '#6a6a6a' }}>
          {selectedNode.lat.toFixed(4)}, {selectedNode.lon.toFixed(4)}
        </span>
      </div>
    </div>
  )
}
