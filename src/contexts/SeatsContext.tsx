import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SeatDoc, ChatEvent, MILESTONE_INTERVALS_MS } from '../types'
import { subscribeToSeats } from '../firebase/seats'

interface SeatsContextValue {
  seats: Map<string, SeatDoc>
  chatEvents: ChatEvent[]
  onlineCount: number
}

const SeatsContext = createContext<SeatsContextValue>({
  seats: new Map(),
  chatEvents: [],
  onlineCount: 0,
})

export function SeatsProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Map<string, SeatDoc>>(new Map())
  const [chatEvents, setChatEvents] = useState<ChatEvent[]>([])
  const prevSeatsRef = useRef<Map<string, SeatDoc>>(new Map())
  const announcedMilestonesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const unsub = subscribeToSeats((newSeats) => {
      const prev = prevSeatsRef.current

      const newEvents: ChatEvent[] = []

      // Detect new arrivals
      newSeats.forEach((seat, seatId) => {
        if (!prev.has(seatId)) {
          newEvents.push({
            id: `join-${seatId}-${Date.now()}`,
            message: `🪑 ${seat.nickname}さんが着席しました！`,
            timestamp: Date.now(),
            type: 'join',
          })
        }
      })

      // Detect departures (no message, just update)

      prevSeatsRef.current = newSeats
      setSeats(new Map(newSeats))

      if (newEvents.length > 0) {
        setChatEvents((prev) => [...prev.slice(-49), ...newEvents])
      }
    })

    return unsub
  }, [])

  // Check milestones every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      seats.forEach((seat, seatId) => {
        const elapsed = now - seat.satAt
        MILESTONE_INTERVALS_MS.forEach((ms) => {
          const key = `${seatId}-${ms}`
          if (elapsed >= ms && !announcedMilestonesRef.current.has(key)) {
            announcedMilestonesRef.current.add(key)
            const hours = ms / (60 * 60 * 1000)
            const minutes = (ms % (60 * 60 * 1000)) / (60 * 1000)
            let msg: string
            if (minutes > 0) {
              msg = `⏱ ${seat.nickname}さんが${hours > 0 ? `${hours}時間` : ''}${minutes}分作業中！`
            } else {
              msg = hours === 1
                ? `🔥 ${seat.nickname}さんが1時間継続中！すごい！`
                : `💪 ${seat.nickname}さんが${hours}時間作業中！！`
            }
            setChatEvents((prev) => [...prev.slice(-49), {
              id: `milestone-${seatId}-${ms}`,
              message: msg,
              timestamp: now,
              type: 'milestone',
            }])
          }
        })
      })
    }, 60_000)

    return () => clearInterval(interval)
  }, [seats])

  return (
    <SeatsContext.Provider value={{ seats, chatEvents, onlineCount: seats.size }}>
      {children}
    </SeatsContext.Provider>
  )
}

export const useSeats = () => useContext(SeatsContext)
