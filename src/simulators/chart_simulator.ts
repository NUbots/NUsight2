import { message } from '../../src/shared/proto/messages'
import { Message } from './simulator'
import { Simulator } from './simulator'

import DataPoint = message.support.nubugger.DataPoint
import Type = DataPoint.Type

export class ChartSimulator implements Simulator {
  public static of(): ChartSimulator {
    return new ChartSimulator()
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.support.nubugger.DataPoint'
    const period = 10
    const theta = (2 * Math.PI * (time - index)) / period
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)
    const buffer = DataPoint.encode({
      label: 'Debug Waves',
      value: [sin, cos, 2 * sin, 4 * cos + 1],
      type: Type.FLOAT_LIST,
    }).finish()

    const message = { messageType, buffer }

    return [message]
  }
}
