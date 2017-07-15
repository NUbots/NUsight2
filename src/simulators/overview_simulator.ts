import { message } from '../shared/proto/messages'
import { vec2$Properties } from '../shared/proto/messages'
import { Simulator } from './simulator'
import { Message } from './simulator'
import Overview = message.support.nubugger.Overview
import Mode = message.input.GameState.Data.Mode
import Phase = message.input.GameState.Data.Phase
import PenaltyReason = message.input.GameState.Data.PenaltyReason
import State = message.behaviour.Behaviour.State

export class OverviewSimulator implements Simulator {
  constructor(private random: () => number) {
  }

  public static of() {
    return new OverviewSimulator(Math.random.bind(Math))
  }

  public simulate(time: number): Message[] {
    const messageType = 'message.support.nubugger.Overview'

    var robotPosition = this.randomFieldPosition()
    var robotHeading = this.randomUnitVector()
    var ballPosition = this.randomFieldPosition()
    var ballWorldPosition = this.randomFieldPosition()

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
      lastCameraImage: { seconds: time - 5000 * this.random() },
      lastSeenBall: { seconds: time - 5000 * this.random() },
      lastSeenGoal: { seconds: time - 15000 * this.random() },
      lastSeenObstacle: { seconds: time - 15000 * this.random() },
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

  private randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min
  }


  private randomFieldPosition(): vec2$Properties {
    // TODO (Annable): Configure from field size definition.
    var fieldLength = 9
    var fieldWidth = 6
    return {
      x: this.random() * fieldLength - (fieldLength * 0.5),
      y: this.random() * fieldWidth - (fieldWidth * 0.5),
    }
  }

  private randomUnitVector(): vec2$Properties {
    var angle = this.random() * 2 * Math.PI
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
  }
}
