import { FakeClock } from '../fake_clock'

describe('FakeClock', () => {
  let clock: FakeClock

  beforeEach(() => {
    clock = new FakeClock()
  })

  describe('#setTimeout', () => {
    it('does not call synchronously', () => {
      const spy = jest.fn()
      clock.setTimeout(spy, 0)
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not call callback before expected time', () => {
      const spy = jest.fn()
      clock.setTimeout(spy, 2)
      clock.tick(1)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls callback at expected time', () => {
      const spy = jest.fn()
      clock.setTimeout(spy, 2)
      clock.tick(2)
      expect(spy).toHaveBeenCalled()
    })

    it('can be cancelled', () => {
      const spy = jest.fn()
      const cancel = clock.setTimeout(spy, 2)

      cancel()
      clock.tick(100)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('#setInterval', () => {
    it('does not call synchronously', () => {
      const spy = jest.fn()
      clock.setInterval(spy, 2)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls callback regularly at expected times', () => {
      const spy = jest.fn()
      clock.setInterval(spy, 2)

      clock.tick(2)
      expect(spy).toHaveBeenCalledTimes(1)

      clock.tick(1) // Tick half way, should not call yet.
      expect(spy).toHaveBeenCalledTimes(1)

      clock.tick(1) // Tick all the way, should be called now.
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('can be cancelled', () => {
      const spy = jest.fn()
      const cancel = clock.setInterval(spy, 2)

      cancel()
      clock.tick(100)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('#setImmediate', () => {
    it('does not call synchronously', () => {
      const spy = jest.fn()
      clock.setImmediate(spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls after at least any tick', () => {
      const spy = jest.fn()
      clock.setImmediate(spy)

      clock.tick(0.1)
      expect(spy).toHaveBeenCalled()
    })

    it('can be cancelled', () => {
      const spy = jest.fn()
      const cancel = clock.setImmediate(spy)

      cancel()
      clock.tick(100)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('#runAllTimers', () => {
    it('runs all timers, including new ones that are created from the call', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      const spy3 = jest.fn()

      clock.setTimeout(spy1, 1)
      clock.setTimeout(spy2, 10)
      clock.setTimeout(spy3, 100)
      clock.runAllTimers()

      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      expect(spy3).toHaveBeenCalled()
    })

    it('runs all timers, including new ones that are created from the call', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      clock.setTimeout(() => {
        spy1()
        clock.setTimeout(spy2, 1)
      }, 1)

      clock.runAllTimers()
      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
    })

    it('throws an exception where there are too many scheduled tasks', () => {
      for (let i = 0; i < 2000; i++) {
        clock.setTimeout(jest.fn(), 1)
      }

      expect(() => clock.runAllTimers()).toThrow(/Exceeded clock task limit/)
    })
  })

  describe('#runOnlyPendingTimers', () => {
    it('runs all pending timers', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      const spy3 = jest.fn()

      clock.setTimeout(spy1, 1)
      clock.setTimeout(spy2, 10)
      clock.setTimeout(spy3, 100)

      clock.runOnlyPendingTimers()
      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      expect(spy3).toHaveBeenCalled()
    })

    it('runs all timers, excluding new ones that are created from the call', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      const spy3 = jest.fn()

      clock.setTimeout(() => {
        spy1()
        clock.setTimeout(spy3, 20)
      }, 10)

      clock.setTimeout(spy2, 10)

      clock.runOnlyPendingTimers()
      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      expect(spy3).not.toHaveBeenCalled()
    })

    it('throws an exception where there are too many scheduled tasks', () => {
      for (let i = 0; i < 2000; i++) {
        clock.setTimeout(jest.fn(), 1)
      }

      expect(() => clock.runOnlyPendingTimers()).toThrow(/Exceeded clock task limit/)
    })
  })

  describe('#runTimersToTime', () => {
    it('runs all timers before given time', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      const spy3 = jest.fn()

      clock.setTimeout(spy1, 1)
      clock.setTimeout(spy2, 10)
      clock.setTimeout(spy3, 100)

      clock.runTimersToTime(50)
      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
      expect(spy3).not.toHaveBeenCalled()
    })

    it('throws an exception where there are too many scheduled tasks', () => {
      for (let i = 0; i < 2000; i++) {
        clock.setTimeout(jest.fn(), 1)
      }

      expect(() => clock.runTimersToTime(2000)).toThrow(/Exceeded clock task limit/)
    })
  })
})
