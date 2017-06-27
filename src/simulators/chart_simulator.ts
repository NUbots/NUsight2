import { message } from '../../src/shared/proto/messages'
import { Simulator } from './simulator'
import { Message } from './simulator'
import DataPoint = message.support.nubugger.DataPoint

export class ChartSimulator implements Simulator {
  public static of() {
    return new ChartSimulator()
  }

  public simulate(time: number): Message[] {
    const messageType = 'message.support.nubugger.DataPoint'

    const now = time
    const period = 1000 * 10
    const theta = 2 * Math.PI * now / period
    const sine = Math.sin(theta)
    const cosine = Math.cos(theta)
    let messages: Message[] = []

    for (let i = 1; i < 6; i ++) {
      const buffer = DataPoint.encode({
        label: 'Debug Waves ' + i,
        value: [i * sine, i * cosine, 2 * sine, 4 * cosine],
        type: DataPoint.Type.FLOAT_LIST,
      }).finish()

      messages.push({ messageType, buffer })
    }

    return messages
  }
}
