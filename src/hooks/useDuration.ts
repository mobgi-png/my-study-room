import { useEffect, useState } from 'react'

export function useDuration(satAt: number): string {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    function update() {
      const elapsed = Date.now() - satAt
      const totalMin = Math.floor(elapsed / 60000)
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      if (h > 0) {
        setDisplay(`${h}h ${m}m`)
      } else {
        setDisplay(`${m}m`)
      }
    }
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [satAt])

  return display
}
