import { useCallback, useEffect, useRef, useState } from 'react'
import { PomodoroState } from '../types'
import { updatePomodoroState } from '../firebase/seats'

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // Audio context not available
  }
}

export interface PomodoroSettings {
  workMin: number
  breakMin: number
  maxCycles: number // 0 = unlimited
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMin: 25,
  breakMin: 5,
  maxCycles: 0,
}

export function usePomodoro(
  seatId: string | null,
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
  onPomodoroComplete?: (nickname: string) => void
) {
  const [state, setState] = useState<PomodoroState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(settings.workMin * 60)
  const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(settings.workMin * 60)
  const [cycleCount, setCycleCount] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  // Refs so tick closure always sees latest values
  const phaseRef = useRef<'work' | 'break'>('work')
  const phaseSecondsRef = useRef(settings.workMin * 60)
  const cycleCountRef = useRef(0)
  const seatIdRef = useRef(seatId)
  const onCompleteRef = useRef(onPomodoroComplete)
  const settingsRef = useRef(settings)

  useEffect(() => { seatIdRef.current = seatId }, [seatId])
  useEffect(() => { onCompleteRef.current = onPomodoroComplete }, [onPomodoroComplete])
  useEffect(() => { settingsRef.current = settings }, [settings])

  const progress = 1 - secondsLeft / phaseTotalSeconds

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Single tick function handles both work and break phases via refs
  const tick = useRef<() => void>()
  tick.current = () => {
    if (!startTimeRef.current) return
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const remaining = Math.max(0, phaseSecondsRef.current - elapsed)
    setSecondsLeft(remaining)

    if (remaining > 0) return

    // Phase ended
    if (phaseRef.current === 'work') {
      // Work → Break
      playChime()
      const newCount = cycleCountRef.current + 1
      cycleCountRef.current = newCount
      setCycleCount(newCount)
      onCompleteRef.current?.('')

      const { breakMin, maxCycles } = settingsRef.current
      if (maxCycles > 0 && newCount >= maxCycles) {
        // All cycles done — stop after last work session
        clearTimer()
        setState('idle')
        setSecondsLeft(settingsRef.current.workMin * 60)
        setPhaseTotalSeconds(settingsRef.current.workMin * 60)
        startTimeRef.current = null
        if (seatIdRef.current) updatePomodoroState(seatIdRef.current, null, null)
        return
      }

      // Start break
      phaseRef.current = 'break'
      phaseSecondsRef.current = breakMin * 60
      startTimeRef.current = Date.now()
      setState('break')
      setSecondsLeft(breakMin * 60)
      setPhaseTotalSeconds(breakMin * 60)
      if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'break', Date.now())
    } else {
      // Break → Work (auto-start next round)
      playChime()
      const { workMin } = settingsRef.current
      phaseRef.current = 'work'
      phaseSecondsRef.current = workMin * 60
      startTimeRef.current = Date.now()
      setState('work')
      setSecondsLeft(workMin * 60)
      setPhaseTotalSeconds(workMin * 60)
      if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'work', Date.now())
    }
  }

  const start = useCallback(() => {
    clearTimer()
    const { workMin } = settingsRef.current
    cycleCountRef.current = 0
    setCycleCount(0)
    phaseRef.current = 'work'
    phaseSecondsRef.current = workMin * 60
    startTimeRef.current = Date.now()
    setState('work')
    setSecondsLeft(workMin * 60)
    setPhaseTotalSeconds(workMin * 60)
    if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'work', Date.now())

    // Use 500ms interval for accuracy without excessive CPU
    intervalRef.current = setInterval(() => tick.current?.(), 500)
  }, [])

  function stop() {
    clearTimer()
    startTimeRef.current = null
    setState('idle')
    const workMin = settingsRef.current.workMin
    setSecondsLeft(workMin * 60)
    setPhaseTotalSeconds(workMin * 60)
    cycleCountRef.current = 0
    setCycleCount(0)
    if (seatIdRef.current) updatePomodoroState(seatIdRef.current, null, null)
  }

  function skipBreak() {
    if (phaseRef.current !== 'break') return
    clearTimer()
    const { workMin } = settingsRef.current
    phaseRef.current = 'work'
    phaseSecondsRef.current = workMin * 60
    startTimeRef.current = Date.now()
    setState('work')
    setSecondsLeft(workMin * 60)
    setPhaseTotalSeconds(workMin * 60)
    if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'work', Date.now())
    intervalRef.current = setInterval(() => tick.current?.(), 500)
  }

  // Recalculate on tab visibility restore (handles background throttling)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible' && startTimeRef.current) {
        // Force immediate recalculation
        tick.current?.()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [])

  const formatTime = useCallback(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
    const s = (secondsLeft % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [secondsLeft])

  return { state, secondsLeft, progress, cycleCount, start, stop, skipBreak, formatTime }
}
