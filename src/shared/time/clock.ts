import { BrowserSystemClock } from '../../client/time/browser_clock'
import { NodeSystemClock } from '../../server/time/node_clock'

export interface Clock {
  now(): number
  date(): Date
  performanceNow(): number
  setTimeout(cb: () => void, seconds: number): CancelTimer
  setInterval(cb: () => void, seconds: number): CancelTimer
  nextTick(cb: () => void): void
}

export type CancelTimer = () => void

const isNode =
  typeof process === 'object' &&
    typeof process.versions === 'object' &&
    typeof process.versions.node === 'string'

export function getClock(): Clock {
  return isNode ? NodeSystemClock : BrowserSystemClock
}
