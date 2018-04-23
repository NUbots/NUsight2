import { observable } from 'mobx'

import { ImageModel } from '../../../image_decoder/image_decoder'
import { Matrix4 } from '../../../math/matrix4'
import { VisualMeshRobotModel } from '../model'


type MeshModelOpts = {
  segments: number[]
  classes: Array<Array<[number, number[]]>>
  coordinates: Array<[number, [number, number]]>
}

export class MeshModel {
  @observable.ref segments: number[]
  @observable.ref classes: Array<Array<[number, number[]]>>
  @observable.ref coordinates: Array<[number, [number, number]]>

  constructor({ segments, classes, coordinates }: MeshModelOpts) {
    this.segments = segments
    this.classes = classes
    this.coordinates = coordinates
  }

  static of() {
    return new MeshModel({
      segments: [],
      classes: [],
      coordinates: [],
    })
  }
}

type CameraModelOpts = {
  id: number
  name: string
}

export class CameraModel {
  readonly id: number

  @observable mesh: MeshModel
  @observable image?: ImageModel
  @observable name: string

  constructor(private model: VisualMeshRobotModel, { id, name, mesh }: CameraModelOpts & { mesh: MeshModel }) {
    this.id = id
    this.name = name
    this.mesh = mesh
  }

  static of(model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    return new CameraModel(model, { id, name, mesh: MeshModel.of() })
  }
}
