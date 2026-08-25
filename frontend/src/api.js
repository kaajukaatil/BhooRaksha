import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = '/api'

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
      setLastFetch(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
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
  const res = await fetch(`${API_BASE}/simulate/rainfall-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      node_id: nodeId,
      intensity_mmhr: intensityMmhr,
      duration_hr: durationHr,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function fetchNodeHistory(nodeId) {
  const res = await fetch(`${API_BASE}/nodes/${nodeId}/history`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useWebSocketAlerts(onAlert) {
  const wsRef = useRef(null)
  const onAlertRef = useRef(onAlert)
  useEffect(() => { onAlertRef.current = onAlert }, [onAlert])

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws/alerts`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'alert') onAlertRef.current?.(msg)
        } catch {}
      }

      ws.onclose = () => {
        // Reconnect after 3s
        setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [])
}
