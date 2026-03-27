import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SeatDoc, ChatEvent, MILESTONE_INTERVALS_MS, getLevel, UserLevel } from '../types'
import { subscribeToSeats } from '../firebase/seats'
import { getMilestoneKey, pickProduct } from '../config/affiliates'
import { getUserTotalMinutes } from '../firebase/users'
import { subscribeToRecentReactions } from '../firebase/reactions'

// 60秒以内に3回以上着席したUIDはチャットに表示しない
const SPAM_WINDOW_MS = 60_000
const SPAM_THRESHOLD = 3

interface SeatsContextValue {
  seats: Map<string, SeatDoc>
  chatEvents: ChatEvent[]
  onlineCount: number
  userLevels: Map<string, UserLevel> // uid → level
}

const SeatsContext = createContext<SeatsContextValue>({
  seats: new Map(),
  chatEvents: [],
  onlineCount: 0,
  userLevels: new Map(),
})

export function SeatsProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Map<string, SeatDoc>>(new Map())
  const [chatEvents, setChatEvents] = useState<ChatEvent[]>([])
  const [userLevels, setUserLevels] = useState<Map<string, UserLevel>>(new Map())
  const prevSeatsRef = useRef<Map<string, SeatDoc>>(new Map())
  const announcedMilestonesRef = useRef<Set<string>>(new Set())
  const fetchedUidsRef = useRef<Set<string>>(new Set())
  // uid → 着席タイムスタンプの配列
  const joinHistoryRef = useRef<Map<string, number[]>>(new Map())

  function isSpamming(uid: string): boolean {
    const now = Date.now()
    const history = joinHistoryRef.current.get(uid) ?? []
    // 古いタイムスタンプを除去
    const recent = history.filter((t) => now - t < SPAM_WINDOW_MS)
    recent.push(now)
    joinHistoryRef.current.set(uid, recent)
    return recent.length > SPAM_THRESHOLD
  }

  useEffect(() => {
    let isFirstSnapshot = true

    const unsub = subscribeToSeats((newSeats) => {
      const prev = prevSeatsRef.current

      // 初回スナップショットは「現在の状態」として記録するだけ
      // （既存の全員を入室扱いにしない）
      if (isFirstSnapshot) {
        isFirstSnapshot = false

        // 初回時点で既に達成済みのマイルストーンを全て記録し、
        // 後で重複発火しないようにする
        const now = Date.now()
        newSeats.forEach((seat, seatId) => {
          const elapsed = now - seat.satAt
          MILESTONE_INTERVALS_MS.forEach((ms) => {
            if (elapsed >= ms) {
              announcedMilestonesRef.current.add(`${seatId}-${ms}`)
            }
          })
        })

        prevSeatsRef.current = newSeats
        setSeats(new Map(newSeats))
        return
      }

      const newEvents: ChatEvent[] = []

      // 新着席を検出（2回目以降のスナップショットのみ）
      newSeats.forEach((seat, seatId) => {
        if (!prev.has(seatId)) {
          if (!isSpamming(seat.occupantUid)) {
            newEvents.push({
              id: `join-${seatId}-${Date.now()}`,
              message: `🪑 ${seat.nickname} さんが入室しました！`,
              timestamp: Date.now(),
              type: 'join',
              nickname: seat.nickname,
            })
          }
        }
      })

      prevSeatsRef.current = newSeats
      setSeats(new Map(newSeats))

      if (newEvents.length > 0) {
        setChatEvents((prev) => [...prev.slice(-49), ...newEvents])
      }
    })

    return unsub
  }, [])

  // リアクション購読
  useEffect(() => {
    const knownIds = new Set<string>()
    const unsub = subscribeToRecentReactions((reactions) => {
      const newEvents: ChatEvent[] = []
      reactions.forEach((r) => {
        if (!knownIds.has(r.id)) {
          knownIds.add(r.id)
          newEvents.push({
            id: `reaction-${r.id}`,
            message: `${r.emoji} ${r.toNickname} さんへ 一緒にがんばろう！が届きました`,
            timestamp: r.timestamp,
            type: 'reaction',
            nickname: r.toNickname,
          })
        }
      })
      if (newEvents.length > 0) {
        setChatEvents((prev) => [...prev.slice(-49), ...newEvents].sort((a, b) => a.timestamp - b.timestamp))
      }
    })
    return unsub
  }, [])

  // 新しい着席者のレベルを取得
  useEffect(() => {
    seats.forEach((seat) => {
      const uid = seat.occupantUid
      if (!fetchedUidsRef.current.has(uid)) {
        fetchedUidsRef.current.add(uid)
        getUserTotalMinutes(uid).then((mins) => {
          setUserLevels((prev) => new Map(prev).set(uid, getLevel(mins)))
        }).catch(() => {})
      }
    })
  }, [seats])

  // マイルストーンチェック（1分ごと）
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
              msg = `⏱ ${seat.nickname} さん、${hours > 0 ? `${hours}時間` : ''}${minutes}分達成！好調ですね！`
            } else {
              msg = hours === 1
                ? `🔥 ${seat.nickname} さん、1時間継続！その調子です！`
                : `💪 ${seat.nickname} さん、${hours}時間作業継続！素晴らしい集中力です！`
            }
            const milestoneKey = getMilestoneKey(ms)
            const product = pickProduct(milestoneKey)
            setChatEvents((prev) => [...prev.slice(-49), {
              id: `milestone-${seatId}-${ms}`,
              message: msg,
              timestamp: now,
              type: 'milestone',
              uid: seat.occupantUid,
              affiliate: product ?? undefined,
            }])
          }
        })
      })
    }, 60_000)

    return () => clearInterval(interval)
  }, [seats])

  return (
    <SeatsContext.Provider value={{ seats, chatEvents, onlineCount: seats.size, userLevels }}>
      {children}
    </SeatsContext.Provider>
  )
}

export const useSeats = () => useContext(SeatsContext)
