import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNodes, useWebSocketAlerts } from './api.js'
import { computeRiskFromWeather } from './utils.js'
import TopBar from './components/TopBar.jsx'
import LeftSidebar from './components/LeftSidebar.jsx'
import MapPanel from './components/MapPanel.jsx'
import BlenderTerrainViewer from './components/BlenderTerrainViewer.jsx'
import KpiCards from './components/KpiCards.jsx'
import RiskIndicatorsCard from './components/RiskIndicatorsCard.jsx'
import InfraRiskCard from './components/InfraRiskCard.jsx'
import EvacuationCard from './components/EvacuationCard.jsx'
import ResponseUnitsCard from './components/ResponseUnitsCard.jsx'
import AlertToast from './components/AlertToast.jsx'
import ProjectOverview from './components/ProjectOverview.jsx'
import SafeRoutingPage from './components/SafeRoutingPage.jsx'
import CitizenReportPage from './components/CitizenReportPage.jsx'
import WeatherPanel from './components/WeatherPanel.jsx'
import { CloudRain, RefreshCw, CheckCircle, Loader, AlertTriangle, CloudSun } from 'lucide-react'

let _alertIdCounter = 0

// Fetch weather for one node from Open-Meteo (free, no API key)
async function fetchOneWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weathercode&timezone=Asia%2FKolkata`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const cur = data.current
  return {
    rainfall_mmhr: cur.precipitation ?? 0,
    humidity_pct: cur.relative_humidity_2m ?? null,
    temperature_c: cur.temperature_2m ?? null,
    wind_kmh: cur.wind_speed_10m ?? null,
    weather_code: cur.weathercode ?? null,
    source: 'live',
    fetched_at: new Date().toISOString(),
  }
}

export default function App() {
  const { nodes, loading, error, lastFetch, refetch } = useNodes()
  const [selectedNode, setSelectedNode] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [viewMode, setViewMode] = useState('2d') // '2d' | '3d'
  const [activePage, setActivePage] = useState('dashboard')

  // Weather state
  const [weatherData, setWeatherData] = useState({})        // nodeId -> raw weather from Open-Meteo
  const [weatherStatus, setWeatherStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [weatherLastUpdated, setWeatherLastUpdated] = useState(null)
  const [weatherEnabled, setWeatherEnabled] = useState(true) // toggle live weather on/off on dashboard
  const fetchingRef = useRef(false)

  // Fetch live weather for ALL nodes concurrently
  const fetchAllWeather = useCallback(async (nodeList) => {
    if (!nodeList || nodeList.length === 0) return
    if (fetchingRef.current) return
    fetchingRef.current = true
    setWeatherStatus('loading')
    const results = {}
    await Promise.allSettled(
      nodeList.map(async (node) => {
        try {
          results[node.id] = await fetchOneWeather(node.lat, node.lon)
        } catch {
          // silently skip failed nodes
        }
      })
    )
    setWeatherData(prev => ({ ...prev, ...results }))
    setWeatherLastUpdated(new Date())
    setWeatherStatus(Object.keys(results).length > 0 ? 'done' : 'error')
    fetchingRef.current = false
  }, [])

  // Auto-fetch on first node load; re-fetch every 15 minutes
  useEffect(() => {
    if (!nodes || nodes.length === 0) return
    fetchAllWeather(nodes)
    const interval = setInterval(() => fetchAllWeather(nodes), 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [nodes?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Manual weather override from WeatherPanel
  const handleWeatherUpdate = useCallback((nodeId, data) => {
    setWeatherData(prev => ({ ...prev, [nodeId]: data }))
  }, [])

  // Enrich nodes with live weather risk scores
  const enrichedNodes = useMemo(() => {
    if (!nodes) return []
    if (!weatherEnabled || Object.keys(weatherData).length === 0) return nodes
    return nodes.map(node => {
      const wx = weatherData[node.id]
      if (!wx) return node
      const recomputed = computeRiskFromWeather(node, wx)
      if (!recomputed) return node
      return {
        ...node,
        ...recomputed,
        // Keep original for reference
        _original_risk_score: node.dynamic_risk_score,
        _weather_source: wx.source,
        _weather: wx,
      }
    })
  }, [nodes, weatherData, weatherEnabled])

  // WebSocket alerts
  const handleAlert = useCallback((msg) => {
    _alertIdCounter++
    setAlerts(prev => [...prev.slice(-4), { ...msg, _id: _alertIdCounter }])
  }, [])
  useWebSocketAlerts(handleAlert)

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a._id !== id))
  }, [])

  // Simulation success → fire alert + update selected node
  const handleSimulateSuccess = useCallback((updatedNode) => {
    refetch()
    if (updatedNode.dynamic_risk_score >= 50) {
      _alertIdCounter++
      setAlerts(prev => [...prev.slice(-4), {
        _id: _alertIdCounter,
        type: 'alert',
        node_id: updatedNode.id,
        node_name: updatedNode.name,
        risk_score: updatedNode.dynamic_risk_score,
        risk_band: updatedNode.risk_band,
        timestamp: updatedNode.last_updated,
      }])
    }
    setSelectedNode(updatedNode)
  }, [refetch])

  const handleViewModeChange = useCallback((mode) => setViewMode(mode), [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full" style={{ background: '#0d0d0d' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
          <div style={{ fontSize: 13, color: '#6a6a6a', letterSpacing: '0.1em' }}>LOADING SYSTEM DATA...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full" style={{ background: '#0d0d0d' }}>
        <div className="card p-6 text-center" style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⚠</div>
          <div className="section-header mb-2">Backend Connection Error</div>
          <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 16 }}>{error}</div>
          <div style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 16 }}>
            Make sure the FastAPI server is running on port 8001.
          </div>
          <button onClick={refetch}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ background: '#1d4ed8', border: '1px solid #3b82f6', color: '#fff' }}>
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: '#0d0d0d' }}>
      {/* Top navigation bar */}
      <TopBar
        nodes={enrichedNodes}
        onSimulateSuccess={handleSimulateSuccess}
        lastFetch={lastFetch}
        wsConnected={wsConnected}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content Area based on active page */}
      {activePage === 'overview' ? (
        <ProjectOverview
          nodes={enrichedNodes}
          onNavigateToDashboard={() => setActivePage('dashboard')}
          onNavigateToRouting={() => setActivePage('routing')}
        />
      ) : activePage === 'routing' ? (
        <SafeRoutingPage nodes={enrichedNodes} onSimulateSuccess={handleSimulateSuccess} />
      ) : activePage === 'citizen' ? (
        <CitizenReportPage nodes={enrichedNodes} onSimulateSuccess={handleSimulateSuccess} />
      ) : activePage === 'weather' ? (
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0, background: '#0d0d0d', padding: 20, gap: 16 }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <WeatherPanel
              nodes={nodes}
              initialWeatherData={weatherData}
              onWeatherUpdate={handleWeatherUpdate}
            />
          </div>
        </div>
      ) : (
        /* DASHBOARD */
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>

          {/* ── Live Weather Status Strip ── */}
          <div style={{
            background: '#0e1420',
            borderBottom: '1px solid #1e293b',
            padding: '5px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}>
            <CloudSun size={13} color="#60a5fa" />
            <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600, letterSpacing: '0.08em' }}>
              LIVE WEATHER ENGINE
            </span>

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {weatherStatus === 'loading' && (
                <>
                  <Loader size={11} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 10, color: '#6a6a6a' }}>Fetching live rainfall from Open-Meteo...</span>
                </>
              )}
              {weatherStatus === 'done' && (
                <>
                  <CheckCircle size={11} color="#22c55e" />
                  <span style={{ fontSize: 10, color: '#22c55e' }}>
                    Live weather active — {Object.keys(weatherData).length} nodes updated
                  </span>
                  <span style={{ fontSize: 10, color: '#4a4a4a' }}>·</span>
                  <span style={{ fontSize: 10, color: '#4a4a4a' }}>
                    {weatherLastUpdated?.toLocaleTimeString('en-IN')}
                  </span>
                </>
              )}
              {weatherStatus === 'error' && (
                <>
                  <AlertTriangle size={11} color="#ef4444" />
                  <span style={{ fontSize: 10, color: '#ef4444' }}>Weather fetch failed — using sensor data</span>
                </>
              )}
              {weatherStatus === 'idle' && (
                <span style={{ fontSize: 10, color: '#6a6a6a' }}>Initializing...</span>
              )}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Toggle live weather on/off */}
            <button
              onClick={() => setWeatherEnabled(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 4, fontSize: 10,
                background: weatherEnabled ? '#14532d44' : '#1e293b',
                border: `1px solid ${weatherEnabled ? '#22c55e55' : '#334155'}`,
                color: weatherEnabled ? '#22c55e' : '#6a6a6a',
                cursor: 'pointer',
              }}
            >
              <CloudRain size={10} />
              {weatherEnabled ? 'Weather ON' : 'Weather OFF'}
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchAllWeather(nodes)}
              disabled={weatherStatus === 'loading'}
              title="Refresh live weather data for all 18 nodes"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 4, fontSize: 10,
                background: '#1d4ed833', border: '1px solid #3b82f644',
                color: '#3b82f6', cursor: weatherStatus === 'loading' ? 'not-allowed' : 'pointer',
                opacity: weatherStatus === 'loading' ? 0.5 : 1,
              }}
            >
              <RefreshCw size={10} />
              Refresh Weather
            </button>
          </div>

          {/* ── Main 3-column dashboard layout ── */}
          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* LEFT SIDEBAR */}
            <LeftSidebar
              nodes={enrichedNodes}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />

            {/* CENTER: 2D GIS or 3D Blender Terrain */}
            {viewMode === '2d' ? (
              <MapPanel
                nodes={enrichedNodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <BlenderTerrainViewer
                nodes={enrichedNodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            )}

            {/* RIGHT COLUMN */}
            <aside
              className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden"
              style={{ width: 280, borderLeft: '1px solid #2a2a2a', minHeight: 0 }}
            >
              <KpiCards nodes={enrichedNodes} />
              <RiskIndicatorsCard nodes={enrichedNodes} lastFetch={weatherLastUpdated || lastFetch} />
              <InfraRiskCard nodes={enrichedNodes} lastFetch={weatherLastUpdated || lastFetch} />
              <EvacuationCard nodes={enrichedNodes} lastFetch={weatherLastUpdated || lastFetch} />
              <ResponseUnitsCard nodes={enrichedNodes} lastFetch={weatherLastUpdated || lastFetch} />
            </aside>
          </div>
        </div>
      )}

      {/* Alert toasts */}
      <AlertToast alerts={alerts} onDismiss={dismissAlert} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
