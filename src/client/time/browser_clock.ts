import { CancelTimer } from '../../shared/time/clock'
import { Clock } from '../../shared/time/clock'

function setTimeout(cb: (...args: any[]) => void, seconds: number): CancelTimer {
  const handle = window.setTimeout(cb, seconds * 1e3)
  return window.clearTimeout.bind(null, handle)
}

function setInterval(cb: (...args: any[]) => void, seconds: number): CancelTimer {
  const handle = window.setInterval(cb, seconds * 1e3)
  return window.clearInterval.bind(null, handle)
}

function setImmediate(cb: (...args: any[]) => void): CancelTimer {
  const handle = window.setTimeout(cb, 0)
  return window.clearTimeout.bind(null, handle)
}

function performanceNow() {
  return window.performance.now() * 1e-3
}

export const BrowserSystemClock: Clock = {
  now: () => Date.now() * 1e-3,
  performanceNow,
  setTimeout,
  setInterval,
  setImmediate,
}
