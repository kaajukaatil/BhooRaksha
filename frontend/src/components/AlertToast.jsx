import { useEffect, useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { getRiskColor } from '../utils.js'

export default function AlertToast({ alerts, onDismiss }) {
  return (
    <div className="fixed top-14 right-3 z-[9999] flex flex-col gap-2 pointer-events-none"
         style={{ maxWidth: 300 }}>
      {alerts.map(alert => (
        <AlertItem key={alert._id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function AlertItem({ alert, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const color = getRiskColor(alert.risk_band)

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(alert._id), 400)
    }, 5000)
    return () => clearTimeout(t)
  }, [alert._id, onDismiss])

  return (
    <div
      className={`alert-toast pointer-events-auto rounded overflow-hidden`}
      style={{
        background: '#1a1a1a',
        border: `1px solid ${color}88`,
        boxShadow: `0 4px 20px ${color}33`,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(110%)' : 'translateX(0)',
        transition: exiting ? 'all 0.35s ease-in' : undefined,
      }}
    >
      {/* Colored top strip */}
      <div style={{ height: 3, background: color, width: '100%' }} />
      <div className="flex items-start gap-2 px-3 py-2.5">
        <TriangleAlert size={14} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#e8e8e8', marginBottom: 2 }}>
            ⚠ {alert.risk_band} Alert — {alert.node_name}
          </div>
          <div style={{ fontSize: 10, color: '#a0a0a0' }}>
            AI Risk Score: <span style={{ color, fontWeight: 600 }}>{alert.risk_score.toFixed(1)}</span>
          </div>
          <div style={{ fontSize: 9, color: '#4a4a4a', marginTop: 2 }}>
            {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
          </div>
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(() => onDismiss(alert._id), 400) }}
          className="flex-shrink-0 mt-0.5 opacity-40 hover:opacity-100 transition-opacity"
        >
          <X size={12} color="#cfcfcf" />
        </button>
      </div>
    </div>
  )
}
