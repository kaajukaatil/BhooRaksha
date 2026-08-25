import { useState } from 'react'
import { 
  AlertTriangle, Shield, Activity, Cpu, MapPin, Layers, Radio, Droplets, 
  TrendingUp, Clock, Compass, Database, ExternalLink, CheckCircle2, ArrowRight,
  Server, Zap, Navigation, Award, FileText, BarChart3, Wind
} from 'lucide-react'
import { getRiskColor, getRiskBgColor } from '../utils.js'

export default function ProjectOverview({ nodes, onNavigateToDashboard, onNavigateToRouting }) {
  const [activeTab, setActiveTab] = useState('architecture')
  const [calcForm, setCalcForm] = useState({ intensity: 45, duration: 12, suscep: 85 })

  // Interactive formula estimate
  const baseRisk = (calcForm.suscep / 100) * 40
  const rainFactor = Math.min(35, (calcForm.intensity * Math.min(calcForm.duration, 24)) / 25)
  const estScore = Math.min(100, Math.round(baseRisk + rainFactor + (calcForm.intensity > 50 ? 25 : 10)))
  
  let estBand = 'Low'
  if (estScore >= 75) estBand = 'Very High'
  else if (estScore >= 50) estBand = 'High'
  else if (estScore >= 25) estBand = 'Moderate'

  const stateCounts = nodes.reduce((acc, n) => {
    acc[n.state] = (acc[n.state] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-y-auto w-full" style={{ background: '#0d0d0d', color: '#e8e8e8' }}>
      {/* Top Banner / Hero */}
      <div 
        className="relative px-6 py-10 border-b overflow-hidden"
        style={{ 
          borderColor: '#2a2a2a',
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.22), rgba(13,13,13,0))'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                 style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
              <Award size={13} className="text-blue-400" />
              Smart India Hackathon (SIH) • Disaster Management & AI
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button 
                onClick={onNavigateToDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#fff' }}
              >
                <Activity size={13} className="text-green-400" />
                Open Live Dashboard
              </button>
              <button 
                onClick={onNavigateToRouting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', border: '1px solid #3b82f6' }}
              >
                <Navigation size={13} />
                Open Safe Routing
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#ffffff' }}>
            BHOORAKSHA
          </h1>
          <p className="text-base text-gray-300 max-w-3xl leading-relaxed mb-6">
            An end-to-end AI-powered Landslide Early Warning, 3D Digital Elevation Risk Intelligence, and Dynamic Evacuation Green Corridor Routing platform designed specifically for the rugged, high-vulnerability terrain of Northeast India.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: 'IoT Sensor Stations', val: '18 Active Nodes', sub: 'Across 8 NE States', icon: MapPin, color: '#3b82f6' },
              { label: 'AI Risk Engine', val: 'Random Forest + GBDT', sub: 'Calibrated Hydrometeorology', icon: Cpu, color: '#8b5cf6' },
              { label: '3D DEM & Elevation', val: 'Cesium 3D Terrain', sub: 'Slope & Catchment Analysis', icon: Layers, color: '#10b981' },
              { label: 'Safe Evacuation', val: 'Dynamic Green Corridors', sub: 'Real-Time Slope Avoidance', icon: Navigation, color: '#f59e0b' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="card p-4 flex flex-col justify-between" style={{ background: 'rgba(26,26,26,0.7)', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 11, color: '#a0a0a0' }}>{stat.label}</span>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                  <div className="text-base font-bold" style={{ color: '#fff' }}>{stat.val}</div>
                  <div style={{ fontSize: 10, color: '#6a6a6a', marginTop: 2 }}>{stat.sub}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b mb-8 overflow-x-auto pb-1" style={{ borderColor: '#2a2a2a' }}>
          {[
            { id: 'architecture', label: 'System Architecture & Workflow', icon: Server },
            { id: 'model', label: 'AI Risk Model & Sandbox', icon: Cpu },
            { id: 'routing', label: 'Safe Routing & Evacuation Logic', icon: Navigation },
            { id: 'nodes', label: '18-Station Sensor Network', icon: Radio },
            { id: 'protocols', label: 'NDMA Warning Protocols', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  active 
                    ? 'border-b-2 border-blue-500 text-white bg-[#1a1a1a]' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#141414]'
                }`}
                style={{ borderBottomColor: active ? '#3b82f6' : 'transparent' }}
              >
                <Icon size={14} className={active ? 'text-blue-400' : 'text-gray-500'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* TAB 1: SYSTEM ARCHITECTURE & WORKFLOW */}
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server size={18} className="text-blue-400" />
                    Multi-Tier System Pipeline & Disaster Workflow
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Continuous pipeline from IoT edge telemetry in mountainous catchments to instant emergency dispatch.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-medium" style={{ background: '#1d4ed822', color: '#60a5fa', border: '1px solid #1d4ed866' }}>
                  Full-Duplex Telemetry
                </span>
              </div>

              {/* Visual Pipeline Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
                {[
                  {
                    step: '01',
                    title: 'IoT Sensor Ingestion',
                    desc: 'Optical rain gauges (mm/hr), TDR soil moisture sensors, vibrating-wire piezometers, and acoustic MEMS tiltmeters at 18 nodes.',
                    color: '#3b82f6'
                  },
                  {
                    step: '02',
                    title: 'Hydrologic Modeling',
                    desc: 'Antecedent precipitation index (API 7-day decay), soil saturation thresholding, and pore-water pressure calculation.',
                    color: '#8b5cf6'
                  },
                  {
                    step: '03',
                    title: 'AI Hazard Prediction',
                    desc: 'Calibrated Random Forest classifier outputs probability of slope failure & dynamic risk score (0-100) per node.',
                    color: '#ec4899'
                  },
                  {
                    step: '04',
                    title: 'Geospatial 2D/3D Viz',
                    desc: 'Interactive Leaflet 2D GIS and Cesium 3D Digital Elevation Terrain rendering with hazard radii and slope angles.',
                    color: '#10b981'
                  },
                  {
                    step: '05',
                    title: 'Dynamic Safe Rerouting',
                    desc: 'Calculates high-clearance green corridors avoiding blocked hill roads with real-time NDRF/SDRF evacuation dispatch.',
                    color: '#f59e0b'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded flex flex-col justify-between" style={{ background: '#151515', border: '1px solid #2a2a2a' }}>
                    <div>
                      <div className="text-xs font-mono font-bold mb-2" style={{ color: item.color }}>STEP {item.step}</div>
                      <div className="text-sm font-semibold text-white mb-2">{item.title}</div>
                      <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t" style={{ borderColor: '#252525' }}>
                <div className="p-4 rounded" style={{ background: '#121212', border: '1px solid #222' }}>
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">FastAPI High-Speed Backend</div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Asynchronous Python FastAPI engine maintaining real-time node telemetry states, pre-computed 7-day rolling hydrological history, instant probabilistic inference using scikit-learn, and bi-directional WebSocket broadcast channels for sub-second emergency alerts.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800">FastAPI</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-purple-950 text-purple-300 border border-purple-800">Scikit-Learn</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-green-950 text-green-300 border border-green-800">WebSockets</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-gray-800 text-gray-300 border border-gray-700">Pandas / NumPy</span>
                  </div>
                </div>

                <div className="p-4 rounded" style={{ background: '#121212', border: '1px solid #222' }}>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">React 19 & Cesium 3D Geospatial Frontend</div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Modern high-performance single-page app utilizing CesiumJS 3D terrain rendering for true-to-life slope gradient inspection, Leaflet GIS for vector routing and danger circles, Recharts for rolling moisture & risk trend analysis, and responsive mobile-first UI.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800">CesiumJS 3D</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800">Leaflet GIS</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800">React 19 + Vite</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-rose-950 text-rose-300 border border-rose-800">TailwindCSS v4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Statement Card */}
            <div className="card p-6" style={{ background: 'linear-gradient(180deg, #18181b, #121214)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Why Northeast India Needs This Platform</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                The North Eastern Region (NER) of India accounts for over <span className="text-amber-400 font-semibold">52% of all landslide-related disasters</span> in India due to intense monsoonal cloudbursts, young folded Himalayan geology (shale and sandstone strata), high seismicity (Zone V), and severe slope cutting along national highways like NH-6, NH-29, NH-10, and NH-306.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded bg-black/40 border border-gray-800">
                  <div className="text-red-400 font-bold text-sm mb-1">Single-Point Artery Cuts</div>
                  <div className="text-gray-400">States like Sikkim, Mizoram, and Nagaland rely on single national highways that are severed for weeks when landslides strike.</div>
                </div>
                <div className="p-3 rounded bg-black/40 border border-gray-800">
                  <div className="text-yellow-400 font-bold text-sm mb-1">Flash Soil Saturation</div>
                  <div className="text-gray-400">Cherrapunji & Mawsynram experience precipitation over 500mm in 24h, causing sudden liquefaction and debris flows.</div>
                </div>
                <div className="p-3 rounded bg-black/40 border border-gray-800">
                  <div className="text-green-400 font-bold text-sm mb-1">AI-Powered Evacuation</div>
                  <div className="text-gray-400">BHOORAKSHA provides pre-failure early warnings up to 6 hours in advance with dynamically calculated alternate green corridors.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI MODEL & INTERACTIVE SANDBOX */}
        {activeTab === 'model' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Cpu size={18} className="text-purple-400" />
                AI Hazard Inference Architecture
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                The prediction engine pairs static GIS susceptibility (geology, fault line proximity, digital slope angle, aspect) with dynamic real-time triggers (rainfall intensity, cumulative duration, antecedent soil moisture).
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mathematical explanation */}
                <div className="space-y-4">
                  <div className="p-4 rounded" style={{ background: '#141414', border: '1px solid #2a2a2a' }}>
                    <div className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">Feature Vector Formulation</div>
                    <div className="p-3 rounded bg-black/60 font-mono text-xs text-green-400 border border-gray-800 mb-3">
                      X = [ Rainfall_Intensity_mm/hr, Duration_hr, Static_Susceptibility_0_1 ]
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      The model evaluates calibrated class probabilities <code className="text-purple-300">P(Failure | X)</code> using an ensemble trained on historical Geological Survey of India (GSI) landslide inventory data across Northeast India.
                    </p>
                  </div>

                  <div className="p-4 rounded" style={{ background: '#141414', border: '1px solid #2a2a2a' }}>
                    <div className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wide">Dynamic Hydrological State Update</div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      When a rainfall event occurs, dynamic soil moisture is updated using continuous mass-balance retention:
                    </p>
                    <div className="p-2.5 rounded bg-black/60 font-mono text-xs text-blue-300 border border-gray-800">
                      Moisture_New = min(95.0%, Moisture_Prev + (Intensity × Duration) × 0.5)
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator / Sandbox */}
                <div className="p-5 rounded" style={{ background: '#151515', border: '1px solid #333' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400" />
                      Live AI Risk Sandbox
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Interactive Tester
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Rainfall Intensity (mm/hr):</span>
                        <span className="font-mono text-white font-semibold">{calcForm.intensity} mm/hr</span>
                      </div>
                      <input 
                        type="range" min="0" max="150" value={calcForm.intensity}
                        onChange={e => setCalcForm(c => ({ ...c, intensity: Number(e.target.value) }))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Rainfall Duration (hours):</span>
                        <span className="font-mono text-white font-semibold">{calcForm.duration} hrs</span>
                      </div>
                      <input 
                        type="range" min="1" max="48" value={calcForm.duration}
                        onChange={e => setCalcForm(c => ({ ...c, duration: Number(e.target.value) }))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Static Terrain Susceptibility (%):</span>
                        <span className="font-mono text-white font-semibold">{calcForm.suscep}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={calcForm.suscep}
                        onChange={e => setCalcForm(c => ({ ...c, suscep: Number(e.target.value) }))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* Calculated Output Result */}
                    <div className="mt-4 p-4 rounded flex items-center justify-between" style={{ background: '#0e0e0e', border: `1px solid ${getRiskColor(estBand)}66` }}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Calculated Landslide Hazard</div>
                        <div className="text-xl font-bold flex items-center gap-2 mt-0.5" style={{ color: getRiskColor(estBand) }}>
                          {estScore}/100 • {estBand} Risk
                        </div>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                        style={{ background: getRiskColor(estBand) }}
                      >
                        {estScore}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAFE ROUTING & EVACUATION LOGIC */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Navigation size={18} className="text-emerald-400" />
                    Dynamic Safe Routing & Evacuation Green Corridors
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    How BHOORAKSHA calculates slope hazard clearance, bypasses blocked ghat sections, and guides emergency aid convoys.
                  </p>
                </div>
                <button 
                  onClick={onNavigateToRouting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff' }}
                >
                  Try Interactive Safe Router
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded border" style={{ background: '#161616', borderColor: '#ef444455' }}>
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    Direct / Vulnerable Route (Red)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Shortest standard highway alignment. Highly susceptible to sudden debris flows, river toe-cutting, and rock bursts in narrow valley canyons.
                  </p>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div>• Steep slope exposure &gt; 60%</div>
                    <div>• Active choke points flagged in real time</div>
                    <div>• Automatically marked RESTRICTED when risk &gt; 50</div>
                  </div>
                </div>

                <div className="p-4 rounded border" style={{ background: '#161616', borderColor: '#10b98155' }}>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    AI Safe Green Corridor (Green)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Contour-stabilized ridge routes with high drainage capacity and continuous geotechnical retaining structures.
                  </p>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div>• Minimal steep slope exposure (&lt; 18%)</div>
                    <div>• Mapped emergency shelters and medical stations</div>
                    <div>• Designated for NDRF/SDRF convoy priority</div>
                  </div>
                </div>

                <div className="p-4 rounded border" style={{ background: '#161616', borderColor: '#06b6d455' }}>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    Contingency Detour (Cyan)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    Secondary highland link routes suitable for light emergency response vehicles, telecommunications repairs, and scout vehicles.
                  </p>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div>• Monitored convoy escort corridors</div>
                    <div>• All-weather gravel / hard macadam</div>
                    <div>• Secondary helipad and fuel staging nodes</div>
                  </div>
                </div>
              </div>

              {/* Highway corridors covered */}
              <div className="p-4 rounded bg-black/40 border border-gray-800">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Pre-Configured High-Risk Mountain Highway Corridors
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Guwahati ➔ Shillong</div>
                    <div className="text-gray-400 text-[11px]">NH-6 GS Road vs Bhoirymbong Ridge</div>
                  </div>
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Dimapur ➔ Kohima</div>
                    <div className="text-gray-400 text-[11px]">NH-29 Dzüdza Canyon vs Niuland Bypass</div>
                  </div>
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Siliguri ➔ Gangtok</div>
                    <div className="text-gray-400 text-[11px]">NH-10 Teesta Cut vs Lava Rhenock Route</div>
                  </div>
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Silchar ➔ Aizawl</div>
                    <div className="text-gray-400 text-[11px]">NH-306 Kolasib Cut vs Darlawn Ridge</div>
                  </div>
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Itanagar ➔ Pasighat</div>
                    <div className="text-gray-400 text-[11px]">NH-415 Nirjuli Cut vs Foothill Highway</div>
                  </div>
                  <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
                    <div className="font-semibold text-white">Custom Corridor Routing</div>
                    <div className="text-gray-400 text-[11px]">Any Node-to-Node with Live Risk Buffers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 18-STATION SENSOR NETWORK */}
        {activeTab === 'nodes' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio size={18} className="text-blue-400" />
                    18 IoT Telemetry Stations in Northeast India
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Continuous monitoring across Nagaland, Meghalaya, Mizoram, Sikkim, Arunachal Pradesh, Assam, Manipur, and Tripura.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {Object.entries(stateCounts).map(([st, cnt]) => (
                    <span key={st} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700">
                      {st}: <strong className="text-white">{cnt}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Table of Nodes */}
              <div className="overflow-x-auto rounded border border-gray-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ background: '#171717', borderBottom: '1px solid #2a2a2a', color: '#a0a0a0' }}>
                      <th className="p-3">ID</th>
                      <th className="p-3">Station Name</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Latitude / Longitude</th>
                      <th className="p-3">Static Susceptibility</th>
                      <th className="p-3">Current Dynamic Risk</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map(n => {
                      const color = getRiskColor(n.risk_band)
                      return (
                        <tr key={n.id} className="border-b hover:bg-[#1a1a1a] transition-colors" style={{ borderColor: '#222' }}>
                          <td className="p-3 font-mono text-gray-500">#{n.id}</td>
                          <td className="p-3 font-semibold text-white">{n.name}</td>
                          <td className="p-3 text-gray-400">{n.state}</td>
                          <td className="p-3 font-mono text-gray-400 text-[11px]">{n.lat.toFixed(4)}°N, {n.lon.toFixed(4)}°E</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${n.static_susceptibility}%` }} />
                              </div>
                              <span className="font-mono text-gray-300">{n.static_susceptibility}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-bold font-mono" style={{ color }}>
                            {n.dynamic_risk_score.toFixed(1)} / 100
                          </td>
                          <td className="p-3">
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                              style={{ 
                                background: `${color}22`, 
                                color: color,
                                border: `1px solid ${color}44`
                              }}
                            >
                              {n.risk_band}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NDMA WARNING PROTOCOLS */}
        {activeTab === 'protocols' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Shield size={18} className="text-amber-400" />
                Multi-Hazard Early Warning Protocols & NDMA Matrix
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Standard operating guidelines aligned with the National Disaster Management Authority (NDMA) and India Meteorological Department (IMD).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    band: 'Very High (Red Alert)',
                    score: '75.0 – 100.0',
                    color: '#ef4444',
                    criteria: 'Rainfall > 40mm/hr, soil moisture > 80%, critical slope displacement detected.',
                    actions: [
                      'Immediate civilian evacuation of downstream slope settlements',
                      'Total vehicular prohibition on affected mountain highway sections',
                      'Pre-position NDRF / SDRF search & rescue units and earthmoving excavators',
                      'Activate district emergency relief camps and satellite radio communications'
                    ]
                  },
                  {
                    band: 'High (Orange Alert)',
                    score: '50.0 – 74.9',
                    color: '#f97316',
                    criteria: 'Rainfall 25–40mm/hr, high cumulative saturation, active pore-water pressure spike.',
                    actions: [
                      'Issue advisory to District Magistrates and public broadcast media',
                      'Enforce one-way traffic and heavy vehicle diversions to safe bypass routes',
                      'Continuous BRO patrols on vulnerable ghat cuttings and bridge approaches',
                      'Medical relief centers put on high readiness'
                    ]
                  },
                  {
                    band: 'Moderate (Yellow Watch)',
                    score: '25.0 – 49.9',
                    color: '#eab308',
                    criteria: 'Moderate continuous rain (10–25mm/hr), elevated antecedent moisture.',
                    actions: [
                      'Elevate sensor polling frequency to every 5 minutes',
                      'Highway police inspection of drainage culverts and catch pits',
                      'Advisory for night-time travelers on steep gradients'
                    ]
                  },
                  {
                    band: 'Low (Green Normal)',
                    score: '0.0 – 24.9',
                    color: '#22c55e',
                    criteria: 'Baseline moisture (&lt; 40%), low rainfall (&lt; 10mm/hr), stable tiltmeter readings.',
                    actions: [
                      'Routine IoT sensor calibration and solar battery health telemetry',
                      'Normal uninterrupted traffic flow across all corridors',
                      'Standard automated 15-minute data logging'
                    ]
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded border" style={{ background: '#141414', borderColor: `${item.color}55` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: item.color }}>{item.band}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-gray-300 border border-gray-800">
                        Score: {item.score}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 mb-3">
                      <strong className="text-gray-400">Trigger Threshold: </strong>{item.criteria}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mandatory Directives:</div>
                      {item.actions.map((act, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-1.5 text-xs text-gray-300">
                          <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: item.color }} />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
