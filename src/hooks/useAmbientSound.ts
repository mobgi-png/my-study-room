import { useCallback, useEffect, useRef, useState } from 'react'

export type AmbientType = 'off' | 'rain' | 'cafe' | 'river'

interface AmbientNodes {
  source: AudioBufferSourceNode
  gain: GainNode
}

function buildBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

function buildNodes(ctx: AudioContext, type: Exclude<AmbientType, 'off'>): AmbientNodes {
  const buffer = buildBuffer(ctx)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const gain = ctx.createGain()

  if (type === 'rain') {
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 700
    filter.Q.value = 0.6
    source.connect(filter)
    filter.connect(gain)
  } else if (type === 'cafe') {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600
    source.connect(filter)
    filter.connect(gain)
  } else if (type === 'river') {
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 300
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 1200
    band.Q.value = 0.3
    source.connect(high)
    high.connect(band)
    band.connect(gain)
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

  // iOS Safari 対応: AudioContext はクリックイベント内（同期処理）で生成する必要がある
  // setType の代わりにこちらを呼ぶ
  const selectType = useCallback((newType: AmbientType) => {
    if (newType !== 'off') {
      // クリックハンドラの同期処理内で生成 → iOS でも動作する
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioContext()
      }
      // suspended 状態（iOS がブロックした場合）を解除
      ctxRef.current.resume().catch(() => {})
    }
    setType(newType)
  }, [])

  // type が変わったら再生しなおす（ctxRef はすでに生成済みのはず）
  useEffect(() => {
    if (type === 'off') {
      stopNodes()
      return
    }
    const ctx = ctxRef.current
    if (!ctx) return

    // resume してから再生（念のため）
    ctx.resume().then(() => {
      stopNodes()
      const nodes = buildNodes(ctx, type)
      nodes.gain.gain.value = volume / 100
      nodes.source.start()
      nodesRef.current = nodes
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  // 音量だけ更新
  useEffect(() => {
    if (nodesRef.current && ctxRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(volume / 100, ctxRef.current.currentTime, 0.1)
    }
  }, [volume])

  useEffect(() => stopNodes, [stopNodes])

  return { type, setType: selectType, volume, setVolume }
}
