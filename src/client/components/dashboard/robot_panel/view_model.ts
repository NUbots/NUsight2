import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { DashboardRobotModel } from '../model'
import { message } from '../../../../shared/proto/messages'
import { LastStatus } from './view'

import Mode = message.input.GameState.Data.Mode
import Phase = message.input.GameState.Data.Phase
import PenaltyReason = message.input.GameState.Data.PenaltyReason
import State = message.behaviour.Behaviour.State

export class RobotPanelViewModel {
  public constructor(private model: DashboardRobotModel) {}

  public static of = createTransformer((model: DashboardRobotModel) => {
    return new RobotPanelViewModel(model)
  })

  @computed
  public get batteryValue(): string {
    const battery = this.model.battery
    return battery === -1 ? '' : `${Math.round(battery * 100)}%`
  }

  @computed
  public get behaviour(): string {
    return State[this.model.behaviourState] || State[State.UNKNOWN]
  }

  @computed
  public get lastCameraImage(): LastStatus {
    return this.getLastStatus(this.model.lastCameraImage, 3)
  }

  @computed
  public get lastSeenBall(): LastStatus {
    return this.getLastStatus(this.model.lastSeenBall, 5)
  }

  @computed
  public get lastSeenGoal(): LastStatus {
    return this.getLastStatus(this.model.lastSeenGoal, 5)
  }

  @computed
  public get mode(): string {
    return Mode[this.model.gameMode] || Mode[Mode.UNKNOWN_MODE]
  }

  @computed
  public get penalised(): boolean {
    return this.model.penaltyReason !== PenaltyReason.UNPENALISED
  }

  @computed
  public get penalty(): string {
    return PenaltyReason[this.model.penaltyReason] || PenaltyReason[PenaltyReason.UNKNOWN_PENALTY_REASON]
  }

  @computed
  public get phase(): string {
    return Phase[this.model.gamePhase] || Phase[Phase.UNKNOWN_PHASE]
  }

  @computed
  public get title(): string {
    return this.model.name
  }

  private getLastStatus(time: number, threshold: number): LastStatus {
    const value = (this.model.time - time) / threshold
    return value < 0.5 ? 'okay' : value > 0.9 ? 'danger' : 'warning'
  }
}
