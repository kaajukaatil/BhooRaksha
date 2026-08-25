import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { 
  Navigation, AlertTriangle, ShieldCheck, Clock, Compass, Activity, 
  Layers, MapPin, ChevronRight, CheckCircle2, XCircle, CloudRain, 
  Phone, Send, RefreshCw, Info, AlertOctagon, HelpCircle, Car, Truck
} from 'lucide-react'
import { CORRIDORS, ALL_EMERGENCY_RESOURCES } from '../routingData.js'
import { getRiskColor, getRiskBgColor } from '../utils.js'

export default function SafeRoutingPage({ nodes, onSimulateSuccess }) {
  const [selectedCorridorId, setSelectedCorridorId] = useState('dimapur-kohima')
  const [selectedRouteId, setSelectedRouteId] = useState('route-niuland-safe')
  const [showHazardCircles, setShowHazardCircles] = useState(true)
  const [showShelters, setShowShelters] = useState(true)
  const [showChokePoints, setShowChokePoints] = useState(true)
  const [transitType, setTransitType] = useState('emergency') // 'emergency' | 'convoy' | 'civilian'
  const [broadcastSent, setBroadcastSent] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef({
    routes: {},
    markers: [],
    circles: [],
    shelters: [],
    chokePoints: []
  })

  const currentCorridor = useMemo(() => {
    return CORRIDORS.find(c => c.id === selectedCorridorId) || CORRIDORS[0]
  }, [selectedCorridorId])

  // Get active risk states for relevant nodes in this corridor
  const corridorNodeStatus = useMemo(() => {
    if (!currentCorridor) return []
    return currentCorridor.relevantNodeIds
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean)
  }, [currentCorridor, nodes])

  const maxCorridorRisk = useMemo(() => {
    if (!corridorNodeStatus.length) return 0
    return Math.max(...corridorNodeStatus.map(n => n.dynamic_risk_score))
  }, [corridorNodeStatus])

  // Init Leaflet map
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [25.8, 93.9],
      zoom: 8,
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapInstanceRef.current = map
  }, [])

  // Update map routes, markers, and boundaries when corridor or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !currentCorridor) return

    // Clear previous layers
    Object.values(layersRef.current.routes).forEach(layer => layer.remove())
    layersRef.current.routes = {}
    layersRef.current.markers.forEach(m => m.remove())
    layersRef.current.markers = []
    layersRef.current.circles.forEach(c => c.remove())
    layersRef.current.circles = []
    layersRef.current.shelters.forEach(s => s.remove())
    layersRef.current.shelters = []
    layersRef.current.chokePoints.forEach(cp => cp.remove())
    layersRef.current.chokePoints = []

    const allCoords = []

    // 1. Draw Routes
    currentCorridor.routes.forEach(route => {
      const isSelected = route.id === selectedRouteId
      const weight = isSelected ? 6 : 3.5
      const opacity = isSelected ? 0.95 : 0.45
      
      const polyline = L.polyline(route.coordinates, {
        color: route.color,
        weight: weight,
        opacity: opacity,
        dashArray: route.dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map)

      polyline.bindTooltip(`
        <div style="font-family:Inter,sans-serif;font-size:11px;font-weight:600">
          ${route.name}
          <div style="font-size:10px;font-weight:400;color:#666">${route.distanceKm} km • Hazard Score: ${route.slopeHazardScore}/100</div>
        </div>
      `, { sticky: true })

      polyline.on('click', () => {
        setSelectedRouteId(route.id)
      })

      layersRef.current.routes[route.id] = polyline
      route.coordinates.forEach(c => allCoords.push(c))

      // 2. Choke points
      if (showChokePoints && route.chokePoints) {
        route.chokePoints.forEach(cp => {
          const iconHtml = `
            <div style="
              width:22px;height:22px;border-radius:50%;
              background:#ef4444;border:2px solid #fff;
              box-shadow:0 0 8px rgba(239,68,68,0.8);
              display:flex;align-items:center;justify-content:center;
              color:#fff;font-size:10px;font-weight:bold;
            ">!</div>
          `
          const cpMarker = L.marker(cp.coords, {
            icon: L.divIcon({ html: iconHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] })
          }).addTo(map)

          cpMarker.bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:180px">
              <div style="font-size:12px;font-weight:700;color:#dc2626;margin-bottom:2px">⚠ Hazard Choke Point</div>
              <div style="font-size:11px;font-weight:600;color:#111">${cp.name}</div>
              <div style="font-size:10px;color:#555;margin-top:4px">${cp.hazard}</div>
              <div style="margin-top:6px;font-size:10px;padding:2px 6px;border-radius:3px;display:inline-block;background:#fee2e2;color:#b91c1c;font-weight:600">
                Risk: ${cp.riskLevel}
              </div>
            </div>
          `)
          layersRef.current.chokePoints.push(cpMarker)
        })
      }

      // 3. Shelters on safe routes
      if (showShelters && route.shelters) {
        route.shelters.forEach(sh => {
          const iconHtml = `
            <div style="
              width:22px;height:22px;border-radius:50%;
              background:#10b981;border:2px solid #fff;
              box-shadow:0 0 8px rgba(16,185,129,0.8);
              display:flex;align-items:center;justify-content:center;
              color:#fff;font-size:11px;font-weight:bold;
            ">✚</div>
          `
          const shMarker = L.marker(sh.coords, {
            icon: L.divIcon({ html: iconHtml, className: '', iconSize: [22, 22], iconAnchor: [11, 11] })
          }).addTo(map)

          shMarker.bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:180px">
              <div style="font-size:12px;font-weight:700;color:#059669;margin-bottom:2px">🛡 Emergency Shelter / Depot</div>
              <div style="font-size:11px;font-weight:600;color:#111">${sh.name}</div>
              <div style="font-size:10px;color:#555;margin-top:2px">Type: ${sh.type}</div>
              <div style="font-size:10px;color:#047857;font-weight:600;margin-top:4px">Capacity: ${sh.capacity} Persons</div>
            </div>
          `)
          layersRef.current.shelters.push(shMarker)
        })
      }
    })

    // 4. Origin and Destination Markers
    const originIcon = L.divIcon({
      html: `
        <div style="
          padding:3px 8px;border-radius:12px;
          background:#1e293b;border:2px solid #38bdf8;
          color:#fff;font-size:10px;font-weight:700;
          box-shadow:0 2px 8px rgba(0,0,0,0.5);white-space:nowrap;
        ">START: ${currentCorridor.origin.name}</div>
      `,
      className: '',
      iconAnchor: [30, 20]
    })
    const destIcon = L.divIcon({
      html: `
        <div style="
          padding:3px 8px;border-radius:12px;
          background:#1e293b;border:2px solid #f59e0b;
          color:#fff;font-size:10px;font-weight:700;
          box-shadow:0 2px 8px rgba(0,0,0,0.5);white-space:nowrap;
        ">DEST: ${currentCorridor.destination.name}</div>
      `,
      className: '',
      iconAnchor: [30, 20]
    })

    const m1 = L.marker(currentCorridor.origin.coords, { icon: originIcon }).addTo(map)
    const m2 = L.marker(currentCorridor.destination.coords, { icon: destIcon }).addTo(map)
    layersRef.current.markers.push(m1, m2)

    // 5. Landslide Hazard Buffer Circles for nearby sensitive nodes
    if (showHazardCircles) {
      corridorNodeStatus.forEach(node => {
        const color = getRiskColor(node.risk_band)
        const radius = Math.max(4000, node.dynamic_risk_score * 220)
        const circle = L.circle([node.lat, node.lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map)

        circle.bindTooltip(`
          <div style="font-family:Inter,sans-serif;font-size:10px">
            <strong>${node.name}</strong> (${node.state})<br/>
            Risk Score: ${node.dynamic_risk_score.toFixed(1)} / 100 (${node.risk_band})
          </div>
        `, { sticky: true })

        layersRef.current.circles.push(circle)
      })
    }

    // Fit view to route bounds
    if (allCoords.length) {
      const bounds = L.latLngBounds(allCoords)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [currentCorridor, selectedRouteId, showHazardCircles, showShelters, showChokePoints, corridorNodeStatus])

  const activeRoute = useMemo(() => {
    return currentCorridor.routes.find(r => r.id === selectedRouteId) || currentCorridor.routes[0]
  }, [currentCorridor, selectedRouteId])

  // Simulate heavy storm event on this corridor to demonstrate real-time AI rerouting
  const handleCorridorSimulation = async () => {
    if (!corridorNodeStatus.length) return
    const targetNode = corridorNodeStatus[0]
    setSimulating(true)
    try {
      const res = await fetch('/api/simulate/rainfall-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: targetNode.id,
          intensity_mmhr: 75.0,
          duration_hr: 18.0
        })
      })
      if (res.ok) {
        const updated = await res.json()
        onSimulateSuccess?.(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSimulating(false)
    }
  }

  const handleBroadcast = () => {
    setBroadcastSent(true)
    setTimeout(() => setBroadcastSent(false), 5000)
  }

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden" style={{ background: '#0d0d0d', color: '#e8e8e8' }}>
      
      {/* LEFT PANEL: CORRIDOR SELECTOR & ROUTE TELEMETRY */}
      <div 
        className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden border-r"
        style={{ width: 380, borderColor: '#2a2a2a', background: '#111111' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: '#2a2a2a', background: '#161616' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Navigation size={15} />
              </div>
              <span className="font-bold text-sm tracking-wide text-white">
                SAFE ROUTING ENGINE
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              AI CORRIDOR V2.4
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Real-time slope stability analysis & emergency green corridor rerouting.
          </p>
        </div>

        {/* Corridor Selector */}
        <div className="p-3 border-b space-y-2" style={{ borderColor: '#2a2a2a' }}>
          <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
            Select Mountain Corridor
          </label>
          <select
            value={selectedCorridorId}
            onChange={(e) => {
              setSelectedCorridorId(e.target.value)
              const corr = CORRIDORS.find(c => c.id === e.target.value)
              if (corr && corr.routes.length > 1) {
                // Default to safe route
                const safeRoute = corr.routes.find(r => r.type === 'safe') || corr.routes[0]
                setSelectedRouteId(safeRoute.id)
              }
            }}
            className="w-full rounded px-2.5 py-2 text-xs outline-none cursor-pointer"
            style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
          >
            {CORRIDORS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.highway})
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span>State: <strong className="text-gray-200">{currentCorridor.state}</strong></span>
            <span>Highway: <strong className="text-blue-400">{currentCorridor.highway}</strong></span>
          </div>
        </div>

        {/* Transit Mode Selector */}
        <div className="p-3 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Transit Priority Mode
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'emergency', label: 'NDRF / SAR', icon: ShieldCheck },
              { id: 'convoy', label: 'Heavy Relief', icon: Truck },
              { id: 'civilian', label: 'Civilian Evac', icon: Car },
            ].map(m => {
              const Icon = m.icon
              const active = transitType === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setTransitType(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded text-[10px] font-medium transition-all ${
                    active ? 'bg-blue-600 text-white font-semibold shadow-md' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                  }`}
                  style={{ border: active ? '1px solid #3b82f6' : '1px solid #2a2a2a' }}
                >
                  <Icon size={14} className="mb-1" />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Multi-Route Comparison Cards */}
        <div className="p-3 flex-1 space-y-2.5">
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>Available Route Options ({currentCorridor.routes.length})</span>
            <span className="text-[10px] text-gray-500">Click to inspect</span>
          </div>

          {currentCorridor.routes.map(route => {
            const isSelected = route.id === selectedRouteId
            const isSafe = route.type === 'safe'
            const isDanger = route.type === 'danger'

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3 rounded cursor-pointer transition-all ${
                  isSelected ? 'border-2 ring-1' : 'border opacity-85 hover:opacity-100 hover:bg-[#181818]'
                }`}
                style={{
                  background: isSelected ? '#1c1c1f' : '#141414',
                  borderColor: isSelected ? route.color : '#282828',
                  boxShadow: isSelected ? `0 0 14px ${route.color}33` : 'none'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ background: route.color }}
                    />
                    <span className="font-bold text-xs text-white">
                      {route.name}
                    </span>
                  </div>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ 
                      background: `${route.color}22`, 
                      color: route.color, 
                      border: `1px solid ${route.color}44` 
                    }}
                  >
                    {isSafe ? 'AI RECOMMENDED' : isDanger ? 'HAZARD BLOCKED' : 'CONTINGENCY'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                  {route.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t text-center text-[10px]" style={{ borderColor: '#252525' }}>
                  <div className="p-1 rounded bg-black/40">
                    <div className="text-gray-400">Distance</div>
                    <div className="font-semibold text-white">{route.distanceKm} km</div>
                  </div>
                  <div className="p-1 rounded bg-black/40">
                    <div className="text-gray-400">Est. Time</div>
                    <div className="font-semibold text-white">{Math.round(route.normalDurationMin / 60)}h {route.normalDurationMin % 60}m</div>
                  </div>
                  <div className="p-1 rounded bg-black/40">
                    <div className="text-gray-400">Hazard Score</div>
                    <div className="font-bold font-mono" style={{ color: route.color }}>{route.slopeHazardScore}/100</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons at Bottom */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: '#2a2a2a', background: '#141414' }}>
          <button
            onClick={handleBroadcast}
            className="w-full py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: broadcastSent ? '#059669' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              boxShadow: '0 0 10px rgba(16,185,129,0.3)'
            }}
          >
            <Send size={13} />
            {broadcastSent ? '✓ Route Dispatched to NDRF / SDRF' : 'Broadcast Safe Route to Relief Convoys'}
          </button>

          <button
            onClick={handleCorridorSimulation}
            disabled={simulating}
            className="w-full py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-2 transition-all"
            style={{ background: '#202020', border: '1px solid #3a3a3a', color: '#60a5fa' }}
          >
            <CloudRain size={13} className={simulating ? 'animate-spin' : ''} />
            {simulating ? 'Simulating Storm...' : 'Simulate Monsoon Cloudburst on Corridor'}
          </button>
        </div>
      </div>

      {/* CENTER: LEAFLET ROUTING GIS MAP */}
      <div className="relative flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        
        {/* Top Floating Map Controls */}
        <div className="absolute top-3 left-3 z-[800] flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium"
               style={{ background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #333' }}>
            <span className="text-gray-400">Layers:</span>
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-gray-200">
              <input 
                type="checkbox" checked={showHazardCircles}
                onChange={e => setShowHazardCircles(e.target.checked)}
                className="rounded accent-red-500"
              />
              Danger Buffers
            </label>
            <span className="text-gray-600">|</span>
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-gray-200">
              <input 
                type="checkbox" checked={showShelters}
                onChange={e => setShowShelters(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              Emergency Shelters
            </label>
            <span className="text-gray-600">|</span>
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-gray-200">
              <input 
                type="checkbox" checked={showChokePoints}
                onChange={e => setShowChokePoints(e.target.checked)}
                className="rounded accent-yellow-500"
              />
              Choke Points
            </label>
          </div>
        </div>

        {/* Map Canvas */}
        <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

        {/* Bottom Route Status Bar */}
        <div 
          className="p-3 border-t flex flex-wrap items-center justify-between gap-3 z-[800]"
          style={{ background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(8px)', borderColor: '#2a2a2a' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ background: `${activeRoute.color}22`, border: `1px solid ${activeRoute.color}55` }}>
              {activeRoute.type === 'safe' ? (
                <ShieldCheck size={18} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={18} className="text-red-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{activeRoute.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ background: activeRoute.color, color: '#fff' }}>
                  {activeRoute.status}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {activeRoute.clearanceRating} • Elevation Gain: {activeRoute.elevationGainM}m • Steep Slope Cut: {activeRoute.steepSlopeExposurePct}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Total Clearance Distance</div>
              <div className="font-bold text-white font-mono">{activeRoute.distanceKm} KM</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Estimated Travel Time</div>
              <div className="font-bold text-white font-mono">
                {Math.round(activeRoute.normalDurationMin / 60)}h {activeRoute.normalDurationMin % 60}m
                {activeRoute.estimatedDelayMin > 0 && (
                  <span className="text-red-400 text-[10px] ml-1">(+{activeRoute.estimatedDelayMin}m delay)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: TURN-BY-TURN SAFETY GUIDANCE & EMERGENCY HUBS */}
      <aside 
        className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden border-l"
        style={{ width: 320, borderColor: '#2a2a2a', background: '#111111' }}
      >
        {/* Section Header */}
        <div className="p-3 border-b" style={{ borderColor: '#2a2a2a', background: '#161616' }}>
          <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Compass size={14} className="text-blue-400" />
            Route Safety Telemetry
          </div>
        </div>

        {/* Hazard Exposure Breakdown */}
        <div className="p-3 border-b space-y-3" style={{ borderColor: '#2a2a2a' }}>
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            Slope Hazard Profile
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-400">Steep Slope Vulnerability</span>
                <span className="font-semibold text-white">{activeRoute.steepSlopeExposurePct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${activeRoute.steepSlopeExposurePct}%`,
                    background: activeRoute.steepSlopeExposurePct > 50 ? '#ef4444' : '#10b981'
                  }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-400">Slope Stability Safety Margin</span>
                <span className="font-semibold text-white">{100 - activeRoute.slopeHazardScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${100 - activeRoute.slopeHazardScore}%`,
                    background: (100 - activeRoute.slopeHazardScore) > 60 ? '#10b981' : '#ef4444'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Safety Directives */}
        <div className="p-3 border-b space-y-2.5" style={{ borderColor: '#2a2a2a' }}>
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>Turn-by-Turn Safety Guidance</span>
            <span className="text-[10px] text-gray-500 font-mono">LIVE GPS</span>
          </div>

          <div className="space-y-2">
            {activeRoute.coordinates.map((pt, idx) => {
              const isFirst = idx === 0
              const isLast = idx === activeRoute.coordinates.length - 1
              return (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className="flex flex-col items-center mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isFirst ? 'bg-blue-400' : isLast ? 'bg-amber-400' : 'bg-gray-600'}`} />
                    {!isLast && <span className="w-0.5 h-6 bg-gray-800 my-0.5" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="font-medium text-gray-200">
                      {isFirst ? `Origin: ${currentCorridor.origin.name}` : isLast ? `Destination: ${currentCorridor.destination.name}` : `Waypoint KM ${(idx * 16.5).toFixed(0)}`}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {pt[0].toFixed(3)}°N, {pt[1].toFixed(3)}°E
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Emergency Resources along corridor */}
        <div className="p-3 space-y-2.5">
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            Regional Emergency Dispatch Bases
          </div>

          <div className="space-y-2">
            {ALL_EMERGENCY_RESOURCES.slice(0, 3).map((res, i) => (
              <div key={i} className="p-2.5 rounded bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center justify-between font-semibold text-white mb-1">
                  <span>{res.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {res.type}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Phone size={11} className="text-green-400" />
                  <span>{res.phone}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Ready Deployment Units: <strong className="text-gray-300">{res.units} Teams</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>

    </div>
  )
}
