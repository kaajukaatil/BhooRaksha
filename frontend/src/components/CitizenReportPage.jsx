import { useState, useMemo } from 'react'
import L from 'leaflet'
import { 
  AlertTriangle, CheckCircle2, Clock, MapPin, Send, ThumbsUp, 
  Camera, Filter, Phone, ShieldAlert, AlertCircle, Plus, Eye,
  User, Check, Flame, Waves, HelpCircle, Navigation
} from 'lucide-react'
import { formatDateTime } from '../utils.js'

const INITIAL_REPORTS = [
  {
    id: 101,
    title: 'Active Mudslide & Falling Boulders near Sonapur Scarp',
    category: 'Rockfall & Mudslide',
    highway: 'NH-6 (Guwahati-Shillong)',
    locationName: 'Sonapur High Cut, KM 48.2',
    coords: [25.7350, 91.8920],
    severity: 'Critical',
    status: 'Verified - Road Blocked',
    reporterName: 'L. Marwein (Commercial Driver)',
    reporterPhone: '+91 98621-XXXXX',
    reporterType: 'Highway Commuter',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    description: 'Heavy continuous rain caused 3 large boulders to tumble onto both lanes. Soil sludge is actively flowing down the scarp. Vehicles stuck on both sides.',
    confirmations: 14,
    userConfirmed: false,
    imageType: 'rockfall',
    actionStatus: 'BRO Bulldozer Unit En Route',
  },
  {
    id: 102,
    title: 'Deep Transverse Road Cracks on Dzüdza River Bridge Approach',
    category: 'Road Crack & Subsidence',
    highway: 'NH-29 (Dimapur-Kohima)',
    locationName: 'Dzüdza Sinking Zone, KM 34',
    coords: [25.7600, 93.9300],
    severity: 'Severe',
    status: 'Verified - Single Lane Open',
    reporterName: 'T. Jamir (Local Resident)',
    reporterPhone: '+91 94360-XXXXX',
    reporterType: 'Village Defense Party',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    description: 'Road surface dropped by approx 1.5 feet on the hillside lane. Retaining wall showing visible shear tilt. Dangerous for heavy trucks.',
    confirmations: 22,
    userConfirmed: true,
    imageType: 'crack',
    actionStatus: 'SDRF Traffic Diversion Active',
  },
  {
    id: 103,
    title: 'Debris Flow & River Scour at 29th Mile',
    category: 'Debris Flow & River Flood',
    highway: 'NH-10 (Siliguri-Gangtok)',
    locationName: '29th Mile Teesta Cut',
    coords: [26.9600, 88.4900],
    severity: 'Critical',
    status: 'Verified - Total Closure',
    reporterName: 'Pema Bhutia (Civil Defense)',
    reporterPhone: '+91 97330-XXXXX',
    reporterType: 'Civil Defense Volunteer',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    description: 'Teesta river swelling rapidly, scouring base of the highway. Slurry of muck and trees blocking roadway. Traffic diverted to Lava-Gorubathan route.',
    confirmations: 38,
    userConfirmed: false,
    imageType: 'debris',
    actionStatus: 'Emergency Evacuation Active',
  },
  {
    id: 104,
    title: 'Blocked Drainage Culvert Causing Slope Waterlogging',
    category: 'Blocked Drainage',
    highway: 'NH-306 (Silchar-Aizawl)',
    locationName: 'Vairengte Hill Saddle, KM 41',
    coords: [24.5100, 92.7600],
    severity: 'Moderate',
    status: 'Under Investigation',
    reporterName: 'R. Lalhmingliana (Commuter)',
    reporterPhone: '+91 94361-XXXXX',
    reporterType: 'Local Resident',
    timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    description: 'Culvert clogged with timber debris, overflow is eroding the toe of the lower tea terrace slope.',
    confirmations: 6,
    userConfirmed: false,
    imageType: 'water',
    actionStatus: 'Local PWD Team Notified',
  }
]

export default function CitizenReportPage({ nodes, onSimulateSuccess }) {
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedReport, setSelectedReport] = useState(INITIAL_REPORTS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Active Landslide & Debris Flow',
    highway: 'NH-6 (Guwahati-Shillong)',
    locationName: '',
    severity: 'Severe',
    description: '',
    reporterName: '',
    reporterPhone: '',
    reporterType: 'Local Resident',
    imageType: 'rockfall'
  })

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false
      if (filterCategory !== 'all' && r.category !== filterCategory) return false
      return true
    })
  }, [reports, filterSeverity, filterCategory])

  const handleConfirm = (id) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        const isConf = r.userConfirmed
        return {
          ...r,
          confirmations: isConf ? r.confirmations - 1 : r.confirmations + 1,
          userConfirmed: !isConf
        }
      }
      return r
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        title: form.title || `${form.category} near ${form.locationName || form.highway}`,
        category: form.category,
        highway: form.highway,
        locationName: form.locationName || 'Monitored Highway Stretch',
        coords: [25.65 + (Math.random() - 0.5) * 1.5, 92.5 + (Math.random() - 0.5) * 2.0],
        severity: form.severity,
        status: 'Newly Reported - Verification Pending',
        reporterName: form.reporterName || 'Anonymous Citizen Observer',
        reporterPhone: form.reporterPhone || 'Not Provided',
        reporterType: form.reporterType,
        timestamp: new Date().toISOString(),
        description: form.description || 'Observed hazardous slope/road condition. Authorities requested to verify.',
        confirmations: 1,
        userConfirmed: true,
        imageType: form.imageType,
        actionStatus: 'Dispatched to District Control Room',
      }

      setReports([newReport, ...reports])
      setSelectedReport(newReport)
      setIsSubmitting(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 5000)

      // Reset form
      setForm({
        title: '',
        category: 'Active Landslide & Debris Flow',
        highway: 'NH-6 (Guwahati-Shillong)',
        locationName: '',
        severity: 'Severe',
        description: '',
        reporterName: '',
        reporterPhone: '',
        reporterType: 'Local Resident',
        imageType: 'rockfall'
      })
    }, 600)
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return { bg: '#ef444422', text: '#ef4444', border: '#ef444466' }
      case 'Severe':
        return { bg: '#f9731622', text: '#f97316', border: '#f9731666' }
      case 'Moderate':
        return { bg: '#eab30822', text: '#eab308', border: '#eab30866' }
      default:
        return { bg: '#22c55e22', text: '#22c55e', border: '#22c55e66' }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden" style={{ background: '#0d0d0d', color: '#e8e8e8' }}>
      
      {/* Top Banner & Quick Metrics */}
      <div 
        className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: '#2a2a2a', background: '#121212' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert size={16} />
            </div>
            <h2 className="text-base font-bold tracking-wide text-white">
              CITIZEN INCIDENT &amp; HAZARD REPORTING PORTAL
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              CROWD-SOURCED GIS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Empowering commuters, local residents, and volunteers to report real-time landslides, rockfalls, and road sinking across NE India.
          </p>
        </div>

        {/* Quick Helpline Numbers */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/60 border border-red-800 text-red-300">
            <Phone size={13} className="text-red-400 animate-pulse" />
            <span>NDMA Helpline: <strong>1070</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
            <Phone size={13} className="text-blue-400" />
            <span>State Disaster: <strong>1077</strong></span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left = Submission Form + Stats, Right = Live Incident Feed & Details */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        
        {/* LEFT COLUMN: SUBMISSION FORM */}
        <div 
          className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden border-r p-5 space-y-4"
          style={{ width: 440, borderColor: '#2a2a2a', background: '#111111' }}
        >
          {/* Form Header */}
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: '#262626' }}>
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-emerald-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Submit New Incident Report
              </span>
            </div>
            <span className="text-[10px] text-gray-400">GPS Auto-Tagged</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Incident Title */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Incident Summary / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mudslide & large tree blocking roadway"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Hazard Category
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded px-2 py-1.5 text-xs outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
                >
                  <option value="Active Landslide & Debris Flow">Active Landslide</option>
                  <option value="Rockfall & Mudslide">Rockfall / Boulder</option>
                  <option value="Road Crack & Subsidence">Road Crack / Sinkhole</option>
                  <option value="Debris Flow & River Flood">Flash Debris Flood</option>
                  <option value="Blocked Drainage">Blocked Drainage Culvert</option>
                  <option value="Waterlogged Slope">Waterlogged Hill Slope</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Severity Level
                </label>
                <select
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                  className="w-full rounded px-2 py-1.5 text-xs outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
                >
                  <option value="Critical">🔴 Critical (Total Blockage)</option>
                  <option value="Severe">🟠 Severe (High Hazard)</option>
                  <option value="Moderate">🟡 Moderate (1-Lane Impeded)</option>
                  <option value="Minor">🟢 Minor (Slow Caution)</option>
                </select>
              </div>
            </div>

            {/* Highway & Specific Location */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Highway / Corridor
                </label>
                <select
                  value={form.highway}
                  onChange={e => setForm(f => ({ ...f, highway: e.target.value }))}
                  className="w-full rounded px-2 py-1.5 text-xs outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
                >
                  <option value="NH-6 (Guwahati-Shillong)">NH-6 (Guwahati-Shillong)</option>
                  <option value="NH-29 (Dimapur-Kohima)">NH-29 (Dimapur-Kohima)</option>
                  <option value="NH-10 (Siliguri-Gangtok)">NH-10 (Siliguri-Gangtok)</option>
                  <option value="NH-306 (Silchar-Aizawl)">NH-306 (Silchar-Aizawl)</option>
                  <option value="NH-415 (Itanagar-Pasighat)">NH-415 (Itanagar-Pasighat)</option>
                  <option value="State Hill Highway / Local Road">State Hill Highway</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Exact Landmark / KM Milestone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Pagla Pahar, KM 19"
                  value={form.locationName}
                  onChange={e => setForm(f => ({ ...f, locationName: e.target.value }))}
                  className="w-full rounded px-2.5 py-1.5 text-xs outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Detailed Observation / Obstruction Status *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe slope condition, size of debris, traffic stoppage, injuries, or river levels..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
              />
            </div>

            {/* Photo / Media Attachment Simulation */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1 flex items-center justify-between">
                <span>Attach Incident Photo Evidence</span>
                <span className="text-[10px] text-blue-400">Sample Simulation</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'rockfall', label: '🪨 Rockfall' },
                  { id: 'crack', label: '📉 Road Crack' },
                  { id: 'debris', label: '🌊 Debris Flow' },
                  { id: 'water', label: '💧 Saturated' },
                ].map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setForm(f => ({ ...f, imageType: p.id }))}
                    className={`p-1.5 rounded text-[11px] font-medium transition-all ${
                      form.imageType === p.id 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'bg-[#1e1e1e] text-gray-400 border border-gray-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reporter Contact Info */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t" style={{ borderColor: '#262626' }}>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anil Sharma"
                  value={form.reporterName}
                  onChange={e => setForm(f => ({ ...f, reporterName: e.target.value }))}
                  className="w-full rounded px-2 py-1 text-xs outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98XXX-XXXXX"
                  value={form.reporterPhone}
                  onChange={e => setForm(f => ({ ...f, reporterPhone: e.target.value }))}
                  className="w-full rounded px-2 py-1 text-xs outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Observer Role</label>
                <select
                  value={form.reporterType}
                  onChange={e => setForm(f => ({ ...f, reporterType: e.target.value }))}
                  className="w-full rounded px-1.5 py-1 text-xs outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                >
                  <option value="Local Resident">Resident</option>
                  <option value="Highway Commuter">Commuter</option>
                  <option value="Truck / Bus Driver">Driver</option>
                  <option value="Civil Defense">Volunteer</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid #3b82f6',
                boxShadow: '0 0 14px rgba(37,99,235,0.3)'
              }}
            >
              <Send size={14} />
              {isSubmitting ? 'Verifying & Broadcasting...' : 'Submit Incident & Alert Disaster Units'}
            </button>
          </form>

          {/* Success Notification Alert */}
          {showSuccessToast && (
            <div 
              className="p-3 rounded flex items-center gap-2 text-xs animate-bounce"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399' }}
            >
              <CheckCircle2 size={16} />
              <span>
                <strong>Report Successfully Logged!</strong> Dispatched to BRO / SDRF emergency response network.
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE INCIDENT STREAM & VERIFIED REPORTS */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          
          {/* Filter Bar */}
          <div className="p-3 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: '#2a2a2a', background: '#141414' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Filter size={13} />
                Filters:
              </span>
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="rounded px-2 py-1 text-xs outline-none"
                style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
              >
                <option value="all">All Severities ({reports.length})</option>
                <option value="Critical">Critical Only</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
              </select>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="rounded px-2 py-1 text-xs outline-none"
                style={{ background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#fff' }}
              >
                <option value="all">All Categories</option>
                <option value="Rockfall & Mudslide">Rockfall / Boulders</option>
                <option value="Road Crack & Subsidence">Road Cracks</option>
                <option value="Debris Flow & River Flood">Debris Flow</option>
                <option value="Blocked Drainage">Blocked Drainage</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              Showing <strong className="text-white">{filteredReports.length}</strong> active community reports
            </div>
          </div>

          {/* Incident Feed List & Detailed Inspector Split */}
          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            
            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ borderRight: '1px solid #2a2a2a' }}>
              {filteredReports.map(report => {
                const isSelected = selectedReport?.id === report.id
                const badge = getSeverityBadge(report.severity)

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      isSelected ? 'bg-[#1c1c20] border-blue-500 shadow-md ring-1 ring-blue-500/50' : 'bg-[#151515] border-gray-800 hover:bg-[#191919]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
                            style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                          >
                            {report.severity}
                          </span>
                          <span className="text-xs font-semibold text-blue-400">{report.highway}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                          {report.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {formatDateTime(report.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-3">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs" style={{ borderColor: '#262626' }}>
                      <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                        <MapPin size={12} className="text-gray-500" />
                        <span>{report.locationName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirm(report.id)
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                            report.userConfirmed 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-[#222] text-gray-300 hover:bg-[#282828] border border-gray-700'
                          }`}
                        >
                          <ThumbsUp size={11} className={report.userConfirmed ? 'text-white' : 'text-blue-400'} />
                          <span>{report.confirmations} Confirmed</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Incident Detail Inspector */}
            {selectedReport && (
              <div 
                className="overflow-y-auto p-5 space-y-4"
                style={{ width: 360, background: '#121212' }}
              >
                <div className="pb-3 border-b" style={{ borderColor: '#262626' }}>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block mb-2"
                    style={{ 
                      background: getSeverityBadge(selectedReport.severity).bg, 
                      color: getSeverityBadge(selectedReport.severity).text, 
                      border: `1px solid ${getSeverityBadge(selectedReport.severity).border}` 
                    }}
                  >
                    {selectedReport.severity} Hazard
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedReport.title}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    <span>Reported {formatDateTime(selectedReport.timestamp)}</span>
                  </div>
                </div>

                {/* Location & Highway */}
                <div className="p-3 rounded bg-[#181818] border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highway:</span>
                    <strong className="text-blue-400">{selectedReport.highway}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white font-medium">{selectedReport.locationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">GPS Coordinates:</span>
                    <span className="font-mono text-gray-300">{selectedReport.coords[0].toFixed(4)}°N, {selectedReport.coords[1].toFixed(4)}°E</span>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Field Description
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed p-3 rounded bg-black/40 border border-gray-800">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Action / Response Status */}
                <div className="p-3 rounded border" style={{ background: '#1c1917', borderColor: '#f9731666' }}>
                  <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">
                    Disaster Authority Dispatch Status
                  </div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    {selectedReport.actionStatus}
                  </div>
                </div>

                {/* Reporter Info */}
                <div className="p-3 rounded bg-[#161616] border border-gray-800 text-xs space-y-1.5">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Reported By
                  </div>
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <User size={13} className="text-blue-400" />
                    {selectedReport.reporterName} ({selectedReport.reporterType})
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Phone: {selectedReport.reporterPhone}
                  </div>
                </div>

                {/* Confirm Incident Button */}
                <button
                  onClick={() => handleConfirm(selectedReport.id)}
                  className={`w-full py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedReport.userConfirmed 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#252525] text-gray-200 hover:bg-[#2d2d2d] border border-gray-700'
                  }`}
                >
                  <ThumbsUp size={13} />
                  {selectedReport.userConfirmed ? '✓ You Confirmed This Incident' : 'Confirm & Validate This Hazard'}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}
