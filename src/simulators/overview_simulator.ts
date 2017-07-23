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
import { SeededRandom } from '../shared/base/random/seeded_random'

export class OverviewSimulator implements Simulator {
  constructor(private field: FieldDimensions,
              private random: SeededRandom) {
  }

  public static of() {
    return new OverviewSimulator(
      FieldDimensions.postYear2017(),
      SeededRandom.of('overview_simulator'),
    )
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.support.nubugger.Overview'

    const t = time / 10 + index

    const fieldLength = this.field.fieldLength
    const fieldWidth = this.field.fieldWidth

    const robotPosition = this.figureEight(t, fieldLength / 2, fieldWidth / 2)

    const ballWorldPosition = this.figureEight(time / 10, fieldLength / 4, fieldWidth / 4)

    const robotHeading = ballWorldPosition.clone().subtract(robotPosition).normalize()

    const buffer = Overview.encode({
      roleName: 'Overview Simulator',
      voltage: this.randomFloat(10, 13),
      battery: this.random.float(),
      behaviourState: State.INIT,
      robotPosition,
      robotPositionCovariance: {
        x: { x: this.random.float(), y: this.random.float() },
        y: { x: this.random.float(), y: this.random.float() },
      },
      robotHeading,
      ballWorldPosition,
      gameMode: Mode.NORMAL,
      gamePhase: Phase.INITIAL,
      penaltyReason: PenaltyReason.UNPENALISED,
      lastCameraImage: { seconds: this.randomSeconds(t, -6) },
      lastSeenBall: { seconds: this.randomSeconds(t, -6) },
      lastSeenGoal: { seconds: this.randomSeconds(t, -6) },
      lastSeenObstacle: { seconds: this.randomSeconds(t, -6) },
      pathPlan: [
        robotPosition,
        this.randomFieldPosition(),
        this.randomFieldPosition(),
        this.randomFieldPosition(),
        ballWorldPosition,
      ],
      kickTarget: this.figureEight(-t).add(ballWorldPosition),
    }).finish()

    const message = { messageType, buffer }

    return [message]
  }

  private randomFieldPosition(): vec2$Properties {
    const fieldLength = this.field.fieldLength
    const fieldWidth = this.field.fieldWidth
    return {
      x: this.random.float() * fieldLength - (fieldLength * 0.5),
      y: this.random.float() * fieldWidth - (fieldWidth * 0.5),
    }
  }

  private randomFloat(min: number, max: number): number {
    return this.random.float() * (max - min) + min
  }

  private randomSeconds(now: number, offset: number): number {
    return now + (offset * this.random.float())
  }

  private figureEight(t: number, scaleX: number = 1, scaleY: number = 1) {
    return new Vector2(
      scaleX * Math.cos(t),
      scaleY * Math.sin(2 * t),
    )
  }
}