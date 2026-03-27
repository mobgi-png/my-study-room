import { useCallback, useEffect, useRef, useState } from 'react'
import { PomodoroState, POMODORO_WORK_MIN, POMODORO_BREAK_MIN } from '../types'
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

export function usePomodoro(seatId: string | null, onPomodoroComplete?: (nickname: string) => void) {
  const [state, setState] = useState<PomodoroState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_WORK_MIN * 60)
  const [cycleCount, setCycleCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const seatIdRef = useRef(seatId)
  const onCompleteRef = useRef(onPomodoroComplete)

  // Keep refs in sync so closures always have latest values
  useEffect(() => { seatIdRef.current = seatId }, [seatId])
  useEffect(() => { onCompleteRef.current = onPomodoroComplete }, [onPomodoroComplete])

  const totalSeconds = state === 'break' ? POMODORO_BREAK_MIN * 60 : POMODORO_WORK_MIN * 60
  const progress = 1 - secondsLeft / totalSeconds

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startWork = useCallback(() => {
    setState('work')
    setSecondsLeft(POMODORO_WORK_MIN * 60)
    if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'work', Date.now())

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Work session done → break
          playChime()
          setCycleCount((c) => c + 1)
          setState('break')
          setSecondsLeft(POMODORO_BREAK_MIN * 60)
          if (seatIdRef.current) updatePomodoroState(seatIdRef.current, 'break', Date.now())
          onCompleteRef.current?.('')
          return POMODORO_BREAK_MIN * 60
        }
        return s - 1
      })
    }, 1000)
  }, [])

  function stop() {
    clearTimer()
    setState('idle')
    setSecondsLeft(POMODORO_WORK_MIN * 60)
    if (seatIdRef.current) updatePomodoroState(seatIdRef.current, null, null)
  }

  function skipBreak() {
    clearTimer()
    startWork()
  }

  // Auto-start next work session after break timer ends
  useEffect(() => {
    if (state !== 'break') return
    const timer = setTimeout(() => {
      startWork()
    }, POMODORO_BREAK_MIN * 60 * 1000)
    return () => clearTimeout(timer)
  }, [state, startWork])

  useEffect(() => {
    return clearTimer
  }, [])

  const formatTime = useCallback(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
    const s = (secondsLeft % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [secondsLeft])

  return { state, secondsLeft, progress, cycleCount, start: startWork, stop, skipBreak, formatTime }
}
