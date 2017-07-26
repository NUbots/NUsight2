import { message } from '../../src/shared/proto/messages'
import { Simulator } from './simulator'
import { Message } from './simulator'
import { FieldDimensions } from '../shared/field/dimensions'
import Ball = message.localisation.Ball
import Field = message.localisation.Field

export class LocalisationDataSimulator implements Simulator {
  public static of() {
    return new LocalisationDataSimulator()
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    return [
      this.createFieldMessage(time, index, numRobots),
      this.createBallMessage(time, index, numRobots),
    ]
  }

  public createFieldMessage(time: number, index: number, numRobots: number): Message {
    const messageType = 'message.localisation.Field'

    const buffer = Ball.encode({
      position: {
        x: 0,
        y: 0,
      },
      covariance: {
        x: {
          x: 0.02,
          y: -0.009,
        },
        y: {
          x: -0.009,
          y: 0.01,
        },
      },
    }).finish()

    return { messageType, buffer }
  }

  public createBallMessage(time: number, index: number, numRobots: number): Message {
    const messageType = 'message.localisation.Ball'
    const field = FieldDimensions.postYear2017()

    const centerX = 0
    const centerY = 0
    const centerRadius = field.centerCircleDiameter / 3

    const revolutionDuration = 15

    let angle = ((2 * Math.PI) / revolutionDuration) * (time % revolutionDuration)

    // Adjust the angle per robot
    angle = angle + (((2 * Math.PI) / numRobots) * index)

    const x = centerX + Math.cos(angle) * centerRadius
    const y = centerY + Math.sin(angle) * centerRadius

    const buffer = Ball.encode({
      position: {
        x,
        y,
      },
      covariance: {
        x: {
          x: 0.02,
          y: -0.009,
        },
        y: {
          x: -0.009,
          y: 0.01,
        },
      },
    }).finish()

    return { messageType, buffer }
  }
}
