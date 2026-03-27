import React from 'react'
import { useDuration } from '../../hooks/useDuration'

export default function SeatDurationBadge({ satAt }: { satAt: number }) {
  const duration = useDuration(satAt)
  return (
    <span className="text-xs text-gray-400 leading-none mt-0.5">{duration}</span>
  )
}
