import { useState, useEffect, useCallback } from 'react'
import {
  CloudRain, Wind, Thermometer, Droplets, RefreshCw,
  Edit3, CheckCircle, XCircle, Loader, CloudLightning,
  CloudSnow, Sun, Cloud, AlertTriangle, ChevronDown, ChevronUp, Wifi
} from 'lucide-react'

// Open-Meteo API — free, no API key needed
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'

// WMO Weather Interpretation Codes → icon + label
function getWeatherInfo(code) {
  if (code === 0) return { icon: Sun, label: 'Clear Sky', color: '#facc15' }
  if (code <= 3) return { icon: Cloud, label: 'Partly Cloudy', color: '#94a3b8' }
  if (code <= 48) return { icon: Cloud, label: 'Foggy / Overcast', color: '#64748b' }
  if (code <= 57) return { icon: CloudRain, label: 'Drizzle', color: '#60a5fa' }
  if (code <= 67) return { icon: CloudRain, label: 'Rain', color: '#3b82f6' }
  if (code <= 77) return { icon: CloudSnow, label: 'Snow / Sleet', color: '#a5b4fc' }
  if (code <= 82) return { icon: CloudRain, label: 'Rain Showers', color: '#2563eb' }
  if (code <= 86) return { icon: CloudSnow, label: 'Snow Showers', color: '#818cf8' }
  return { icon: CloudLightning, label: 'Thunderstorm', color: '#a21caf' }
}

async function fetchWeatherForNode(lat, lon) {
  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weathercode&hourly=precipitation&forecast_days=1&timezone=Asia%2FKolkata`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function WeatherPanel({ nodes, onWeatherUpdate, initialWeatherData }) {
  const [weatherData, setWeatherData] = useState(initialWeatherData || {}) // nodeId -> weather obj
  const [fetchStatus, setFetchStatus] = useState(initialWeatherData && Object.keys(initialWeatherData).length > 0 ? 'done' : 'idle')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [editingNode, setEditingNode] = useState(null)
  const [manualForm, setManualForm] = useState({ rainfall_intensity_mmhr: '', temperature_c: '', wind_kmh: '', humidity_pct: '' })
  const [expandedNode, setExpandedNode] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  const fetchAllWeather = useCallback(async () => {
    if (!nodes || nodes.length === 0) return
    setFetchStatus('loading')
    setFetchError(null)

    const results = {}
    const errors = []

    await Promise.allSettled(
      nodes.map(async (node) => {
        try {
          const data = await fetchWeatherForNode(node.lat, node.lon)
          const cur = data.current
          // Sum next 12h hourly precipitation
          const hourlyPrecip = data.hourly?.precipitation?.slice(0, 12) || []
          const totalRain12h = hourlyPrecip.reduce((s, v) => s + (v || 0), 0)
          results[node.id] = {
            temperature_c: cur.temperature_2m,
            humidity_pct: cur.relative_humidity_2m,
            rainfall_mmhr: cur.precipitation,      // current hour mm
            wind_kmh: cur.wind_speed_10m,
            weather_code: cur.weathercode,
            forecast_12h_mm: parseFloat(totalRain12h.toFixed(1)),
            source: 'live',
            fetched_at: new Date().toISOString()
          }
        } catch (e) {
          errors.push(node.name)
        }
      })
    )

    setWeatherData(prev => ({ ...prev, ...results }))
    setLastUpdated(new Date())
    setFetchStatus(errors.length > 0 ? 'partial' : 'done')
    if (errors.length > 0) setFetchError(`Failed for: ${errors.join(', ')}`)

    // Push rainfall data back to parent for risk model
    if (onWeatherUpdate) {
      nodes.forEach(node => {
        if (results[node.id]) {
          onWeatherUpdate(node.id, results[node.id])
        }
      })
    }
  }, [nodes, onWeatherUpdate])

  const openManualEdit = (node) => {
    const existing = weatherData[node.id]
    setManualForm({
      rainfall_intensity_mmhr: existing?.rainfall_mmhr ?? node.rainfall_intensity_mmhr ?? '',
      temperature_c: existing?.temperature_c ?? '',
      wind_kmh: existing?.wind_kmh ?? '',
      humidity_pct: existing?.humidity_pct ?? node.soil_moisture_pct ?? '',
    })
    setEditingNode(node)
  }

  const submitManual = () => {
    if (!editingNode) return
    const updated = {
      temperature_c: parseFloat(manualForm.temperature_c) || null,
      humidity_pct: parseFloat(manualForm.humidity_pct) || null,
      rainfall_mmhr: parseFloat(manualForm.rainfall_intensity_mmhr) || 0,
      wind_kmh: parseFloat(manualForm.wind_kmh) || null,
      weather_code: null,
      forecast_12h_mm: null,
      source: 'manual',
      fetched_at: new Date().toISOString()
    }
    setWeatherData(prev => ({ ...prev, [editingNode.id]: updated }))
    if (onWeatherUpdate) onWeatherUpdate(editingNode.id, updated)
    setEditingNode(null)
  }

  // Auto-fetch on mount
  useEffect(() => {
    if (nodes && nodes.length > 0) fetchAllWeather()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const statusColor = {
    idle: '#6a6a6a',
    loading: '#3b82f6',
    done: '#22c55e',
    partial: '#f97316',
    error: '#ef4444',
  }

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #2a2a2a',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        borderBottom: '1px solid #2a2a2a',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CloudRain size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', letterSpacing: '0.05em' }}>
              LIVE WEATHER FEED
            </div>
            <div style={{ fontSize: 10, color: '#6a6a6a', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: statusColor[fetchStatus],
                boxShadow: `0 0 4px ${statusColor[fetchStatus]}`,
                animation: fetchStatus === 'loading' ? 'pulse 1s infinite' : 'none'
              }} />
              {fetchStatus === 'loading' && 'Fetching from Open-Meteo...'}
              {fetchStatus === 'done' && `Updated ${lastUpdated?.toLocaleTimeString('en-IN')}`}
              {fetchStatus === 'partial' && 'Partial data — some nodes offline'}
              {fetchStatus === 'idle' && 'Not fetched yet'}
              {fetchStatus === 'error' && 'Fetch failed'}
            </div>
          </div>
        </div>

        <button
          onClick={fetchAllWeather}
          disabled={fetchStatus === 'loading'}
          title="Refresh live weather for all nodes"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: fetchStatus === 'loading' ? '#1e293b' : '#1d4ed8',
            border: '1px solid #3b82f666',
            color: '#fff', fontSize: 10, cursor: fetchStatus === 'loading' ? 'not-allowed' : 'pointer',
            opacity: fetchStatus === 'loading' ? 0.6 : 1,
          }}
        >
          {fetchStatus === 'loading'
            ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
            : <RefreshCw size={11} />}
          {fetchStatus === 'loading' ? 'Fetching...' : 'Refresh All'}
        </button>
      </div>

      {fetchError && (
        <div style={{
          background: '#7f1d1d22', borderBottom: '1px solid #ef444433',
          padding: '6px 16px', fontSize: 10, color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <AlertTriangle size={10} />
          {fetchError}
        </div>
      )}

      {/* Legend row */}
      <div style={{
        padding: '6px 16px', display: 'flex', gap: 16, borderBottom: '1px solid #1e1e1e'
      }}>
        <span style={{ fontSize: 9, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Wifi size={8} /> Live (Open-Meteo)
        </span>
        <span style={{ fontSize: 9, color: '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Edit3 size={8} /> Manual Override
        </span>
        <span style={{ fontSize: 9, color: '#6a6a6a', marginLeft: 'auto' }}>
          {Object.keys(weatherData).length}/{nodes?.length || 0} nodes loaded
        </span>
      </div>

      {/* Node weather list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {(nodes || []).map(node => {
          const wx = weatherData[node.id]
          const isExpanded = expandedNode === node.id
          const WeatherIcon = wx?.weather_code != null ? getWeatherInfo(wx.weather_code).icon : CloudRain
          const wxColor = wx?.weather_code != null ? getWeatherInfo(wx.weather_code).color : '#6a6a6a'
          const wxLabel = wx?.weather_code != null ? getWeatherInfo(wx.weather_code).label : '—'
          const isManual = wx?.source === 'manual'
          const rain = wx?.rainfall_mmhr ?? node.rainfall_intensity_mmhr ?? 0

          return (
            <div key={node.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
              {/* Row */}
              <div
                onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                style={{
                  padding: '8px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isExpanded ? '#15203399' : 'transparent',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = '#1a1a1a')}
                onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
              >
                {/* Weather icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: wx ? `${wxColor}18` : '#1e1e1e',
                  border: `1px solid ${wx ? wxColor + '44' : '#2a2a2a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {wx
                    ? <WeatherIcon size={13} color={wxColor} />
                    : <CloudRain size={13} color="#4a4a4a" />}
                </div>

                {/* Name & state */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#cfcfcf', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {node.name}
                    {isManual && (
                      <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: '#f9731622', color: '#f97316', border: '1px solid #f9731644' }}>
                        MANUAL
                      </span>
                    )}
                    {wx && !isManual && (
                      <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44' }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#6a6a6a' }}>
                    {wx ? wxLabel : 'No data fetched'}
                  </div>
                </div>

                {/* Rain quick stat */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: rain > 20 ? '#ef4444' : rain > 5 ? '#f97316' : '#60a5fa' }}>
                    {rain.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, color: '#6a6a6a' }}>mm/hr</div>
                </div>

                {/* Expand arrow */}
                <div style={{ flexShrink: 0, marginLeft: 4 }}>
                  {isExpanded ? <ChevronUp size={12} color="#6a6a6a" /> : <ChevronDown size={12} color="#6a6a6a" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  padding: '10px 16px 14px',
                  background: '#0d1421',
                  borderTop: '1px solid #1e293b'
                }}>
                  {/* Live weather grid */}
                  {wx ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      {[
                        { icon: Thermometer, label: 'Temperature', value: wx.temperature_c != null ? `${wx.temperature_c.toFixed(1)} °C` : '—', color: '#fb923c' },
                        { icon: Droplets, label: 'Humidity', value: wx.humidity_pct != null ? `${wx.humidity_pct}%` : '—', color: '#60a5fa' },
                        { icon: CloudRain, label: 'Rainfall (Now)', value: `${wx.rainfall_mmhr?.toFixed(1) ?? '0.0'} mm/hr`, color: '#3b82f6' },
                        { icon: Wind, label: 'Wind Speed', value: wx.wind_kmh != null ? `${wx.wind_kmh.toFixed(1)} km/h` : '—', color: '#a78bfa' },
                        ...(wx.forecast_12h_mm != null ? [{ icon: CloudRain, label: '12h Forecast', value: `${wx.forecast_12h_mm} mm`, color: '#f97316' }] : []),
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} style={{
                          background: '#111827', borderRadius: 6, padding: '7px 10px',
                          border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8
                        }}>
                          <Icon size={12} color={color} />
                          <div>
                            <div style={{ fontSize: 9, color: '#6a6a6a' }}>{label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db' }}>{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 12, padding: '8px 0' }}>
                      No weather data loaded. Click "Refresh All" or enter manually.
                    </div>
                  )}

                  {/* Manual entry button */}
                  <button
                    onClick={e => { e.stopPropagation(); openManualEdit(node) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 6, width: '100%', justifyContent: 'center',
                      background: '#1e293b', border: '1px solid #334155',
                      color: '#94a3b8', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={11} />
                    Override with Manual Values
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Manual edit modal */}
      {editingNode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#000000bb', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={() => setEditingNode(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111827', border: '1px solid #334155', borderRadius: 12,
              width: 380, padding: 24, boxShadow: '0 25px 60px #00000090'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Edit3 size={15} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8' }}>
                  Manual Weather Override
                </div>
                <div style={{ fontSize: 11, color: '#6a6a6a' }}>{editingNode.name}, {editingNode.state}</div>
              </div>
            </div>

            {[
              { key: 'rainfall_intensity_mmhr', label: 'Rainfall Intensity', unit: 'mm/hr', min: 0, max: 200, step: 0.1, icon: CloudRain, color: '#3b82f6' },
              { key: 'temperature_c', label: 'Temperature', unit: '°C', min: -5, max: 45, step: 0.1, icon: Thermometer, color: '#fb923c' },
              { key: 'humidity_pct', label: 'Relative Humidity', unit: '%', min: 0, max: 100, step: 1, icon: Droplets, color: '#60a5fa' },
              { key: 'wind_kmh', label: 'Wind Speed', unit: 'km/h', min: 0, max: 200, step: 0.5, icon: Wind, color: '#a78bfa' },
            ].map(({ key, label, unit, min, max, step, icon: Icon, color }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Icon size={11} color={color} />
                  {label} <span style={{ color: '#6a6a6a' }}>({unit})</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="range"
                    min={min} max={max} step={step}
                    value={manualForm[key] || 0}
                    onChange={e => setManualForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ flex: 1, accentColor: color }}
                  />
                  <input
                    type="number"
                    min={min} max={max} step={step}
                    value={manualForm[key]}
                    onChange={e => setManualForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{
                      width: 64, padding: '4px 8px', borderRadius: 6, fontSize: 12,
                      background: '#1e293b', border: '1px solid #334155', color: '#e8e8e8',
                      textAlign: 'right'
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#6a6a6a', width: 36 }}>{unit}</span>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setEditingNode(null)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12,
                  background: '#1e293b', border: '1px solid #334155',
                  color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <XCircle size={13} /> Cancel
              </button>
              <button
                onClick={submitManual}
                style={{
                  flex: 2, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                  border: '1px solid #3b82f666', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <CheckCircle size={13} /> Apply Manual Values
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
