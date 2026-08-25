import { useState, useCallback, lazy, Suspense } from 'react'
import { useNodes, useWebSocketAlerts } from './api.js'
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

let _alertIdCounter = 0

export default function App() {
  const { nodes, loading, error, lastFetch, refetch } = useNodes()
  const [selectedNode, setSelectedNode] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [viewMode, setViewMode] = useState('2d') // '2d' | '3d'
  const [activePage, setActivePage] = useState('dashboard') // 'dashboard' | 'routing' | 'citizen' | 'overview'

  // WebSocket alerts
  const handleAlert = useCallback((msg) => {
    _alertIdCounter++
    setAlerts(prev => [...prev.slice(-4), { ...msg, _id: _alertIdCounter }])
  }, [])

  useWebSocketAlerts(handleAlert)

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a._id !== id))
  }, [])

  // After a successful simulation, patch the node in-memory and refetch
  const handleSimulateSuccess = useCallback((updatedNode) => {
    refetch()
    // Show a local alert if risk_score >= 50
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

  // View mode switch preserves selectedNode
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full"
           style={{ background: '#0d0d0d' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
          <div style={{ fontSize: 13, color: '#6a6a6a', letterSpacing: '0.1em' }}>
            LOADING SYSTEM DATA...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full"
           style={{ background: '#0d0d0d' }}>
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
        nodes={nodes}
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
          nodes={nodes}
          onNavigateToDashboard={() => setActivePage('dashboard')}
          onNavigateToRouting={() => setActivePage('routing')}
        />
      ) : activePage === 'routing' ? (
        <SafeRoutingPage 
          nodes={nodes}
          onSimulateSuccess={handleSimulateSuccess}
        />
      ) : activePage === 'citizen' ? (
        <CitizenReportPage 
          nodes={nodes}
          onSimulateSuccess={handleSimulateSuccess}
        />
      ) : (
        /* DASHBOARD: 3-column layout */
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* LEFT SIDEBAR */}
          <LeftSidebar
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />

          {/* CENTER: 2D GIS or 3D Blender-Style Mountain Range Viewer */}
          {viewMode === '2d' ? (
            <MapPanel
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          ) : (
            <BlenderTerrainViewer
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          )}

          {/* RIGHT COLUMN */}
          <aside
            className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden"
            style={{ width: 280, borderLeft: '1px solid #2a2a2a', minHeight: 0 }}
          >
            {/* KPI badges */}
            <KpiCards nodes={nodes} />

            {/* Risk Indicators */}
            <RiskIndicatorsCard nodes={nodes} lastFetch={lastFetch} />

            {/* Infrastructure at Risk */}
            <InfraRiskCard nodes={nodes} lastFetch={lastFetch} />

            {/* Evacuation Donut */}
            <EvacuationCard nodes={nodes} lastFetch={lastFetch} />

            {/* Response Units */}
            <ResponseUnitsCard nodes={nodes} lastFetch={lastFetch} />
          </aside>
        </div>
      )}

      {/* Alert toasts */}
      <AlertToast alerts={alerts} onDismiss={dismissAlert} />
    </div>
  )
}
