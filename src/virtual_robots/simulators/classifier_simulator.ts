import { message } from '../../shared/proto/messages'
import { Simulator } from '../simulator'
import { Message } from '../simulator'
import LookUpTableDiff = message.vision.LookUpTableDiff
import { flatMap } from '../flat_map'

const T_UNCLASSIFIED = 117.0
const T_WHITE = 119.0 // line
const T_GREEN = 103.0 // field
const T_YELLOW = 121.0 // goal
const T_ORANGE = 111.0 // ball
const T_CYAN = 99.0
const T_MAGENTA = 109.0

export class ClassifierSimulator implements Simulator {
  public static of(): ClassifierSimulator {
    return new ClassifierSimulator()
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.vision.LookUpTableDiff'
    const buffer = LookUpTableDiff.encode({
      diff: flatMap(() => ([
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_UNCLASSIFIED },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_WHITE },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_GREEN },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_YELLOW },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_ORANGE },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_CYAN },
        { lutIndex: Math.floor(Math.random() * (2 ** 18)), classification: T_MAGENTA },
      ]), Array(10).fill(0)),
    }).finish()
    const message = { messageType, buffer }
    return [message]
  }
}
