import { Clock } from '../../shared/time/clock'
import { CancelTimer } from '../../shared/time/clock'

const SecondsToMilliseconds = 1e3
const MillisecondsToSeconds = 1e-3
const NanosecondsToSeconds = 1e-9

function setTimeout(cb: (...args: any[]) => void, seconds: number): CancelTimer {
  const handle = global.setTimeout(cb, seconds * SecondsToMilliseconds)
  return global.clearTimeout.bind(undefined, handle)
}

function setInterval(cb: (...args: any[]) => void, seconds: number): CancelTimer {
  const handle = global.setInterval(cb, seconds * SecondsToMilliseconds)
  return global.clearInterval.bind(undefined, handle)
}

function setImmediate(cb: (...args: any[]) => void): CancelTimer {
  const handle = global.setImmediate(cb)
  return global.clearImmediate.bind(undefined, handle)
}

function performanceNow() {
  const t = process.hrtime()
  return t[0] + t[1] * NanosecondsToSeconds
}

export const NodeSystemClock: Clock = {
  now: () => Date.now() * MillisecondsToSeconds,
  performanceNow,
  setTimeout,
  setInterval,
  setImmediate,
}
