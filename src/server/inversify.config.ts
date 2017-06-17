import { Container } from 'inversify'
import { NUClearNet } from 'nuclearnet.js'
import { FakeNUClearNet } from '../simulators/nuclearnet/fake_nuclearnet'
import { FakeNUClearNetServer } from '../simulators/nuclearnet/fake_nuclearnet_server'
import { Clock } from './time/clock'
import { ClockType } from './time/clock'
import { NodeSystemClock } from './time/node_clock'
import { decorate } from 'inversify'
import { injectable } from 'inversify'
import { EventEmitter } from 'events'

export const container = new Container()

decorate(injectable(), EventEmitter);
container.bind<FakeNUClearNetServer>(FakeNUClearNetServer).to(FakeNUClearNetServer).inSingletonScope()
container.bind<NUClearNet>(NUClearNet).to(FakeNUClearNet).inTransientScope()
container.bind<Clock>(ClockType).toConstantValue(NodeSystemClock)

