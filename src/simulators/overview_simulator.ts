import { message } from '../../src/shared/proto/messages'
import { FieldDimensions } from '../shared/field/dimensions'
import { vec2$Properties } from '../shared/proto/messages'
import { Simulator } from './simulator'
import { Message } from './simulator'
import Overview = message.support.nubugger.Overview
import Mode = message.input.GameState.Data.Mode
import Phase = message.input.GameState.Data.Phase
import PenaltyReason = message.input.GameState.Data.PenaltyReason
import State = message.behaviour.Behaviour.State

export class OverviewSimulator implements Simulator {
  constructor(private field: FieldDimensions,
              private random: () => number) {}

  public static of() {
    return new OverviewSimulator(
      FieldDimensions.postYear2017(),
      Math.random.bind(Math)
    )
  }

  public simulate(time: number): Message[] {
    const messageType = 'message.support.nubugger.Overview'

    const robotPosition = this.randomFieldPosition()
    const robotHeading = this.randomUnitVector()
    const ballPosition = this.randomFieldPosition()
    const ballWorldPosition = this.randomFieldPosition()

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
      ballPosition,
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
        ballWorldPosition
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

  private randomUnitVector(): vec2$Properties {
    const angle = this.random() * 2 * Math.PI
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
  }
}
