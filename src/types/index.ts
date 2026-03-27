export interface SeatConfig {
  id: string
  x: number  // percentage 0-100
  y: number  // percentage 0-100
  label: string
}

export interface SeatDoc {
  seatId: string
  roomId: string
  occupantUid: string
  nickname: string
  satAt: number
  pomodoroMode: 'work' | 'break' | null
  pomodoroStartedAt: number | null
}

export interface UserDoc {
  uid: string
  nickname: string
  lastSeen: number
}

export interface ChatEvent {
  id: string
  message: string
  timestamp: number
  type: 'join' | 'milestone' | 'pomodoro'
  // アフィリエイトリンク（任意）
  affiliate?: { emoji: string; label: string; url: string }
}

export type PomodoroState = 'idle' | 'work' | 'break'

export type UserLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond'

export function getLevel(totalMinutes: number): UserLevel {
  if (totalMinutes >= 1200) return 'diamond' // 20h+
  if (totalMinutes >= 600) return 'gold'     // 10h+
  if (totalMinutes >= 300) return 'silver'   // 5h+
  if (totalMinutes >= 60) return 'bronze'    // 1h+
  return 'none'
}

export const LEVEL_BORDER_COLORS: Record<UserLevel, string | null> = {
  none: null,
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#67E8F9',
}

export const LEVEL_LABELS: Record<UserLevel, string> = {
  none: '',
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
}

export const SEAT_LAYOUT: SeatConfig[] = [
  // Row 1 (top)
  { id: 'seat_01', x: 8,  y: 12, label: 'A1' },
  { id: 'seat_02', x: 16, y: 12, label: 'A2' },
  { id: 'seat_03', x: 24, y: 12, label: 'A3' },
  { id: 'seat_04', x: 32, y: 12, label: 'A4' },
  { id: 'seat_05', x: 40, y: 12, label: 'A5' },
  { id: 'seat_06', x: 55, y: 12, label: 'A6' },
  { id: 'seat_07', x: 63, y: 12, label: 'A7' },
  { id: 'seat_08', x: 71, y: 12, label: 'A8' },
  { id: 'seat_09', x: 79, y: 12, label: 'A9' },
  { id: 'seat_10', x: 87, y: 12, label: 'A10' },
  // Row 2
  { id: 'seat_11', x: 8,  y: 35, label: 'B1' },
  { id: 'seat_12', x: 16, y: 35, label: 'B2' },
  { id: 'seat_13', x: 24, y: 35, label: 'B3' },
  { id: 'seat_14', x: 32, y: 35, label: 'B4' },
  { id: 'seat_15', x: 40, y: 35, label: 'B5' },
  { id: 'seat_16', x: 55, y: 35, label: 'B6' },
  { id: 'seat_17', x: 63, y: 35, label: 'B7' },
  { id: 'seat_18', x: 71, y: 35, label: 'B8' },
  { id: 'seat_19', x: 79, y: 35, label: 'B9' },
  { id: 'seat_20', x: 87, y: 35, label: 'B10' },
  // Row 3
  { id: 'seat_21', x: 8,  y: 60, label: 'C1' },
  { id: 'seat_22', x: 16, y: 60, label: 'C2' },
  { id: 'seat_23', x: 24, y: 60, label: 'C3' },
  { id: 'seat_24', x: 32, y: 60, label: 'C4' },
  { id: 'seat_25', x: 40, y: 60, label: 'C5' },
  { id: 'seat_26', x: 55, y: 60, label: 'C6' },
  { id: 'seat_27', x: 63, y: 60, label: 'C7' },
  { id: 'seat_28', x: 71, y: 60, label: 'C8' },
  { id: 'seat_29', x: 79, y: 60, label: 'C9' },
  { id: 'seat_30', x: 87, y: 60, label: 'C10' },
]

export const POMODORO_WORK_MIN = 25
export const POMODORO_BREAK_MIN = 5
export const MILESTONE_INTERVALS_MS = [
  30 * 60 * 1000,   // 30 min
  60 * 60 * 1000,   // 1h
  90 * 60 * 1000,   // 1.5h
  120 * 60 * 1000,  // 2h
  180 * 60 * 1000,  // 3h
]
