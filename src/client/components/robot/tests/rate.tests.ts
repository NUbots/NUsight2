import { Clock } from '../../../../shared/time/clock'
import { FakeClock } from '../../../../shared/time/fake_clock'
import { Rate } from '../rate'

describe('Rate', () => {
  let clock: FakeClock
  let rate: Rate

  beforeEach(() => {
    clock = FakeClock.of()
    rate = new Rate({ smoothing: 0.9 }, clock)
  })

  it('works with updates in the same ms', () => {
    rate.update(1)
    clock.tick(1000)
    rate.update(1)
    clock.tick(1000)
    rate.update(1)

    expect(rate.rate).toEqual(1)
  })
})
