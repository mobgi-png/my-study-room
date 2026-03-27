import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  alpha: number; color: string; size: number
}

interface Props {
  onDone: () => void
}

const COLORS = ['#FFD700', '#FF4500', '#00FF88', '#00BFFF', '#FF69B4', '#FFA500', '#ADFF2F']

export default function Fireworks({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []

    // 8箇所でバースト生成
    for (let b = 0; b < 8; b++) {
      const bx = 0.1 * canvas.width + Math.random() * 0.8 * canvas.width
      const by = 0.1 * canvas.height + Math.random() * 0.5 * canvas.height
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60
        const speed = 1.5 + Math.random() * 4
        particles.push({
          x: bx, y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          alpha: 1,
          color,
          size: 2.5 + Math.random() * 2,
        })
      }
    }

    const TOTAL_FRAMES = 100
    let frame = 0
    let raf: number

    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.alpha = Math.max(0, 1 - frame / TOTAL_FRAMES)

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      frame++
      if (frame < TOTAL_FRAMES) {
        raf = requestAnimationFrame(animate)
      } else {
        onDoneRef.current()
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
      }}
    />
  )
}
