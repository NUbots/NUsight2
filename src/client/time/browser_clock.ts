import { CancelTimer } from '../../shared/time/clock'
import { Clock } from '../../shared/time/clock'

const SecondsToMilliseconds = 1e3
const MillisecondsToSeconds = 1e-3

function setTimeout(cb: () => void, seconds: number): CancelTimer {
  const handle = window.setTimeout(cb, seconds * SecondsToMilliseconds)
  return window.clearTimeout.bind(undefined, handle)
}

function setInterval(cb: () => void, seconds: number): CancelTimer {
  const handle = window.setInterval(cb, seconds * SecondsToMilliseconds)
  return window.clearInterval.bind(undefined, handle)
}

function nextTick(cb: () => void): void {
  Promise.resolve().then(cb)
}

function performanceNow(): number {
  return window.performance.now() * MillisecondsToSeconds
}

export const BrowserSystemClock: Clock = {
  now: () => Date.now() * MillisecondsToSeconds,
  performanceNow,
  setTimeout,
  setInterval,
  nextTick,
}
