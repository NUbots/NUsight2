import { IComputedValue } from 'mobx'
import { computed } from 'mobx'

import { message } from '../../shared/proto/messages'
import { toTimestamp } from '../../shared/time/timestamp'
import { Simulator } from '../simulator'
import { Message } from '../simulator'
import { VirtualRobot } from '../virtual_robot'

import { periodic } from './periodic'

import DataPoint = message.support.nusight.DataPoint

export class ChartSimulator implements Simulator {

  constructor(private robot: VirtualRobot) {
  }

  static of(robot: VirtualRobot): ChartSimulator {
    return new ChartSimulator(robot)
  }

  packets(): Array<IComputedValue<Message>> {
    return [computed(() => this.chartData)]
  }

  get chartData(): Message {

    // Offset our time to test the adaptive window
    const time = periodic(60) - 3

    const messageType = 'message.support.nusight.DataPoint'
    const period = 10
    const theta = 2 * Math.PI * time / period
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)

    const buffer = DataPoint.encode({
      label: 'Debug Waves',
      value: [sin, cos, 2 * sin, 4 * cos],
      timestamp: toTimestamp(time),
    }).finish()

    const message = { messageType, buffer }

    return message
  }
}

