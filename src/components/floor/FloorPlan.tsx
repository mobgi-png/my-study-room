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
      {/* Floor background */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* Room background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
          {/* Desk areas */}
          <div className="absolute inset-x-4 top-4 bottom-4 border border-gray-700 rounded-lg opacity-30" />
          {/* Aisle divider */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gray-600 opacity-20 transform -translate-x-1/2" />
          {/* Floor pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #9ca3af 40px, #9ca3af 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #9ca3af 40px, #9ca3af 41px)',
            }}
          />
          {/* Room labels */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium tracking-widest uppercase">
            ── 自習室 ──
          </div>
          {/* Section labels */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600 tracking-wider">Aゾーン</div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-gray-600 tracking-wider">Bゾーン</div>
        </div>

        {/* Seats */}
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
