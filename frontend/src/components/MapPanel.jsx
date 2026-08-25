import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getRiskColor } from '../utils.js'
import NodeInfoOverlay from './NodeInfoOverlay.jsx'

// Fix default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// NE India bounds
const NE_CENTER = [25.5, 92.5]
const NE_BOUNDS = [[21, 87], [30, 97]]

function createMarkerIcon(node) {
  const color = getRiskColor(node.risk_band)
  const score = Math.round(node.dynamic_risk_score)
  const isAlert = node.risk_band === 'Very High' || node.risk_band === 'High'
  const pulseAnim = isAlert
    ? `@keyframes pulse${node.id}{0%{transform:scale(1);opacity:0.8}50%{transform:scale(1.6);opacity:0}100%{transform:scale(1);opacity:0}}`
    : ''

  const html = `
    <style>${pulseAnim}</style>
    <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
      ${isAlert ? `<div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color};animation:pulse${node.id} 1.8s ease-out infinite;"></div>` : ''}
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};
        border:2px solid rgba(255,255,255,0.3);
        box-shadow:0 0 10px ${color}88;
        display:flex;align-items:center;justify-content:center;
        font-size:9px;font-weight:700;color:#fff;font-family:Inter,system-ui,sans-serif;
        cursor:pointer;
      ">${score}</div>
    </div>
  `
  return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] })
}

export default function MapPanel({ nodes, selectedNode, onSelectNode }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})  // node.id -> L.Marker

  // Init map once
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: NE_CENTER,
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
    })

    // CartoDB Positron — light/muted basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)

    // Zoom controls bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Fit NE India
    map.fitBounds(NE_BOUNDS, { padding: [20, 20] })

    mapInstanceRef.current = map
  }, [])

  // Sync markers whenever nodes change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !nodes.length) return

    const existingIds = new Set(Object.keys(markersRef.current).map(Number))
    const newIds = new Set(nodes.map(n => n.id))

    // Remove stale markers
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Add / update markers
    nodes.forEach(node => {
      const icon = createMarkerIcon(node)
      const popupHtml = `
        <div style="font-family:Inter,system-ui,sans-serif;min-width:160px">
          <div style="font-size:12px;font-weight:600;color:#1a1a2e;margin-bottom:4px">${node.name}</div>
          <div style="font-size:10px;color:#555;margin-bottom:6px">${node.state}</div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:10px;color:#555">Risk Band</span>
            <span style="font-size:10px;font-weight:600;color:${getRiskColor(node.risk_band)}">${node.risk_band}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:10px;color:#555">AI Score</span>
            <span style="font-size:10px;font-weight:600">${node.dynamic_risk_score.toFixed(1)}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:10px;color:#555">Static Susc.</span>
            <span style="font-size:10px;">${node.static_susceptibility}</span>
          </div>
        </div>
      `

      if (markersRef.current[node.id]) {
        markersRef.current[node.id].setIcon(icon)
        markersRef.current[node.id].getPopup()?.setContent(popupHtml)
      } else {
        const marker = L.marker([node.lat, node.lon], { icon })
          .addTo(map)
          .bindPopup(popupHtml, { offset: [0, -10], maxWidth: 200 })

        marker.on('click', () => onSelectNode(node))
        markersRef.current[node.id] = marker
      }
    })
  }, [nodes, onSelectNode])

  // Highlight/fly to selected node
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedNode) return
    const marker = markersRef.current[selectedNode.id]
    if (marker) {
      map.flyTo([selectedNode.lat, selectedNode.lon], 10, { duration: 0.8 })
      setTimeout(() => marker.openPopup(), 850)
    }
  }, [selectedNode])

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
      {/* Toolbar top-right */}
      <div className="absolute top-3 right-12 z-[800] flex flex-col gap-1">
        {[
          { icon: '⌕', title: 'Search' },
          { icon: '⌂', title: 'Reset View', onClick: () => mapInstanceRef.current?.fitBounds(NE_BOUNDS, { padding: [20,20] }) },
          { icon: '☰', title: 'List' },
          { icon: '⊞', title: 'Layers' },
        ].map(btn => (
          <button
            key={btn.title}
            title={btn.title}
            onClick={btn.onClick}
            className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#cfcfcf',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

      {/* Selected node info overlay */}
      {selectedNode && (
        <div className="absolute bottom-8 left-3 z-[800]">
          <NodeInfoOverlay selectedNode={selectedNode} onClose={() => onSelectNode(null)} />
        </div>
      )}
    </div>
  )
}
