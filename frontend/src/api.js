import { useState, useEffect, useCallback, useRef } from 'react'
import { INITIAL_NODES, generateMockHistory } from './mockData.js'

const API_BASE = import.meta.env.VITE_API_URL || '/api'
let localNodes = [...INITIAL_NODES]

export function useNodes() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/nodes`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setNodes(data)
      localNodes = data
      setLastFetch(new Date())
      setError(null)
    } catch (e) {
      console.warn('Backend unavailable, using simulated offline data:', e.message)
      // Graceful fallback to client-side data
      setNodes(localNodes)
      setLastFetch(new Date())
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNodes()
    const interval = setInterval(fetchNodes, 15000)
    return () => clearInterval(interval)
  }, [fetchNodes])

  return { nodes, loading, error, lastFetch, refetch: fetchNodes }
}

export async function simulateRainfallEvent(nodeId, intensityMmhr, durationHr) {
  try {
    const res = await fetch(`${API_BASE}/simulate/rainfall-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_id: nodeId,
        intensity_mmhr: intensityMmhr,
        duration_hr: durationHr,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return data
    }
  } catch (e) {
    console.warn('Simulation API offline, running client-side simulation:', e.message)
  }

  // Client-side simulation fallback
  const target = localNodes.find(n => n.id === nodeId)
  const staticSuscep = target ? target.static_susceptibility : 50.0
  const addedRain = intensityMmhr * durationHr
  const newMoisture = Math.min(85, (target ? target.soil_moisture_pct : 40) + addedRain * 0.4)
  const calculatedRisk = Math.min(100, Math.max(5, (staticSuscep * 0.4) + (intensityMmhr * 0.8) + (newMoisture * 0.3)))
  
  let riskBand = "Low"
  if (calculatedRisk >= 75) riskBand = "Very High"
  else if (calculatedRisk >= 50) riskBand = "High"
  else if (calculatedRisk >= 25) riskBand = "Moderate"

  const updated = {
    ...target,
    rainfall_intensity_mmhr: intensityMmhr,
    soil_moisture_pct: parseFloat(newMoisture.toFixed(1)),
    dynamic_risk_score: parseFloat(calculatedRisk.toFixed(1)),
    risk_band: riskBand,
    last_updated: new Date().toISOString()
  }

  localNodes = localNodes.map(n => n.id === nodeId ? updated : n)
  return updated
}

export async function fetchNodeHistory(nodeId) {
  try {
    const res = await fetch(`${API_BASE}/nodes/${nodeId}/history`)
    if (res.ok) return await res.json()
  } catch (e) {
    console.warn('History API offline, generating client-side history:', e.message)
  }

  const target = localNodes.find(n => n.id === nodeId)
  return generateMockHistory(nodeId, target ? target.dynamic_risk_score : 50)
}

export function useWebSocketAlerts(onAlert) {
  const wsRef = useRef(null)
  const onAlertRef = useRef(onAlert)
  useEffect(() => { onAlertRef.current = onAlert }, [onAlert])

  useEffect(() => {
    // Only attempt WS connection if not strictly http/https without backend
    if (typeof window === 'undefined') return
    const isHttps = window.location.protocol === 'https:'
    const protocol = isHttps ? 'wss' : 'ws'
    
    // In local dev, connect to window.location.host; otherwise if custom URL configured
    let wsHost = window.location.host
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
      const url = new URL(import.meta.env.VITE_API_URL)
      wsHost = url.host
    }

    try {
      const ws = new WebSocket(`${protocol}://${wsHost}/ws/alerts`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'alert') onAlertRef.current?.(msg)
        } catch {}
      }

      ws.onerror = () => {
        // Silently close on unsupported environments
        try { ws.close() } catch {}
      }
    } catch {}

    return () => {
      try { wsRef.current?.close() } catch {}
    }
  }, [])
}
