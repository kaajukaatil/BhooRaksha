import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { 
  Layers, Sun, CloudRain, Eye, Compass, RotateCcw, 
  MapPin, Activity, Shield, Sparkles, Sliders, Play, Maximize2
} from 'lucide-react'
import { getRiskColor } from '../utils.js'
import NodeInfoOverlay from './NodeInfoOverlay.jsx'

// Coordinate bounds mapping to 3D mesh space (-100 to +100)
const MIN_LON = 88.0, MAX_LON = 96.0
const MIN_LAT = 22.5, MAX_LAT = 28.5

function geoTo3D(lat, lon) {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON) - 0.5) * 180
  const z = -((lat - MIN_LAT) / (MAX_LAT - MIN_LAT) - 0.5) * 140
  return { x, z }
}

// Procedural Himalayan & NE India mountain elevation generator
function getTerrainElevation(x, z) {
  // Normalize coords
  const nx = x / 100
  const nz = z / 70

  // 1. Northern Himalayan Ridge (High peaks in the North/North-West)
  const himalayas = Math.exp(-Math.pow(nz - 0.75, 2) * 6) * 32.0 * (1 + 0.3 * Math.sin(nx * 8))

  // 2. Southern Khasi & Jaintia Plateau (South-West)
  const khasi = Math.exp(-Math.pow(nx + 0.5, 2) * 8 - Math.pow(nz + 0.3, 2) * 8) * 18.0

  // 3. Eastern Naga & Patkai Ridge (North-South folds in the East)
  const nagaMizo = Math.exp(-Math.pow(nx - 0.55, 2) * 7) * (14.0 + 6.0 * Math.sin(nz * 7))

  // 4. Central Brahmaputra River Trough (Valley in the middle)
  const valleyCut = Math.exp(-Math.pow(nz - 0.1, 2) * 12) * 12.0

  // 5. Multi-octave fractal noise for jagged mountain ridges and ravines
  const fine1 = Math.sin(nx * 14 + nz * 8) * Math.cos(nz * 12) * 3.5
  const fine2 = Math.sin(nx * 28 - nz * 24) * 1.5
  const fine3 = Math.cos(nx * 48 + nz * 42) * 0.7

  const total = Math.max(0.5, himalayas + khasi + nagaMizo - valleyCut + fine1 + fine2 + fine3 + 4.0)
  return total
}

export default function BlenderTerrainViewer({ nodes, selectedNode, onSelectNode }) {
  const canvasContainerRef = useRef(null)
  const [shaderMode, setShaderMode] = useState('topo') // 'topo' | 'clay' | 'slope_risk' | 'wireframe'
  const [sunElevation, setSunElevation] = useState(45)
  const [sunAzimuth, setSunAzimuth] = useState(135)
  const [fogDensity, setFogDensity] = useState(0.003)
  const [showRain, setShowRain] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [autoRotate, setAutoRotate] = useState(false)

  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const terrainMeshRef = useRef(null)
  const sunLightRef = useRef(null)
  const rainParticlesRef = useRef(null)
  const nodeBeaconsRef = useRef([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Camera Orbit state
  const isDraggingRef = useRef(false)
  const isRightDraggingRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const sphericalRef = useRef({ radius: 170, theta: Math.PI / 4, phi: Math.PI / 3.2 })
  const targetLookAtRef = useRef(new THREE.Vector3(0, 5, 0))

  // Camera Fly-To Presets
  const flyToPreset = (preset) => {
    switch (preset) {
      case 'overview':
        targetLookAtRef.current.set(0, 5, 0)
        sphericalRef.current = { radius: 180, theta: 0.6, phi: 0.95 }
        break
      case 'sikkim':
        targetLookAtRef.current.set(-60, 22, -45)
        sphericalRef.current = { radius: 65, theta: 0.4, phi: 1.1 }
        break
      case 'shillong':
        targetLookAtRef.current.set(-50, 14, 25)
        sphericalRef.current = { radius: 55, theta: 1.2, phi: 1.05 }
        break
      case 'kohima':
        targetLookAtRef.current.set(50, 16, 10)
        sphericalRef.current = { radius: 60, theta: -0.8, phi: 1.1 }
        break
      case 'aizawl':
        targetLookAtRef.current.set(40, 12, 55)
        sphericalRef.current = { radius: 55, theta: -1.4, phi: 1.15 }
        break
      case 'itanagar':
        targetLookAtRef.current.set(30, 15, -40)
        sphericalRef.current = { radius: 60, theta: 0.2, phi: 1.1 }
        break
      default:
        break
    }
  }

  // Init Three.js 3D Viewport
  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0c0d12)
    scene.fog = new THREE.FogExp2(0x0c0d12, fogDensity)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 10
    sunLight.shadow.camera.far = 400
    const d = 120
    sunLight.shadow.camera.left = -d
    sunLight.shadow.camera.right = d
    sunLight.shadow.camera.top = d
    sunLight.shadow.camera.bottom = -d
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)
    sunLightRef.current = sunLight

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x1f2937, 0.6)
    scene.add(hemiLight)

    // Build 3D Mountain Mesh (200x160 grid)
    const gridW = 200, gridH = 160
    const planeGeo = new THREE.PlaneGeometry(190, 150, gridW, gridH)
    planeGeo.rotateX(-Math.PI / 2)

    const pos = planeGeo.attributes.position
    const colors = new Float32Array(pos.count * 3)

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = getTerrainElevation(x, z)
      pos.setY(i, y)

      // Initial Topo Color Gradient
      const nY = Math.min(1.0, y / 32.0)
      let r = 0.2, g = 0.4, b = 0.25 // Valley green

      if (nY > 0.75) {
        // Snow peaks (White/Ice Blue)
        r = 0.92; g = 0.95; b = 1.0
      } else if (nY > 0.5) {
        // High Rock Scarp / Slate
        r = 0.48; g = 0.44; b = 0.42
      } else if (nY > 0.25) {
        // Mountain forest / slope
        r = 0.25; g = 0.45; b = 0.28
      } else {
        // River valley loam
        r = 0.18; g = 0.32; b = 0.22
      }

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    planeGeo.computeVertexNormals()

    // Materials
    const topoMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.12,
      flatShading: true, // Gives that crisp Blender low-poly / sculpted facet look!
    })

    const terrainMesh = new THREE.Mesh(planeGeo, topoMat)
    terrainMesh.receiveShadow = true
    terrainMesh.castShadow = true
    scene.add(terrainMesh)
    terrainMeshRef.current = terrainMesh

    // River Water Plane
    const waterGeo = new THREE.PlaneGeometry(190, 150)
    waterGeo.rotateX(-Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65,
    })
    const waterMesh = new THREE.Mesh(waterGeo, waterMat)
    waterMesh.position.y = 4.2
    scene.add(waterMesh)

    // Base Grid Cyber Floor
    const gridHelper = new THREE.GridHelper(220, 44, 0x3b82f6, 0x1f2937)
    gridHelper.position.y = -0.5
    scene.add(gridHelper)

    // Rain Particle System
    const rainCount = 1500
    const rainGeo = new THREE.BufferGeometry()
    const rainPos = new Float32Array(rainCount * 3)
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 180
      rainPos[i * 3 + 1] = Math.random() * 80 + 10
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 140
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.6,
      transparent: true,
      opacity: 0.7,
    })
    const rainParticles = new THREE.Points(rainGeo, rainMat)
    rainParticles.visible = false
    scene.add(rainParticles)
    rainParticlesRef.current = rainParticles

    // Mouse Listeners for Blender Orbit & Pan Controls
    const onMouseDown = (e) => {
      if (e.button === 0) isDraggingRef.current = true
      if (e.button === 2) isRightDraggingRef.current = true
      prevMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const deltaX = e.clientX - prevMouseRef.current.x
      const deltaY = e.clientY - prevMouseRef.current.y
      prevMouseRef.current = { x: e.clientX, y: e.clientY }

      // Left Drag: Orbit
      if (isDraggingRef.current) {
        sphericalRef.current.theta -= deltaX * 0.007
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.007))
      }

      // Right Drag: Pan
      if (isRightDraggingRef.current) {
        const panSpeed = 0.15
        const forward = new THREE.Vector3().subVectors(camera.position, targetLookAtRef.current).normalize()
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize()
        targetLookAtRef.current.addScaledVector(right, deltaX * panSpeed)
        targetLookAtRef.current.addScaledVector(new THREE.Vector3(0, 1, 0), -deltaY * panSpeed)
      }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
      isRightDraggingRef.current = false
    }

    const onWheel = (e) => {
      e.preventDefault()
      sphericalRef.current.radius = Math.max(25, Math.min(320, sphericalRef.current.radius + e.deltaY * 0.12))
    }

    const onContextMenu = (e) => e.preventDefault()

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('contextmenu', onContextMenu)

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Animation Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      // Auto Rotate if toggled
      if (autoRotate) {
        sphericalRef.current.theta += 0.003
      }

      // Update Camera from spherical coords
      const s = sphericalRef.current
      const target = targetLookAtRef.current
      camera.position.x = target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta)
      camera.position.y = target.y + s.radius * Math.cos(s.phi)
      camera.position.z = target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta)
      camera.lookAt(target)

      // Animate Rain
      if (rainParticles.visible) {
        const p = rainGeo.attributes.position
        for (let i = 0; i < rainCount; i++) {
          let ry = p.getY(i) - 45 * delta
          if (ry < 0) ry = 80
          p.setY(i, ry)
        }
        p.needsUpdate = true
      }

      // Raycast for Hover Probe
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObject(terrainMesh)
      if (intersects.length > 0) {
        const hit = intersects[0]
        const hY = hit.point.y
        const slopeDeg = Math.round((1.0 - (hit.face?.normal.y || 1.0)) * 90)
        setHoveredPoint({
          elevationM: Math.round(hY * 110 + 200),
          slopeDeg: Math.min(85, slopeDeg * 1.4),
          x: hit.point.x.toFixed(1),
          z: hit.point.z.toFixed(1),
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [autoRotate])

  // Update Sun Direction & Fog
  useEffect(() => {
    if (!sunLightRef.current || !sceneRef.current) return
    const phi = THREE.MathUtils.degToRad(90 - sunElevation)
    const theta = THREE.MathUtils.degToRad(sunAzimuth)
    const dist = 140

    sunLightRef.current.position.set(
      dist * Math.sin(phi) * Math.sin(theta),
      dist * Math.cos(phi),
      dist * Math.sin(phi) * Math.cos(theta)
    )

    sceneRef.current.fog.density = fogDensity
  }, [sunElevation, sunAzimuth, fogDensity])

  // Update Rain Visibility
  useEffect(() => {
    if (rainParticlesRef.current) {
      rainParticlesRef.current.visible = showRain
    }
  }, [showRain])

  // Update Shading Material Mode (Blender Sculpt / Clay / Slope Heatmap / Topo)
  useEffect(() => {
    const mesh = terrainMeshRef.current
    if (!mesh) return

    const geo = mesh.geometry
    const pos = geo.attributes.position
    const colors = geo.attributes.color

    if (shaderMode === 'clay') {
      // Sleek Blender MatCap Studio Clay look
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xd9c5b2, // Warm sculpt clay
        roughness: 0.38,
        metalness: 0.05,
        flatShading: true,
      })
    } else if (shaderMode === 'wireframe') {
      // Cyber GIS Wireframe
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        wireframe: true,
        emissive: 0x2563eb,
        emissiveIntensity: 0.4,
      })
    } else if (shaderMode === 'slope_risk') {
      // Real-time Slope Angle Hazard Heatmap
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const z = pos.getZ(i)
        const y = pos.getY(i)
        
        // Approximate local slope gradient
        const deltaSlope = Math.abs(getTerrainElevation(x + 1, z) - getTerrainElevation(x - 1, z)) +
                           Math.abs(getTerrainElevation(x, z + 1) - getTerrainElevation(x, z - 1))
        
        if (deltaSlope > 3.2) {
          // Critical Slope > 45° (Crimson Red)
          colors.setXYZ(i, 0.95, 0.15, 0.15)
        } else if (deltaSlope > 1.8) {
          // Moderate Slope 25°-45° (Amber Orange)
          colors.setXYZ(i, 0.95, 0.65, 0.1)
        } else {
          // Gentle Slope < 25° (Emerald Green / Dark Slate)
          colors.setXYZ(i, 0.12, 0.6, 0.35)
        }
      }
      colors.needsUpdate = true

      mesh.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: true,
      })
    } else {
      // Standard Topographic Elevation
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i)
        const nY = Math.min(1.0, y / 32.0)
        let r = 0.2, g = 0.4, b = 0.25

        if (nY > 0.75) {
          r = 0.92; g = 0.95; b = 1.0 // Snow
        } else if (nY > 0.5) {
          r = 0.52; g = 0.48; b = 0.45 // High rock
        } else if (nY > 0.25) {
          r = 0.25; g = 0.45; b = 0.28 // Forest
        } else {
          r = 0.18; g = 0.32; b = 0.22 // Valley
        }

        colors.setXYZ(i, r, g, b)
      }
      colors.needsUpdate = true

      mesh.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.82,
        metalness: 0.12,
        flatShading: true,
      })
    }
  }, [shaderMode])

  // Update 3D Node Beacons & Dynamic Risk Pillars
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !nodes.length) return

    // Clean up previous beacons
    nodeBeaconsRef.current.forEach(b => {
      scene.remove(b.group)
      b.group.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })
    nodeBeaconsRef.current = []

    nodes.forEach(node => {
      const { x, z } = geoTo3D(node.lat, node.lon)
      const terrainY = getTerrainElevation(x, z)
      const colorHex = getRiskColor(node.risk_band)
      const threeColor = new THREE.Color(colorHex)

      const group = new THREE.Group()
      group.position.set(x, terrainY, z)

      // 1. Glowing Ground Ring
      const ringGeo = new THREE.RingGeometry(1.2, 2.0, 16)
      ringGeo.rotateX(-Math.PI / 2)
      const ringMat = new THREE.MeshBasicMaterial({
        color: threeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.position.y = 0.1
      group.add(ringMesh)

      // 2. Risk Pillar Column (Height proportional to dynamic risk)
      const pillarHeight = Math.max(3.0, (node.dynamic_risk_score / 100) * 24.0)
      const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, pillarHeight, 12)
      cylGeo.translate(0, pillarHeight / 2, 0)
      const cylMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.88,
      })
      const cylMesh = new THREE.Mesh(cylGeo, cylMat)
      cylMesh.castShadow = true
      group.add(cylMesh)

      // 3. Floating Holographic Head Pin
      const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: threeColor,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      })
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
      sphereMesh.position.y = pillarHeight + 1.2
      group.add(sphereMesh)

      scene.add(group)
      nodeBeaconsRef.current.push({ node, group })
    })
  }, [nodes])

  // Fly to node when selected
  useEffect(() => {
    if (!selectedNode) return
    const { x, z } = geoTo3D(selectedNode.lat, selectedNode.lon)
    const y = getTerrainElevation(x, z)
    targetLookAtRef.current.set(x, y + 4, z)
    sphericalRef.current.radius = 45
  }, [selectedNode])

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden w-full h-full" style={{ minWidth: 0, background: '#0c0d12' }}>
      
      {/* Top 3D Viewport Controls & Shader Switcher */}
      <div className="absolute top-3 left-3 z-[800] flex flex-wrap items-center gap-2">
        {/* Shading Mode Tabs */}
        <div className="flex rounded overflow-hidden p-0.5" style={{ background: 'rgba(20,20,24,0.9)', border: '1px solid #333', backdropFilter: 'blur(8px)' }}>
          {[
            { id: 'topo', label: '🏔️ Topo Terrain' },
            { id: 'clay', label: '🎨 Blender Clay' },
            { id: 'slope_risk', label: '⚡ Slope Hazard' },
            { id: 'wireframe', label: '📐 Wireframe' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setShaderMode(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                shaderMode === m.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Quick Fly-To Mountain Camera Presets */}
        <div className="flex items-center gap-1 p-1 rounded" style={{ background: 'rgba(20,20,24,0.9)', border: '1px solid #333', backdropFilter: 'blur(8px)' }}>
          <span className="text-[10px] text-gray-400 font-semibold px-1 uppercase">Fly-To:</span>
          {[
            { id: 'overview', label: 'All NE' },
            { id: 'sikkim', label: 'Sikkim' },
            { id: 'shillong', label: 'Shillong' },
            { id: 'kohima', label: 'Kohima' },
            { id: 'aizawl', label: 'Aizawl' },
            { id: 'itanagar', label: 'Itanagar' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => flyToPreset(p.id)}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1e1e24] hover:bg-blue-600 text-gray-200 hover:text-white transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Right: Viewport Environment Controls */}
      <div className="absolute top-3 right-3 z-[800] flex items-center gap-2">
        {/* Sun Elevation & Rain Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs" style={{ background: 'rgba(20,20,24,0.9)', border: '1px solid #333', backdropFilter: 'blur(8px)' }}>
          <Sun size={13} className="text-amber-400" />
          <input 
            type="range" min="10" max="85" value={sunElevation}
            onChange={e => setSunElevation(Number(e.target.value))}
            title="Sun Light Angle"
            className="w-16 accent-amber-500 cursor-pointer"
          />

          <button
            onClick={() => setShowRain(!showRain)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              showRain ? 'bg-blue-600 text-white' : 'bg-[#222] text-gray-400 hover:text-gray-200'
            }`}
          >
            <CloudRain size={12} />
            Storm
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              autoRotate ? 'bg-purple-600 text-white' : 'bg-[#222] text-gray-400 hover:text-gray-200'
            }`}
          >
            <Play size={11} className={autoRotate ? 'animate-spin' : ''} />
            Orbit
          </button>

          <button
            onClick={() => flyToPreset('overview')}
            title="Reset Blender View"
            className="p-1 rounded bg-[#222] text-gray-300 hover:text-white"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Bottom Center: Terrain Inspector Probe HUD */}
      {hoveredPoint && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-4 px-4 py-2 rounded-full font-mono text-xs shadow-xl"
          style={{ background: 'rgba(15,15,20,0.9)', border: '1px solid #3b82f666', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-1.5 text-blue-400">
            <Compass size={13} />
            <span>TERRAIN DEM PROBE:</span>
          </div>
          <div>
            <span className="text-gray-400">Elevation: </span>
            <strong className="text-white font-bold">{hoveredPoint.elevationM} m</strong>
          </div>
          <div>
            <span className="text-gray-400">Slope Gradient: </span>
            <strong className={hoveredPoint.slopeDeg > 35 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {hoveredPoint.slopeDeg}° {hoveredPoint.slopeDeg > 35 ? '⚠ HIGH HAZARD' : 'STABLE'}
            </strong>
          </div>
        </div>
      )}

      {/* Blender Navigation Help Tip */}
      <div 
        className="absolute bottom-4 right-4 z-[800] text-[10px] text-gray-400 px-2.5 py-1 rounded pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      >
        🖱️ Left Drag: Orbit • Right Drag: Pan • Scroll: Zoom
      </div>

      {/* WebGL Canvas Container */}
      <div ref={canvasContainerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Selected node overlay */}
      {selectedNode && (
        <div className="absolute bottom-8 left-3 z-[800]">
          <NodeInfoOverlay selectedNode={selectedNode} onClose={() => onSelectNode(null)} />
        </div>
      )}
    </div>
  )
}
