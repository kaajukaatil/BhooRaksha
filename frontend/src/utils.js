export function getRiskBand(score) {
  if (score >= 75) return 'Very High'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Moderate'
  return 'Low'
}

export function getRiskColor(band) {
  switch (band) {
    case 'Very High': return '#ef4444'
    case 'High':      return '#f97316'
    case 'Moderate':  return '#eab308'
    case 'Low':       return '#22c55e'
    default:          return '#6a6a6a'
  }
}

export function getRiskBgColor(band) {
  switch (band) {
    case 'Very High': return '#ef444422'
    case 'High':      return '#f9731622'
    case 'Moderate':  return '#eab30822'
    case 'Low':       return '#22c55e22'
    default:          return '#6a6a6a22'
  }
}

export function getRiskClass(band) {
  switch (band) {
    case 'Very High': return 'risk-very-high'
    case 'High':      return 'risk-high'
    case 'Moderate':  return 'risk-moderate'
    case 'Low':       return 'risk-low'
    default:          return ''
  }
}

export function countByBand(nodes) {
  return {
    'Very High': nodes.filter(n => n.risk_band === 'Very High').length,
    'High':      nodes.filter(n => n.risk_band === 'High').length,
    'Moderate':  nodes.filter(n => n.risk_band === 'Moderate').length,
    'Low':       nodes.filter(n => n.risk_band === 'Low').length,
  }
}

export function formatTime(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Derive people in evacuation range (rough simulation)
export function calcEvacuationCount(nodes) {
  const base = nodes.reduce((sum, n) => {
    const factor = n.risk_band === 'Very High' ? 1200
                 : n.risk_band === 'High'      ? 600
                 : n.risk_band === 'Moderate'  ? 200
                 : 50
    return sum + factor
  }, 0)
  return base
}

// Derive infra-at-risk totals
export function calcInfraAtRisk(nodes) {
  const bands = countByBand(nodes)
  return {
    'Roads (km)':      bands['Very High'] * 18 + bands['High'] * 9 + bands['Moderate'] * 4,
    'Bridges':         bands['Very High'] * 3  + bands['High'] * 2 + bands['Moderate'] * 1,
    'Telecom Towers':  bands['Very High'] * 5  + bands['High'] * 3 + bands['Moderate'] * 1,
    'Power Lines (km)': bands['Very High'] * 12 + bands['High'] * 6 + bands['Moderate'] * 2,
  }
}

/**
 * Recompute dynamic risk score for a node using live or manual weather data.
 * Mirrors the backend Random Forest feature formula (client-side approximation).
 * Features: rainfall_intensity, soil_moisture (proxied by humidity %), static_susceptibility
 */
export function computeRiskFromWeather(node, weather) {
  if (!weather) return null
  const { rainfall_mmhr = 0, humidity_pct = null, source } = weather

  const staticFactor = (node.static_susceptibility / 100.0) * 40.0

  // Soil moisture proxy: use live humidity if available, else carry existing value
  const moistureEstimate = humidity_pct != null
    ? Math.min(80, 20 + (humidity_pct / 100) * 60)  // scale 0–100% humidity → 20–80% soil moisture
    : (node.soil_moisture_pct ?? 30)
  const moistureFactor = ((moistureEstimate - 20) / 60) * 30.0

  // Rainfall factor (0–200mm/hr → 0–30 risk points)
  const rainfallFactor = Math.min(30, (rainfall_mmhr / 60.0) * 30.0)

  const rawScore = staticFactor + moistureFactor + rainfallFactor
  const score = Math.min(100, Math.max(0, parseFloat(rawScore.toFixed(1))))

  return {
    dynamic_risk_score: score,
    risk_band: getRiskBand(score),
    rainfall_intensity_mmhr: rainfall_mmhr,
    soil_moisture_pct: parseFloat(moistureEstimate.toFixed(1)),
    weather_source: source || 'live',
    last_updated: new Date().toISOString(),
  }
}

