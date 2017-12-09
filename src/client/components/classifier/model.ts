import { Atom } from 'mobx'
import { observable } from 'mobx'
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
  @observable.ref public lut: Lut

  constructor(private model: RobotModel, { aspect, lut }: { aspect: number, lut: Lut }) {
    this.aspect = aspect
    this.lut = lut
  }

  public static of = memoize((model: RobotModel): ClassifierRobotModel => {
    return new ClassifierRobotModel(model, {
      aspect: 1,
      lut: Lut.of(),
    })
  })

  @computed
  get id(): string {
    return this.model.id
  }

  @computed
  get visible(): boolean {
    return this.model.enabled
  }
}

export class Lut {
  private atom: Atom
  private data_: Uint8Array
  @observable.shallow public size: { x: number, y: number, z: number }

  public constructor({ atom, data, size }: {
    atom: Atom,
    data: Uint8Array,
    size: { x: number, y: number, z: number }
  }) {
    this.atom = atom
    this.data_ = data
    this.size = size
  }

  public static of() {
    return new Lut({
      atom: new Atom('Lut'),
      data: new Uint8Array(2 ** (6 + 6 + 6)),
      size: { x: 6, y: 6, z: 6 },
    })
  }

  public get data(): Uint8Array {
    this.atom.reportObserved()
    return this.data_
  }

  public set(index: number, value: number) {
    this.data_[index] = value
    this.atom.reportChanged()
  }
}
