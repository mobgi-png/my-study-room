import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { subscribeToStats, RoomStats } from '../firebase/stats'

export interface MilestoneEvent {
  id: string
  type: 'visitors' | 'hours'
  count: number
  message: string
}

interface StatsContextValue {
  stats: RoomStats
  milestone: MilestoneEvent | null
  clearMilestone: () => void
}

const StatsContext = createContext<StatsContextValue>({
  stats: { totalVisitors: 0, totalMinutes: 0, adminUids: [], bannedUids: [] },
  milestone: null,
  clearMilestone: () => {},
})

const MILESTONE_UNIT = 1000

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<RoomStats>({ totalVisitors: 0, totalMinutes: 0, adminUids: [], bannedUids: [] })
  const [milestone, setMilestone] = useState<MilestoneEvent | null>(null)
  const prevRef = useRef<RoomStats | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    const unsub = subscribeToStats((next) => {
      const prev = prevRef.current

      if (prev !== null && initializedRef.current) {
        // 来場者マイルストーン
        const prevVM = Math.floor(prev.totalVisitors / MILESTONE_UNIT)
        const nextVM = Math.floor(next.totalVisitors / MILESTONE_UNIT)
        if (nextVM > prevVM && nextVM > 0) {
          const count = nextVM * MILESTONE_UNIT
          setMilestone({
            id: `v-${count}-${Date.now()}`,
            type: 'visitors',
            count,
            message: `🎊 ${count.toLocaleString()}人目のご来場！\nありがとうございます！`,
          })
        }

        // 累計時間マイルストーン
        const prevHM = Math.floor(Math.floor(prev.totalMinutes / 60) / MILESTONE_UNIT)
        const nextHM = Math.floor(Math.floor(next.totalMinutes / 60) / MILESTONE_UNIT)
        if (nextHM > prevHM && nextHM > 0) {
          const count = nextHM * MILESTONE_UNIT
          setMilestone({
            id: `h-${count}-${Date.now()}`,
            type: 'hours',
            count,
            message: `🔥 この自習室の累計作業時間が\n${count.toLocaleString()}時間を突破しました！`,
          })
        }
      }

      prevRef.current = next
      initializedRef.current = true
      setStats(next)
    })

    return unsub
  }, [])

  return (
    <StatsContext.Provider value={{ stats, milestone, clearMilestone: () => setMilestone(null) }}>
      {children}
    </StatsContext.Provider>
  )
}

export const useStats = () => useContext(StatsContext)
