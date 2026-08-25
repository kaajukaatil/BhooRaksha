import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { calcEvacuationCount, formatDateTime } from '../utils.js'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ZONES = [
  { label: 'Immediate', pct: 0.25, color: '#ef4444' },
  { label: '5 km radius', pct: 0.35, color: '#f97316' },
  { label: '10 km radius', pct: 0.25, color: '#eab308' },
  { label: 'Advisory', pct: 0.15, color: '#8b5cf6' },
]

function DonutSegment({ pct, color, offset, gap = 2 }) {
  const dash = CIRCUMFERENCE * pct - gap
  return (
    <circle
      cx="64" cy="64" r={RADIUS}
      fill="none"
      stroke={color}
      strokeWidth="12"
      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
      strokeDashoffset={-offset}
      strokeLinecap="round"
      style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
    />
  )
}

export default function EvacuationCard({ nodes, lastFetch }) {
  const [slide, setSlide] = useState(0)
  const total = calcEvacuationCount(nodes)

  const prev = () => setSlide(s => (s - 1 + ZONES.length) % ZONES.length)
  const next = () => setSlide(s => (s + 1) % ZONES.length)

  // Build cumulative offsets
  let cumOffset = 0
  const segments = ZONES.map((z) => {
    const seg = { ...z, offset: cumOffset }
    cumOffset += CIRCUMFERENCE * z.pct
    return seg
  })

  return (
    <div className="card mx-2 mt-2" style={{ flexShrink: 0 }}>
      <div className="px-3 pt-2.5 pb-1" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span className="section-header">People in Evacuation Range</span>
      </div>

      <div className="flex items-center px-3 py-3 gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: 128, height: 128 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Background ring */}
            <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#252525" strokeWidth="12" />
            {segments.map((seg) => (
              <DonutSegment key={seg.label} pct={seg.pct} color={seg.color} offset={seg.offset} />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
              {(total / 1000).toFixed(1)}k
            </span>
            <span style={{ fontSize: 8, color: '#6a6a6a', textAlign: 'center', marginTop: 2 }}>
              PEOPLE
            </span>
          </div>
        </div>

        {/* Zone breakdown + carousel */}
        <div className="flex-1 min-w-0">
          {ZONES.map((z, i) => (
            <div key={z.label}
              className="flex items-center justify-between py-1 rounded px-1 transition-colors"
              style={{ background: i === slide ? '#252525' : 'transparent' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: z.color }} />
                <span style={{ fontSize: 10, color: '#a0a0a0' }}>{z.label}</span>
              </div>
              <span style={{ fontSize: 10, color: z.color }}>
                {Math.round(total * z.pct).toLocaleString()}
              </span>
            </div>
          ))}

          {/* Carousel arrows */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <button onClick={prev}
              className="p-0.5 rounded hover:bg-[#252525] transition-colors">
              <ChevronLeft size={13} color="#6a6a6a" />
            </button>
            <span style={{ fontSize: 10, color: '#6a6a6a' }}>
              {slide + 1} / {ZONES.length}
            </span>
            <button onClick={next}
              className="p-0.5 rounded hover:bg-[#252525] transition-colors">
              <ChevronRight size={13} color="#6a6a6a" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end px-3 pb-2">
        <span className="card-footer-time">Last updated: {formatDateTime(lastFetch)}</span>
      </div>
    </div>
  )
}
