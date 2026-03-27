import React from 'react'
import { SEAT_LAYOUT } from '../../types'
import { useSeats } from '../../contexts/SeatsContext'
import Seat from './Seat'

interface FloorPlanProps {
  mySeatId: string | null
  claiming: boolean
  onSeatClick: (seatId: string) => void
}

const BOOK_COLORS = [
  '#8B4513','#4A7C59','#1B3A8C','#8B6914','#6B2D6B','#2D6B6B',
  '#C0392B','#27AE60','#2980B9','#D4AC0D','#8E44AD','#16A085',
]

const DESK_ROWS = [
  { top: '6%',  leftL: '4%',  rightL: '56%', leftR: '51%', rightR: '9%'  },
  { top: '28%', leftL: '4%',  rightL: '56%', leftR: '51%', rightR: '9%'  },
  { top: '52%', leftL: '4%',  rightL: '56%', leftR: '51%', rightR: '9%'  },
]

export default function FloorPlan({ mySeatId, claiming, onSeatClick }: FloorPlanProps) {
  const { seats } = useSeats()

  return (
    <div className="relative w-full" style={{ paddingBottom: '68%' }}>
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(200,150,46,0.08)' }}
      >

        {/* ── LAYER 1: 壁・床の基本色 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #1C1408 0%, #160F05 50%, #120C04 100%)',
        }} />

        {/* ── LAYER 2: 天井照明のグロー ── */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '75%', height: '55%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(200,150,46,0.13) 0%, transparent 70%)',
        }} />

        {/* ── LAYER 3: 本棚（左壁） ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '5.5%',
          background: 'linear-gradient(to right, #1A1008, #241508)',
          borderRight: '1px solid rgba(139,99,64,0.22)',
        }}>
          {/* 棚板 */}
          {[32, 65].map((pct) => (
            <div key={pct} style={{
              position: 'absolute', top: `${pct}%`, left: 0, right: 0,
              height: '3px', background: 'rgba(139,99,64,0.35)',
            }} />
          ))}
          {/* 本の背表紙 */}
          {BOOK_COLORS.map((color, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${3 + i * 7.5}%`,
              left: '18%', right: '18%',
              height: '5.5%',
              background: color,
              borderRadius: '1px',
              opacity: 0.65,
            }} />
          ))}
          {/* 飾り（本の上の小物） */}
          <div style={{ position:'absolute', bottom:'4%', left:'50%', transform:'translateX(-50%)', fontSize:'0.7rem' }}>
            📎
          </div>
        </div>

        {/* ── LAYER 3: 窓（右壁） ── */}
        <div style={{ position: 'absolute', right: '1.5%', top: '5%', width: '5%', height: '32%' }}>
          {/* 窓枠 */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid rgba(139,99,64,0.45)',
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(180deg, rgba(200,170,100,0.07) 0%, rgba(200,170,100,0.03) 100%)',
          }}>
            <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'1px', background:'rgba(139,99,64,0.3)' }} />
            <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:'1px', background:'rgba(139,99,64,0.3)' }} />
          </div>
          {/* カーテン左 */}
          <div style={{
            position: 'absolute', top: '-2px', left: '-35%', width: '40%', height: '108%',
            background: 'linear-gradient(to right, rgba(110,55,55,0.55), rgba(110,55,55,0.15))',
            borderRadius: '0 0 6px 6px',
          }} />
          {/* カーテン右 */}
          <div style={{
            position: 'absolute', top: '-2px', right: '-35%', width: '40%', height: '108%',
            background: 'linear-gradient(to left, rgba(110,55,55,0.55), rgba(110,55,55,0.15))',
            borderRadius: '0 0 6px 6px',
          }} />
          {/* 窓の外の光 */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '4px 4px 0 0',
            background: 'rgba(200,170,100,0.04)',
          }} />
        </div>

        {/* ── LAYER 3: 観葉植物（左下） ── */}
        <div style={{
          position: 'absolute', bottom: '2%', left: '6.5%',
          fontSize: '1.6rem', lineHeight: 1, pointerEvents: 'none', opacity: 0.75,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}>
          🌿
        </div>

        {/* ── LAYER 3: 時計（右上） ── */}
        <div style={{
          position: 'absolute', top: '2%', right: '8%',
          color: 'rgba(200,150,46,0.35)', fontSize: '0.55rem', letterSpacing: '0.1em', pointerEvents: 'none',
        }}>
          🕐
        </div>

        {/* ── LAYER 4: フロアプランク（床の木目） ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
          pointerEvents: 'none', opacity: 0.12,
          backgroundImage: [
            'repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(139,99,64,1) 80px, rgba(139,99,64,1) 81px)',
            'linear-gradient(180deg, transparent 0%, rgba(92,61,30,0.3) 100%)',
          ].join(', '),
        }} />

        {/* ── LAYER 5: デスク（木製テーブル） ── */}
        {DESK_ROWS.map((row, ri) => (
          <React.Fragment key={ri}>
            {/* 左デスク */}
            <div style={{
              position: 'absolute',
              top: row.top, left: row.leftL, right: row.rightL,
              height: '13%',
              background: 'linear-gradient(180deg, rgba(92,61,30,0.28) 0%, rgba(69,45,20,0.14) 100%)',
              border: '1px solid rgba(139,99,64,0.18)',
              borderRadius: '6px',
              pointerEvents: 'none',
              boxShadow: 'inset 0 1px 0 rgba(200,150,46,0.05)',
            }} />
            {/* 右デスク */}
            <div style={{
              position: 'absolute',
              top: row.top, left: row.leftR, right: row.rightR,
              height: '13%',
              background: 'linear-gradient(180deg, rgba(92,61,30,0.28) 0%, rgba(69,45,20,0.14) 100%)',
              border: '1px solid rgba(139,99,64,0.18)',
              borderRadius: '6px',
              pointerEvents: 'none',
              boxShadow: 'inset 0 1px 0 rgba(200,150,46,0.05)',
            }} />
          </React.Fragment>
        ))}

        {/* ── LAYER 6: ラベル ── */}
        <div style={{
          position: 'absolute', top: '1.5%', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(200,150,46,0.4)', fontSize: '0.58rem',
          letterSpacing: '0.28em', fontWeight: 600, whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ── もくもく自習室 ──
        </div>
        <div style={{
          position: 'absolute', bottom: '3%', left: '25%', transform: 'translateX(-50%)',
          color: 'rgba(139,99,64,0.28)', fontSize: '0.5rem', letterSpacing: '0.18em', pointerEvents: 'none',
        }}>
          A ZONE
        </div>
        <div style={{
          position: 'absolute', bottom: '3%', left: '72%', transform: 'translateX(-50%)',
          color: 'rgba(139,99,64,0.28)', fontSize: '0.5rem', letterSpacing: '0.18em', pointerEvents: 'none',
        }}>
          B ZONE
        </div>

        {/* ── LAYER 7: 席（インタラクティブ） ── */}
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
