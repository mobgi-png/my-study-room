import React from 'react'
import { SEAT_LAYOUT } from '../../types'
import { useSeats } from '../../contexts/SeatsContext'
import Seat from './Seat'

interface FloorPlanProps {
  mySeatId: string | null
  claiming: boolean
  onSeatClick: (seatId: string) => void
}

export default function FloorPlan({ mySeatId, claiming, onSeatClick }: FloorPlanProps) {
  const { seats } = useSeats()

  return (
    <div className="relative w-full" style={{ paddingBottom: '70%' }}>
      <div
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}
      >
        {/* ── ベース背景 ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

        {/* ── 床のグリッドタイル ── */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg, transparent, transparent 48px, #9ca3af 48px, #9ca3af 49px)',
            'repeating-linear-gradient(90deg, transparent, transparent 48px, #9ca3af 48px, #9ca3af 49px)',
          ].join(', '),
        }} />

        {/* ── 天井からの柔らかな照明 ── */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 100%)',
        }} />

        {/* ── 上部タイトル ── */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium tracking-widest">
          ── 自習室 ──
        </div>

        {/* ── ゾーンラベル ── */}
        <div className="absolute text-xs text-gray-600 tracking-wider"
          style={{ left: '22%', bottom: '3%', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          A ZONE
        </div>
        <div className="absolute text-xs text-gray-600 tracking-wider"
          style={{ left: '68%', bottom: '3%', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          B ZONE
        </div>

        {/* ── 席（インタラクティブ） ── */}
        {SEAT_LAYOUT.map((seatConfig) => {
          const occupant = seats.get(seatConfig.id)
          const isOccupied = !!occupant
          const isMySet = mySeatId === seatConfig.id

          return (
            <div
              key={seatConfig.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${seatConfig.x}%`, top: `${seatConfig.y}%` }}
            >
              <Seat
                config={seatConfig}
                occupant={occupant}
                isMine={isMySet}
                isOccupied={isOccupied}
                isClaiming={claiming && isMySet}
                onClick={() => onSeatClick(seatConfig.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
