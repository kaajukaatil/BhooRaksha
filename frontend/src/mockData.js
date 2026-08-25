// Fallback offline mock data matching GSI 18 IoT sensor stations
export const INITIAL_NODES = [
  { id: 1, name: "Kohima", state: "Nagaland", lat: 25.6751, lon: 94.1086, static_susceptibility: 93.3, rainfall_intensity_mmhr: 12.4, soil_moisture_pct: 58.2, slope_displacement_mm: 3.1, pore_pressure_kpa: 42.0, dynamic_risk_score: 82.4, risk_band: "Very High" },
  { id: 2, name: "Wokha", state: "Nagaland", lat: 26.0996, lon: 94.2649, static_susceptibility: 56.0, rainfall_intensity_mmhr: 4.2, soil_moisture_pct: 35.1, slope_displacement_mm: 0.8, pore_pressure_kpa: 18.5, dynamic_risk_score: 38.6, risk_band: "Moderate" },
  { id: 3, name: "Tuensang", state: "Nagaland", lat: 26.2667, lon: 94.8333, static_susceptibility: 59.3, rainfall_intensity_mmhr: 6.8, soil_moisture_pct: 41.0, slope_displacement_mm: 1.2, pore_pressure_kpa: 22.0, dynamic_risk_score: 46.2, risk_band: "Moderate" },
  { id: 4, name: "Shillong", state: "Meghalaya", lat: 25.5788, lon: 91.8933, static_susceptibility: 93.5, rainfall_intensity_mmhr: 18.2, soil_moisture_pct: 64.5, slope_displacement_mm: 4.2, pore_pressure_kpa: 48.3, dynamic_risk_score: 88.7, risk_band: "Very High" },
  { id: 5, name: "Jowai", state: "Meghalaya", lat: 25.45, lon: 92.2, static_susceptibility: 50.6, rainfall_intensity_mmhr: 2.1, soil_moisture_pct: 31.0, slope_displacement_mm: 0.4, pore_pressure_kpa: 14.2, dynamic_risk_score: 28.5, risk_band: "Moderate" },
  { id: 6, name: "Aizawl", state: "Mizoram", lat: 23.7271, lon: 92.7176, static_susceptibility: 97.3, rainfall_intensity_mmhr: 22.5, soil_moisture_pct: 71.2, slope_displacement_mm: 5.8, pore_pressure_kpa: 54.1, dynamic_risk_score: 94.1, risk_band: "Very High" },
  { id: 7, name: "Champhai", state: "Mizoram", lat: 23.4667, lon: 93.3167, static_susceptibility: 63.5, rainfall_intensity_mmhr: 5.0, soil_moisture_pct: 38.4, slope_displacement_mm: 1.1, pore_pressure_kpa: 20.1, dynamic_risk_score: 44.8, risk_band: "Moderate" },
  { id: 8, name: "Lunglei", state: "Mizoram", lat: 22.8874, lon: 92.7379, static_susceptibility: 87.9, rainfall_intensity_mmhr: 14.1, soil_moisture_pct: 54.6, slope_displacement_mm: 2.9, pore_pressure_kpa: 39.4, dynamic_risk_score: 76.5, risk_band: "Very High" },
  { id: 9, name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lon: 93.6053, static_susceptibility: 59.7, rainfall_intensity_mmhr: 8.5, soil_moisture_pct: 44.2, slope_displacement_mm: 1.5, pore_pressure_kpa: 24.8, dynamic_risk_score: 52.0, risk_band: "High" },
  { id: 10, name: "Ziro", state: "Arunachal Pradesh", lat: 27.5486, lon: 93.8259, static_susceptibility: 71.4, rainfall_intensity_mmhr: 11.0, soil_moisture_pct: 50.8, slope_displacement_mm: 2.3, pore_pressure_kpa: 33.2, dynamic_risk_score: 64.9, risk_band: "High" },
  { id: 11, name: "Along", state: "Arunachal Pradesh", lat: 28.1667, lon: 94.8, static_susceptibility: 29.1, rainfall_intensity_mmhr: 0.5, soil_moisture_pct: 22.0, slope_displacement_mm: 0.1, pore_pressure_kpa: 9.5, dynamic_risk_score: 18.2, risk_band: "Low" },
  { id: 12, name: "Gangtok", state: "Sikkim", lat: 27.3389, lon: 88.6065, static_susceptibility: 99.4, rainfall_intensity_mmhr: 28.0, soil_moisture_pct: 78.4, slope_displacement_mm: 6.4, pore_pressure_kpa: 58.7, dynamic_risk_score: 96.8, risk_band: "Very High" },
  { id: 13, name: "Kalimpong", state: "Sikkim/WB border", lat: 27.0669, lon: 88.4712, static_susceptibility: 95.8, rainfall_intensity_mmhr: 19.4, soil_moisture_pct: 66.0, slope_displacement_mm: 4.6, pore_pressure_kpa: 49.0, dynamic_risk_score: 89.3, risk_band: "Very High" },
  { id: 14, name: "Guwahati Hills", state: "Assam", lat: 26.1584, lon: 91.7458, static_susceptibility: 4.8, rainfall_intensity_mmhr: 0.0, soil_moisture_pct: 18.5, slope_displacement_mm: 0.0, pore_pressure_kpa: 5.2, dynamic_risk_score: 6.1, risk_band: "Low" },
  { id: 15, name: "Haflong", state: "Assam", lat: 25.1667, lon: 93.0167, static_susceptibility: 29.6, rainfall_intensity_mmhr: 1.2, soil_moisture_pct: 24.1, slope_displacement_mm: 0.2, pore_pressure_kpa: 10.8, dynamic_risk_score: 19.4, risk_band: "Low" },
  { id: 16, name: "Ukhrul", state: "Manipur", lat: 25.0997, lon: 94.3626, static_susceptibility: 98.2, rainfall_intensity_mmhr: 21.0, soil_moisture_pct: 69.5, slope_displacement_mm: 5.2, pore_pressure_kpa: 52.0, dynamic_risk_score: 92.4, risk_band: "Very High" },
  { id: 17, name: "Senapati", state: "Manipur", lat: 25.2667, lon: 94.0167, static_susceptibility: 90.6, rainfall_intensity_mmhr: 15.6, soil_moisture_pct: 57.0, slope_displacement_mm: 3.4, pore_pressure_kpa: 41.5, dynamic_risk_score: 79.8, risk_band: "Very High" },
  { id: 18, name: "Agartala Hills", state: "Tripura", lat: 23.8315, lon: 91.4477, static_susceptibility: 0.3, rainfall_intensity_mmhr: 0.0, soil_moisture_pct: 15.0, slope_displacement_mm: 0.0, pore_pressure_kpa: 4.1, dynamic_risk_score: 2.3, risk_band: "Low" }
]

export function generateMockHistory(nodeId, baseScore = 50) {
  const history = []
  const now = Date.now()
  for (let i = 168; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toISOString()
    const rain = Math.max(0, Math.sin(i / 12) * 15 + (Math.random() * 5))
    const moisture = Math.min(80, Math.max(20, 30 + rain * 1.5 + Math.random() * 5))
    const score = Math.min(100, Math.max(5, baseScore + (rain * 0.8) + (moisture * 0.2) + (Math.random() * 6 - 3)))
    history.push({
      timestamp: time,
      rainfall_mm: parseFloat(rain.toFixed(2)),
      soil_moisture_pct: parseFloat(moisture.toFixed(2)),
      risk_score: parseFloat(score.toFixed(2))
    })
  }
  return history
}
