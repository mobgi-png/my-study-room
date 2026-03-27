import React from 'react'
import { SEAT_LAYOUT } from '../../types'
import { useSeats } from '../../contexts/SeatsContext'
import Seat from './Seat'

interface FloorPlanProps {
  mySeatId: string | null
  claiming: boolean
  onSeatClick: (seatId: string) => void
}

// 川の中の波紋（小さい白い点）
function RiverRipples() {
  return (
    <>
      {[
        { top: '15%', left: '30%', delay: '0s' },
        { top: '38%', left: '60%', delay: '0.7s' },
        { top: '60%', left: '25%', delay: '1.4s' },
        { top: '80%', left: '55%', delay: '0.3s' },
      ].map((r, i) => (
        <div key={i} style={{
          position: 'absolute', top: r.top, left: r.left,
          width: 6, height: 6, borderRadius: '50%',
          border: '1px solid rgba(150,220,255,0.4)',
          animationName: 'river-shimmer',
          animationDuration: '2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: r.delay,
        }} />
      ))}
    </>
  )
}

// マグマの泡
function MagmaBubbles() {
  return (
    <>
      {[
        { top: '20%', left: '20%', size: 8, delay: '0s' },
        { top: '50%', left: '65%', size: 6, delay: '0.6s' },
        { top: '30%', left: '45%', size: 10, delay: '1.2s' },
        { top: '70%', left: '30%', size: 7, delay: '0.4s' },
        { top: '60%', left: '75%', size: 9, delay: '0.9s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.top, left: b.left,
          width: b.size, height: b.size, borderRadius: '50%',
          background: 'rgba(255,160,30,0.6)',
          animationName: 'magma-pulse',
          animationDuration: '1.4s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: b.delay,
        }} />
      ))}
    </>
  )
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

        {/* ── 床のグリッドタイル（洗練） ── */}
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

        {/* ══════════════════════════════
            川（中央通路に流れる）
        ══════════════════════════════ */}
        <div
          className="absolute river-anim"
          style={{
            left: '43.5%', width: '9%', top: 0, bottom: 0,
            backgroundImage: [
              'repeating-linear-gradient(180deg,',
              '  rgba(30,120,200,0) 0px,',
              '  rgba(40,140,220,0.55) 15px,',
              '  rgba(60,170,240,0.7) 25px,',
              '  rgba(40,140,220,0.55) 35px,',
              '  rgba(30,120,200,0) 50px,',
              '  rgba(20,100,180,0.4) 65px,',
              '  rgba(50,160,230,0.65) 80px,',
              '  rgba(30,120,200,0) 100px',
              ')',
            ].join(''),
            backgroundSize: '100% 120px',
          }}
        />
        {/* 川面のキラキラ */}
        <div className="absolute river-shimmer" style={{
          left: '43.5%', width: '9%', top: 0, bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(150,220,255,0.15) 50%, transparent 100%)',
        }} />
        {/* 川岸のライン */}
        <div className="absolute inset-y-0" style={{
          left: '43.5%', width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(100,200,255,0.3) 20%, rgba(100,200,255,0.3) 80%, transparent)',
        }} />
        <div className="absolute inset-y-0" style={{
          left: '52.4%', width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(100,200,255,0.3) 20%, rgba(100,200,255,0.3) 80%, transparent)',
        }} />
        {/* 川の波紋 */}
        <div className="absolute" style={{ left: '43.5%', width: '9%', top: 0, bottom: 0 }}>
          <RiverRipples />
        </div>
        {/* 川ラベル */}
        <div style={{
          position: 'absolute', top: '2%', left: '47%', transform: 'translateX(-50%)',
          color: 'rgba(120,200,255,0.45)', fontSize: '0.5rem', letterSpacing: '0.1em',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          textShadow: '0 0 8px rgba(100,180,255,0.4)',
        }}>
          〜 川 〜
        </div>

        {/* ══════════════════════════════
            マグマエリア（右下）
        ══════════════════════════════ */}
        <div
          className="absolute magma-flow"
          style={{
            right: 0, bottom: 0,
            width: '18%', height: '30%',
            background: [
              'radial-gradient(ellipse at 30% 70%, rgba(255,60,0,0.85) 0%, transparent 60%),',
              'radial-gradient(ellipse at 70% 30%, rgba(255,120,0,0.7) 0%, transparent 55%),',
              'radial-gradient(ellipse at 50% 90%, rgba(200,30,0,0.9) 0%, transparent 50%)',
            ].join(''),
            backgroundSize: '200% 200%',
          }}
        />
        {/* マグマの光 */}
        <div className="absolute magma-pulse" style={{
          right: 0, bottom: 0, width: '18%', height: '30%',
          background: 'radial-gradient(ellipse at 50% 80%, rgba(255,80,0,0.3) 0%, transparent 70%)',
          boxShadow: 'inset -4px -4px 20px rgba(255,50,0,0.4)',
        }} />
        {/* マグマの泡 */}
        <div className="absolute" style={{ right: 0, bottom: 0, width: '18%', height: '30%' }}>
          <MagmaBubbles />
        </div>
        {/* マグマの境界（ドットライン） */}
        <div style={{
          position: 'absolute', right: '17.5%', bottom: 0,
          width: 1, height: '30%',
          background: 'linear-gradient(0deg, rgba(255,80,0,0.6), transparent)',
        }} />
        <div style={{
          position: 'absolute', right: 0, bottom: '29.5%',
          height: 1, width: '18%',
          background: 'linear-gradient(90deg, transparent, rgba(255,80,0,0.6))',
        }} />
        {/* マグマラベル */}
        <div style={{
          position: 'absolute', right: '2%', bottom: '2%',
          color: 'rgba(255,120,0,0.7)', fontSize: '0.5rem', letterSpacing: '0.12em',
          pointerEvents: 'none', textShadow: '0 0 10px rgba(255,60,0,0.6)',
        }}>
          🌋 MAGMA
        </div>

        {/* ══════════════════════════════
            観葉植物（川沿い・各所）
        ══════════════════════════════ */}
        {/* 川の左岸 */}
        {[12, 35, 60].map((y, i) => (
          <div key={i} className="plant-sway" style={{
            position: 'absolute', top: `${y}%`, left: '41%',
            fontSize: '1.1rem', pointerEvents: 'none', opacity: 0.85,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
            animationDelay: `${i * 0.4}s`,
          }}>
            {['🌿', '🪴', '🌱'][i]}
          </div>
        ))}
        {/* 川の右岸 */}
        {[20, 48, 72].map((y, i) => (
          <div key={i} className="plant-sway" style={{
            position: 'absolute', top: `${y}%`, left: '53%',
            fontSize: '1rem', pointerEvents: 'none', opacity: 0.8,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
            animationDelay: `${i * 0.5 + 0.2}s`,
          }}>
            {['🌱', '🌿', '🪴'][i]}
          </div>
        ))}
        {/* 左上コーナー */}
        <div className="plant-sway" style={{
          position: 'absolute', top: '3%', left: '2%',
          fontSize: '1.3rem', pointerEvents: 'none', opacity: 0.7,
          animationDelay: '0.8s',
        }}>🌴</div>
        {/* 左下コーナー */}
        <div className="plant-sway" style={{
          position: 'absolute', bottom: '4%', left: '3%',
          fontSize: '1.2rem', pointerEvents: 'none', opacity: 0.75,
          animationDelay: '1.1s',
        }}>🪴</div>

        {/* ══════════════════════════════
            ゾーンラベルと区切り
        ══════════════════════════════ */}
        {/* 上部タイトル */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium tracking-widest">
          ── 自習室 ──
        </div>
        {/* Aゾーン */}
        <div className="absolute text-xs text-gray-600 tracking-wider"
          style={{ left: '22%', bottom: '3%', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          A ZONE
        </div>
        {/* Bゾーン */}
        <div className="absolute text-xs text-gray-600 tracking-wider"
          style={{ left: '68%', bottom: '3%', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          B ZONE
        </div>

        {/* ══════════════════════════════
            席（インタラクティブ）
        ══════════════════════════════ */}
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
