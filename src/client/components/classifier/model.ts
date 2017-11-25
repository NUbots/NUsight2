import { observable } from 'mobx'
import { IObservableValue } from 'mobx'
import { computed } from 'mobx'
import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class ClassifierModel {
  @observable public appModel: AppModel

  constructor(appModel: AppModel) {
    this.appModel = appModel
  }

  public static of = memoize((appModel: AppModel): ClassifierModel => {
    return new ClassifierModel(appModel)
  })

  @computed
  get robots(): ClassifierRobotModel[] {
    return this.appModel.robots.map(robot => ClassifierRobotModel.of(robot))
  }
}

export class ClassifierRobotModel {
  @observable.ref public aspect: number
  @observable.ref public bitsX: number
  @observable.ref public bitsY: number
  @observable.ref public bitsZ: number
  @observable.ref public lut: IObservableValue<Uint8Array>

  constructor(private model: RobotModel, { aspect, bitsX, bitsY, bitsZ, lut }: {
    aspect: number,
    bitsX: number,
    bitsY: number,
    bitsZ: number,
    lut: IObservableValue<Uint8Array>
  }) {
    this.aspect = aspect
    this.bitsX = bitsX
    this.bitsY = bitsY
    this.bitsZ = bitsZ
    this.lut = lut
  }

  public static of = memoize((model: RobotModel): ClassifierRobotModel => {
    const bitsX = 6
    const bitsY = 6
    const bitsZ = 6
    return new ClassifierRobotModel(model, {
      aspect: 1,
      bitsX,
      bitsY,
      bitsZ,
      lut: observable.box(new Uint8Array(2 ** (bitsX + bitsY + bitsZ))),
    })
  })

  @computed
  get id(): string {
    return this.model.id
  }
}
