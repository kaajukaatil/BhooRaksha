import { useEffect, useRef, useState, useCallback } from 'react'
import { getRiskColor } from '../utils.js'
import NodeInfoOverlay from './NodeInfoOverlay.jsx'

// CesiumJS is loaded via IIFE by vite-plugin-cesium-build, available as window.Cesium
// We also import it normally for tree-shaking support
import * as Cesium from 'cesium'

// Scale factor: risk 0-100 → height 0-2000m
const MAX_HEIGHT = 2000
const COLUMN_RADIUS = 3000 // meters, visual radius of the cylinders

// NE India bounding box
const NE_WEST = 88.0
const NE_EAST = 97.5
const NE_SOUTH = 22.0
const NE_NORTH = 29.5

// Animated height interpolation (smooth ~1s transition)
function animateHeight(entity, fromHeight, toHeight, duration = 1000) {
  const startTime = performance.now()
  const updateFrame = () => {
    const elapsed = performance.now() - startTime
    const t = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)
    const currentHeight = fromHeight + (toHeight - fromHeight) * eased
    if (entity.cylinder) {
      entity.cylinder.length = currentHeight
      // Reposition: Cesium cylinders are centered at origin, so we shift up by half the height
      entity.position = Cesium.Cartesian3.fromDegrees(
        entity._lonDeg,
        entity._latDeg,
        currentHeight / 2
      )
    }
    if (t < 1) requestAnimationFrame(updateFrame)
  }
  requestAnimationFrame(updateFrame)
}

function riskToColor(band) {
  const hex = getRiskColor(band)
  // Parse hex to Cesium Color
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return new Cesium.Color(r, g, b, 0.85)
}

export default function CesiumPanel({ nodes, selectedNode, onSelectNode }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const entitiesRef = useRef({}) // node.id -> Cesium.Entity
  const prevHeightsRef = useRef({}) // node.id -> previous height value
  const [cesiumError, setCesiumError] = useState(null)
  const [terrainLoaded, setTerrainLoaded] = useState(false)

  // Initialize Cesium viewer once
  useEffect(() => {
    if (viewerRef.current || !containerRef.current) return

    // Set the Ion access token from env
    const token = import.meta.env.VITE_CESIUM_ION_TOKEN
    if (token) {
      Cesium.Ion.defaultAccessToken = token
    }

    try {
      const viewer = new Cesium.Viewer(containerRef.current, {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: true,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        creditContainer: document.createElement('div'), // hide default credits
      })

      // Dark sky for command-center vibe
      viewer.scene.skyAtmosphere.show = true
      viewer.scene.globe.enableLighting = true
      viewer.scene.fog.enabled = true

      // Frame camera over NE India
      viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(NE_WEST, NE_SOUTH, NE_EAST, NE_NORTH),
        orientation: {
          heading: Cesium.Math.toRadians(15),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0,
        },
        duration: 0, // instant on load
      })

      // Handle terrain loading
      viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
        if (remaining === 0 && !terrainLoaded) {
          setTerrainLoaded(true)
        }
      })

      // Click handler for entities
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction((click) => {
        const picked = viewer.scene.pick(click.position)
        if (Cesium.defined(picked) && picked.id && picked.id._nodeData) {
          onSelectNode(picked.id._nodeData)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      viewerRef.current = viewer
      setTerrainLoaded(true)
    } catch (err) {
      console.error('Cesium initialization failed:', err)
      setCesiumError(err.message || 'Failed to initialize CesiumJS')
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  // Sync entities whenever nodes change (with animated height transitions)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !nodes.length) return

    const existingIds = new Set(Object.keys(entitiesRef.current).map(Number))
    const newIds = new Set(nodes.map(n => n.id))

    // Remove stale entities
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        viewer.entities.remove(entitiesRef.current[id])
        delete entitiesRef.current[id]
        delete prevHeightsRef.current[id]
      }
    })

    // Add or update entities
    nodes.forEach(node => {
      const targetHeight = Math.max(100, (node.dynamic_risk_score / 100) * MAX_HEIGHT)
      const color = riskToColor(node.risk_band)

      if (entitiesRef.current[node.id]) {
        // Update existing entity — animate the height transition
        const entity = entitiesRef.current[node.id]
        const prevHeight = prevHeightsRef.current[node.id] || targetHeight
        entity._nodeData = node
        entity.cylinder.material = color

        // Only animate if height actually changed
        if (Math.abs(prevHeight - targetHeight) > 1) {
          animateHeight(entity, prevHeight, targetHeight)
        }

        // Update label
        if (entity.label) {
          entity.label.text = `${node.name}\nRisk: ${node.dynamic_risk_score.toFixed(0)}`
          entity.label.fillColor = color
        }
      } else {
        // Create new entity
        const entity = viewer.entities.add({
          name: node.name,
          position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat, targetHeight / 2),
          cylinder: {
            length: targetHeight,
            topRadius: COLUMN_RADIUS,
            bottomRadius: COLUMN_RADIUS,
            material: color,
            outline: true,
            outlineColor: new Cesium.Color(1, 1, 1, 0.15),
            outlineWidth: 1,
          },
          label: {
            text: `${node.name}\nRisk: ${node.dynamic_risk_score.toFixed(0)}`,
            font: '12px Inter, system-ui, sans-serif',
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            eyeOffset: new Cesium.Cartesian3(0, 0, -targetHeight),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            showBackground: true,
            backgroundColor: new Cesium.Color(0.1, 0.1, 0.1, 0.8),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
          },
        })

        // Stash metadata for click handler and animation
        entity._nodeData = node
        entity._lonDeg = node.lon
        entity._latDeg = node.lat
        entitiesRef.current[node.id] = entity
      }

      prevHeightsRef.current[node.id] = targetHeight
    })
  }, [nodes])

  // Fly to selected node
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !selectedNode) return

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selectedNode.lon,
        selectedNode.lat,
        50000 // altitude meters
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2.5,
    })
  }, [selectedNode])

  // Error fallback
  if (cesiumError) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center" style={{ minWidth: 0, background: '#0d0d0d' }}>
        <div className="card p-6 text-center" style={{ maxWidth: 400 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
          <div className="section-header mb-2">3D Terrain Unavailable</div>
          <div style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 12 }}>
            {cesiumError}
          </div>
          <div style={{ fontSize: 11, color: '#6a6a6a', lineHeight: 1.6 }}>
            CesiumJS failed to load the 3D terrain. This could be a network issue or a missing Cesium Ion access token.
            Set <code style={{ color: '#eab308', background: '#252525', padding: '2px 4px', borderRadius: 3 }}>
              VITE_CESIUM_ION_TOKEN
            </code> in your <code style={{ color: '#eab308', background: '#252525', padding: '2px 4px', borderRadius: 3 }}>
              .env
            </code> file.
          </div>
          <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 16 }}>
            Switch back to 2D view using the toggle in the top bar.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
      {/* Info bar at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-2 px-3 py-1.5 rounded"
           style={{ background: 'rgba(26,26,26,0.9)', border: '1px solid #2a2a2a', backdropFilter: 'blur(6px)' }}>
        <span style={{ fontSize: 11, color: '#cfcfcf', letterSpacing: '0.04em' }}>
          📊 Column height = current risk score (0–100 → 0–2000m)
        </span>
      </div>

      {/* Reset view button */}
      <div className="absolute top-3 right-4 z-[800]">
        <button
          title="Reset 3D View"
          onClick={() => {
            viewerRef.current?.camera.flyTo({
              destination: Cesium.Rectangle.fromDegrees(NE_WEST, NE_SOUTH, NE_EAST, NE_NORTH),
              orientation: { heading: Cesium.Math.toRadians(15), pitch: Cesium.Math.toRadians(-35), roll: 0 },
              duration: 2,
            })
          }}
          className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#cfcfcf', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
        >
          ⌂
        </button>
      </div>

      {/* Cesium container */}
      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

      {/* Selected node info overlay */}
      {selectedNode && (
        <div className="absolute bottom-8 left-3 z-[800]">
          <NodeInfoOverlay selectedNode={selectedNode} onClose={() => onSelectNode(null)} />
        </div>
      )}
    </div>
  )
}
