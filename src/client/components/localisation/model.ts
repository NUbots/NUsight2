import { observable } from 'mobx'
import { RobotModel } from './darwin_robot/model'
import { FieldModel } from './field/model'
import { CameraModel } from './model/camera'
import { ControlsModel } from './model/controls'
import { TimeModel } from './model/time'

export enum ViewMode {
  NO_CLIP,
  FIRST_PERSON,
  THIRD_PERSON,
}

export class LocalisationModel {
  @observable public aspect: number
  @observable public robots: RobotModel[]
  @observable public field: FieldModel
  @observable public camera: CameraModel
  @observable public locked: boolean
  @observable public controls: ControlsModel
  @observable public viewMode: ViewMode
  @observable public target?: RobotModel
  @observable public time: TimeModel

  constructor(opts: LocalisationModel) {
    Object.assign(this, opts)
  }

  public static of(): LocalisationModel {
    return new LocalisationModel({
      aspect: 300 / 150,
      robots: [],
      field: FieldModel.of(),
      camera: CameraModel.of(),
      locked: false,
      controls: ControlsModel.of(),
      viewMode: ViewMode.NO_CLIP,
      target: null,
      time: TimeModel.of(),
    })
  }
}

