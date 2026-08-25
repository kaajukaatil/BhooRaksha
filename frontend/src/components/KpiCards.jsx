import { TriangleAlert, TrendingUp, Radio } from 'lucide-react'

const KPI_DEFS = [
  {
    key: 'critical',
    label: 'Critical Alerts',
    icon: <TriangleAlert size={20} color="#fff" />,
    bg: 'linear-gradient(135deg, #b91c1c, #ef4444)',
    border: '#ef444455',
    getValue: nodes => nodes.filter(n => n.risk_band === 'Very High').length,
  },
  {
    key: 'high',
    label: 'High Risk Zones',
    icon: <TrendingUp size={20} color="#fff" />,
    bg: 'linear-gradient(135deg, #c2410c, #f97316)',
    border: '#f9731655',
    getValue: nodes => nodes.filter(n => n.risk_band === 'High').length,
  },
  {
    key: 'monitored',
    label: 'Nodes Monitored',
    icon: <Radio size={20} color="#fff" />,
    bg: 'linear-gradient(135deg, #854d0e, #eab308)',
    border: '#eab30855',
    getValue: nodes => nodes.length,
  },
]

export default function KpiCards({ nodes }) {
  return (
    <div className="flex gap-2 px-2 py-2">
      {KPI_DEFS.map(kpi => (
        <div
          key={kpi.key}
          className="flex-1 rounded flex flex-col items-center justify-center py-3 gap-1"
          style={{
            background: kpi.bg,
            border: `1px solid ${kpi.border}`,
            boxShadow: `0 4px 12px ${kpi.border}`,
          }}
        >
          {kpi.icon}
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {kpi.getValue(nodes)}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textAlign: 'center' }}>
            {kpi.label.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  )
}
