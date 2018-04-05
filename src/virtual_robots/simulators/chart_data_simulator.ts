import { message } from '../../shared/proto/messages'
import { Simulator } from '../simulator'
import { Message } from '../simulator'

import DataPoint = message.support.nubugger.DataPoint

export class ChartSimulator implements Simulator {
  public static of(): ChartSimulator {
    return new ChartSimulator()
  }

  simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.support.nubugger.DataPoint'
    const period = 1000 * 10
    const theta = 2 * Math.PI * time / period
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)

    const buffer = DataPoint.encode({
      label: 'Debug Waves',
      value: [sin, cos, 2 * sin, 4 * cos],
      timestamp: {
        seconds: Math.floor(time),
        nanos: (time - Math.floor(time)) * 1e9
      }
    }).finish()

    const message = { messageType, buffer }

    return [message]
  }
}

