import { Atom } from 'mobx'
import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class ClassifierModel {
  @observable private appModel: AppModel

  constructor(appModel: AppModel) {
    this.appModel = appModel
  }

  static of = memoize((appModel: AppModel): ClassifierModel => {
    return new ClassifierModel(appModel)
  })

  @computed
  get robots(): ClassifierRobotModel[] {
    return this.appModel.robots.map(robot => ClassifierRobotModel.of(robot))
  }
}

export class ClassifierRobotModel {
  @observable.ref aspect: number
  @observable.ref lut: Lut

  constructor(private model: RobotModel, { aspect, lut }: { aspect: number, lut: Lut }) {
    this.aspect = aspect
    this.lut = lut
  }

  static of = memoize((model: RobotModel): ClassifierRobotModel => {
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
  private rawData: Uint8Array
  @observable.shallow size: { x: number, y: number, z: number }

  constructor({ atom, data, size }: {
    atom: Atom,
    data: Uint8Array,
    size: { x: number, y: number, z: number }
  }) {
    this.atom = atom
    this.rawData = data
    this.size = size
  }

  static of() {
    return new Lut({
      atom: new Atom('Lut'),
      data: new Uint8Array(2 ** (6 + 6 + 6)).fill(117),
      size: { x: 6, y: 6, z: 6 },
    })
  }

  get data(): Uint8Array {
    this.atom.reportObserved()
    return this.rawData
  }

  set(index: number, value: number) {
    this.rawData[index] = value
    this.atom.reportChanged()
  }
}
