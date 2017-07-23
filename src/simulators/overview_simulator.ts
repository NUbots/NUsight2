import { message } from '../../src/shared/proto/messages'
import { Vector2 } from '../client/math/vector2'
import { FieldDimensions } from '../shared/field/dimensions'
import { vec2$Properties } from '../shared/proto/messages'
import { Simulator } from './simulator'
import { Message } from './simulator'
import State = message.behaviour.Behaviour.State
import Mode = message.input.GameState.Data.Mode
import PenaltyReason = message.input.GameState.Data.PenaltyReason
import Phase = message.input.GameState.Data.Phase
import Overview = message.support.nubugger.Overview

export class OverviewSimulator implements Simulator {
  constructor(private field: FieldDimensions,
              private random: () => number) {
  }

  public static of() {
    return new OverviewSimulator(
      FieldDimensions.postYear2017(),
      Math.random.bind(Math),
    )
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.support.nubugger.Overview'

    const t = time * 1e-3 + index

    const fieldLength = this.field.fieldLength
    const fieldWidth = this.field.fieldWidth

    const robotPosition = this.figureEight(t, fieldLength / 2, fieldWidth / 2)

    const ballWorldPosition = this.figureEight(t, fieldLength / 4, fieldWidth / 4)

    const robotHeading = ballWorldPosition.clone().subtract(robotPosition).normalize()

    const timeSeconds = time / 1000
    const buffer = Overview.encode({
      roleName: 'Overview Simulator',
      voltage: this.randomFloat(10, 13),
      battery: this.random(),
      behaviourState: State.INIT,
      robotPosition,
      robotPositionCovariance: {
        x: { x: this.random(), y: this.random() },
        y: { x: this.random(), y: this.random() },
      },
      robotHeading,
      ballWorldPosition,
      gameMode: Mode.NORMAL,
      gamePhase: Phase.INITIAL,
      penaltyReason: PenaltyReason.UNPENALISED,
      lastCameraImage: { seconds: this.randomSeconds(timeSeconds, -6) },
      lastSeenBall: { seconds: this.randomSeconds(timeSeconds, -6) },
      lastSeenGoal: { seconds: this.randomSeconds(timeSeconds, -6) },
      lastSeenObstacle: { seconds: this.randomSeconds(timeSeconds, -6) },
      pathPlan: [
        robotPosition,
        this.randomFieldPosition(),
        this.randomFieldPosition(),
        this.randomFieldPosition(),
        ballWorldPosition,
      ],
      kickTarget: this.randomFieldPosition(),
    }).finish()

    const message = { messageType, buffer }

    return [message]
  }

  private randomFieldPosition(): vec2$Properties {
    const fieldLength = this.field.fieldLength
    const fieldWidth = this.field.fieldWidth
    return {
      x: this.random() * fieldLength - (fieldLength * 0.5),
      y: this.random() * fieldWidth - (fieldWidth * 0.5),
    }
  }

  private randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min
  }

  private randomSeconds(now: number, offset: number): number {
    return now + (offset * this.random())
  }

  private figureEight(t: number, scaleX: number, scaleY: number) {
    return new Vector2(
      scaleX * Math.cos(t),
      scaleY * Math.sin(2 * t),
    )
  }
}
