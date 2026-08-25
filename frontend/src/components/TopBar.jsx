import { useState } from 'react'
import { 
  AlertTriangle, Activity, CloudRain, RefreshCw, 
  Map, Globe, Navigation, FileText, LayoutDashboard, MessageSquarePlus, Box, CloudSun
} from 'lucide-react'
import { simulateRainfallEvent } from '../api.js'
import { formatDateTime } from '../utils.js'

export default function TopBar({ 
  nodes, 
  onSimulateSuccess, 
  lastFetch, 
  wsConnected, 
  viewMode, 
  onViewModeChange,
  activePage,
  onNavigate
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ node_id: 1, intensity_mmhr: 45, duration_hr: 12 })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const result = await simulateRainfallEvent(
        Number(form.node_id),
        Number(form.intensity_mmhr),
        Number(form.duration_hr)
      )
      onSimulateSuccess(result)
      setOpen(false)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header
        style={{ background: '#111111', borderBottom: '1px solid #2a2a2a' }}
        className="flex items-center justify-between px-4 py-2 flex-shrink-0 relative z-50"
      >
        {/* Left: Logo + title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded cursor-pointer transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
          >
            <AlertTriangle size={16} color="#fff" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide flex items-center gap-2" style={{ color: '#e8e8e8' }}>
              <span className="tracking-wider">BHOORAKSHA</span>
            </div>
            <div style={{ fontSize: 10, color: '#888888', letterSpacing: '0.05em' }}>
              AI Landslide Early Warning &amp; Evacuation Intelligence Platform
            </div>
          </div>
        </div>

        {/* Center: Top Page Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#181818', border: '1px solid #2d2d2d' }}>
          {[
            { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
            { id: 'routing', label: 'Safe Routing', icon: Navigation },
            { id: 'citizen', label: 'Citizen Reports', icon: MessageSquarePlus },
            { id: 'weather', label: 'Live Weather', icon: CloudSun },
            { id: 'overview', label: 'Project Overview', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon
            const active = activePage === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#222]'
                }`}
              >
                <Icon size={13} className={active ? 'text-white' : 'text-gray-500'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right actions + View Toggles */}
        <div className="flex items-center gap-2.5">
          {/* Status pills */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded"
                 style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span style={{ fontSize: 10, color: '#a0a0a0' }}>LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded"
                 style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <Activity size={10} color="#22c55e" />
              <span style={{ fontSize: 10, color: '#a0a0a0' }}>{nodes.length} NODES</span>
            </div>
          </div>

          {/* 2D GIS / 3D Blender Terrain View Toggle (Shown on Dashboard) */}
          {activePage === 'dashboard' && (
            <div className="flex rounded overflow-hidden"
                 style={{ border: '1px solid #3a3a3a' }}>
              <button
                onClick={() => onViewModeChange('2d')}
                className="flex items-center gap-1 px-2.5 py-1 transition-colors"
                style={{
                  background: viewMode === '2d' ? '#1d4ed8' : '#1a1a1a',
                  color: viewMode === '2d' ? '#fff' : '#6a6a6a',
                  fontSize: 10,
                  fontWeight: viewMode === '2d' ? 600 : 400,
                }}
              >
                <Map size={10} />
                2D GIS
              </button>
              <button
                onClick={() => onViewModeChange('3d')}
                className="flex items-center gap-1 px-2.5 py-1 transition-colors"
                style={{
                  background: viewMode === '3d' ? '#1d4ed8' : '#1a1a1a',
                  color: viewMode === '3d' ? '#fff' : '#6a6a6a',
                  fontSize: 10,
                  fontWeight: viewMode === '3d' ? 600 : 400,
                  borderLeft: '1px solid #3a3a3a',
                }}
              >
                <Box size={10} />
                3D BLENDER TERRAIN
              </button>
            </div>
          )}

          {/* Simulate Button */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded font-medium text-xs transition-all"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              border: '1px solid #3b82f6',
              color: '#fff',
              boxShadow: '0 0 12px rgba(59,130,246,0.3)'
            }}
          >
            <CloudRain size={13} />
            Simulate Rainfall
          </button>
        </div>
      </header>

      {/* Simulation Modal */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
             onClick={() => setOpen(false)}>
          <div className="card p-6 w-96" style={{ border: '1px solid #3a3a3a' }}
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <CloudRain size={16} color="#3b82f6" />
              <span className="section-header">Simulate Rainfall Event</span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span style={{ fontSize: 11, color: '#a0a0a0' }}>Target Monitoring Node</span>
                <select
                  value={form.node_id}
                  onChange={e => setForm(f => ({ ...f, node_id: e.target.value }))}
                  className="rounded px-2 py-1.5 text-sm outline-none"
                  style={{ background: '#252525', border: '1px solid #3a3a3a', color: '#e8e8e8' }}
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      #{n.id} — {n.name} ({n.state}) • Static: {n.static_susceptibility}%
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span style={{ fontSize: 11, color: '#a0a0a0' }}>
                  Rainfall Intensity (mm/hr)
                </span>
                <input
                  type="number" min="0" max="200" step="0.1"
                  value={form.intensity_mmhr}
                  onChange={e => setForm(f => ({ ...f, intensity_mmhr: e.target.value }))}
                  className="rounded px-2 py-1.5 text-sm outline-none"
                  style={{ background: '#252525', border: '1px solid #3a3a3a', color: '#e8e8e8' }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span style={{ fontSize: 11, color: '#a0a0a0' }}>Duration (hours)</span>
                <input
                  type="number" min="0.5" max="72" step="0.5"
                  value={form.duration_hr}
                  onChange={e => setForm(f => ({ ...f, duration_hr: e.target.value }))}
                  className="rounded px-2 py-1.5 text-sm outline-none"
                  style={{ background: '#252525', border: '1px solid #3a3a3a', color: '#e8e8e8' }}
                />
              </label>

              {err && (
                <div className="text-xs px-2 py-1.5 rounded"
                     style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444' }}>
                  {err}
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-1.5 rounded text-xs transition-colors"
                  style={{ background: '#252525', border: '1px solid #3a3a3a', color: '#a0a0a0' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-1.5 rounded text-xs font-medium transition-all"
                  style={{
                    background: loading ? '#1d4ed8aa' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    border: '1px solid #3b82f6',
                    color: '#fff'
                  }}>
                  {loading ? 'Running Simulation...' : 'Run Simulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
