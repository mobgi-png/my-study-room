import { useCallback, useEffect, useRef, useState } from 'react'

export type AmbientType = 'off' | 'rain' | 'cafe' | 'white'

interface AmbientNodes {
  source: AudioBufferSourceNode
  gain: GainNode
}

function buildBuffer(ctx: AudioContext, type: Exclude<AmbientType, 'off'>): AudioBuffer {
  const bufferSize = ctx.sampleRate * 3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  } else {
    // Brown noise: warm, low-rumble — good base for rain & cafe
    let last = 0
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      data[i] = last * 3.5
    }
  }
  return buffer
}

function buildNodes(ctx: AudioContext, type: Exclude<AmbientType, 'off'>): AmbientNodes {
  const buffer = buildBuffer(ctx, type)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const gain = ctx.createGain()

  if (type === 'rain') {
    // Bandpass → sounds like rain on a window
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 700
    filter.Q.value = 0.6
    source.connect(filter)
    filter.connect(gain)
  } else if (type === 'cafe') {
    // Lowpass → muffled background chatter
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600
    source.connect(filter)
    filter.connect(gain)
  } else {
    source.connect(gain)
  }

  gain.connect(ctx.destination)
  return { source, gain }
}

export function useAmbientSound() {
  const [type, setType] = useState<AmbientType>('off')
  const [volume, setVolume] = useState(25)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<AmbientNodes | null>(null)

  const stopNodes = useCallback(() => {
    try { nodesRef.current?.source.stop() } catch {}
    try { nodesRef.current?.gain.disconnect() } catch {}
    nodesRef.current = null
  }, [])

  // type が変わったら再生しなおす
  useEffect(() => {
    if (type === 'off') {
      stopNodes()
      return
    }

    // AudioContext はユーザー操作後に生成する必要がある
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    stopNodes()
    const nodes = buildNodes(ctx, type)
    nodes.gain.gain.value = volume / 100
    nodes.source.start()
    nodesRef.current = nodes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  // volume が変わったらゲインだけ更新
  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(volume / 100, ctxRef.current!.currentTime, 0.1)
    }
  }, [volume])

  // アンマウント時クリーンアップ
  useEffect(() => stopNodes, [stopNodes])

  return { type, setType, volume, setVolume }
}
