import React, { useEffect, useState } from 'react'
import Fireworks from './Fireworks'
import { MilestoneEvent } from '../../contexts/StatsContext'

interface Props {
  event: MilestoneEvent
  onDone: () => void
}

export default function MilestoneOverlay({ event, onDone }: Props) {
  const [visible, setVisible] = useState(true)
  const [fireworksDone, setFireworksDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible && fireworksDone) onDone()
  }, [visible, fireworksDone, onDone])

  return (
    <>
      <Fireworks onDone={() => setFireworksDone(true)} />
      {visible && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 61,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(17,24,39,0.92)',
              border: '2px solid #FBBF24',
              borderRadius: '1.25rem',
              padding: '2rem 2.5rem',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(251,191,36,0.3)',
              animation: 'milestoneIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              maxWidth: '22rem',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {event.type === 'visitors' ? '🎊' : '🔥'}
            </div>
            <p style={{ color: '#FBBF24', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {event.message}
            </p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes milestoneIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
