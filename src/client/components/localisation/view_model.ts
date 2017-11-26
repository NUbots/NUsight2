import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { Scene } from 'three'
import { HemisphereLight } from 'three'
import { PointLight } from 'three'
import { PerspectiveCamera } from 'three'
import { Object3D } from 'three'
import { RobotViewModel } from './darwin_robot/view_model'
import { FieldViewModel } from './field/view_model'
import { LocalisationModel } from './model'
import { SkyboxViewModel } from './skybox/view_model'

export class LocalisationViewModel {
  public constructor(private model: LocalisationModel) {
  }

  public static create = createTransformer((model: LocalisationModel) => {
    return new LocalisationViewModel(model)
  })

  @computed
  public get scene(): Scene {
    const scene = new Scene()
    this.robots.forEach(robot => scene.add(robot))

    scene.add(this.field)
    scene.add(this.skybox)
    scene.add(this.hemisphereLight)
    scene.add(this.pointLight)
    return scene
  }

  @computed
  public get camera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(75, this.model.aspect, 0.01, 100)
    camera.position.set(this.model.camera.position.x, this.model.camera.position.y, this.model.camera.position.z)
    camera.rotation.set(Math.PI / 2 + this.model.camera.pitch, 0, -Math.PI / 2 + this.model.camera.yaw, 'ZXY')
    camera.up.set(0, 0, 1)
    return camera
  }

  @computed
  private get field() {
    return FieldViewModel.create(this.model.field).field
  }

  @computed
  private get robots(): Object3D[] {
    return this.model.robots
      .filter(robotModel => robotModel.visible)
      .map(robotModel => RobotViewModel.create(robotModel).robot)
  }

  @computed
  private get hemisphereLight(): HemisphereLight {
    return new HemisphereLight('#fff', '#fff', 0.6)
  }

  @computed
  private get skybox() {
    return SkyboxViewModel.create(this.model.skybox).skybox
  }

  @computed
  private get pointLight() {
    const light = new PointLight('#fff')
    light.position.set(this.model.camera.position.x, this.model.camera.position.y, this.model.camera.position.z)
    return light
  }
}
