import { computed } from 'mobx'
import { createTransformer } from 'mobx'

import { message } from '../../../../shared/proto/messages'
import { Vector3 } from '../../../math/vector3'
import { DashboardRobotModel } from '../dashboard_robot/model'

const State = message.behaviour.Behaviour.State
const Mode = message.input.GameState.Data.Mode
const PenaltyReason = message.input.GameState.Data.PenaltyReason
const Phase = message.input.GameState.Data.Phase

import { LastStatus } from './view'

export class RobotPanelViewModel {
  constructor(private model: DashboardRobotModel) {
  }

  static of = createTransformer((model: DashboardRobotModel): RobotPanelViewModel => {
    return new RobotPanelViewModel(model)
  })

  @computed get connected(): boolean {
    return this.model.connected
  }

  @computed
  get batteryValue(): string {
    const battery = this.model.battery
    return battery === -1 ? '' : `${Math.round(battery * 100)}%`
  }

  @computed
  get behaviour(): string {
    return State[this.model.behaviourState] || State[State.UNKNOWN]
  }

  @computed
  get lastCameraImage(): LastStatus {
    return this.getLastStatus(this.model.lastCameraImage, 5)
  }

  @computed
  get lastSeenBall(): LastStatus {
    return this.getLastStatus(this.model.lastSeenBall, 30)
  }

  @computed
  get lastSeenGoal(): LastStatus {
    return this.getLastStatus(this.model.lastSeenGoal, 30)
  }

  @computed
  get mode(): string {
    return Mode[this.model.gameMode] || Mode[Mode.UNKNOWN_MODE]
  }

  @computed
  get penalised(): boolean {
    return this.model.penaltyReason !== PenaltyReason.UNPENALISED
  }

  @computed
  get penalty(): string {
    return PenaltyReason[this.model.penaltyReason] || PenaltyReason[PenaltyReason.UNKNOWN_PENALTY_REASON]
  }

  @computed
  get phase(): string {
    return Phase[this.model.gamePhase] || Phase[Phase.UNKNOWN_PHASE]
  }

  @computed
  get title(): string {
    return this.model.name
  }

  get walkCommand(): Vector3 {
    return this.model.walkCommand
  }

  private getLastStatus(time: number, threshold: number): LastStatus {
    const value = (this.model.time - time) / threshold
    return value < 0.5 ? 'okay' : value > 0.9 ? 'danger' : 'warning'
  }
}
