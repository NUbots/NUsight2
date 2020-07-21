import { computed } from 'mobx'
import * as THREE from 'three'
import { Matrix4 } from '../../../math/matrix4'
import { Vector3 } from '../../../math/vector3'
import { group } from '../../three/builders'
import { scene } from '../../three/builders'
import { perspectiveCamera } from '../../three/builders'
import { stage } from '../../three/builders'
import { Canvas } from '../../three/three'
import { OdometryVisualizerModel } from './model'

export class OdometryVisualizerViewModel {
  constructor(private readonly canvas: Canvas, private readonly model: OdometryVisualizerModel) {}

  static of(canvas: Canvas, model: OdometryVisualizerModel) {
    return new OdometryVisualizerViewModel(canvas, model)
  }

  readonly stage = stage(() => ({
    camera: this.camera(),
    scene: this.scene(),
  }))

  private readonly camera = perspectiveCamera(() => ({
    fov: 75,
    aspect: this.canvas.width / this.canvas.height,
    near: 0.001,
    far: 100,
    up: Vector3.from({ x: 0, y: 0, z: 1 }),
    position: this.cameraPosition,
    lookAt: this.rTWw,
  }))

  @computed
  private get cameraPosition(): Vector3 {
    const { distance, pitch, yaw } = this.model.camera
    const p = pitch - Math.PI / 2
    const y = -yaw + Math.PI
    const orbitPosition = new Vector3(
      Math.sin(p) * Math.cos(y),
      Math.sin(p) * Math.sin(y),
      Math.cos(p),
    ).multiplyScalar(-distance) // rCTw
    return orbitPosition.add(this.rTWw)
  }

  private readonly scene = scene(() => ({
    children: [
      this.torso(),
      this.floor(),
      this.leftFoot(),
      this.leftFoot2(),
      this.rightFoot(),
      this.rightFoot2(),
      this.model.leftFoot.down && this.leftFootTorso(),
      this.model.rightFoot.down && this.rightFootTorso(),
    ],
  }))

  private readonly torso = group(() => ({
    position: this.rTWw,
    rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(this.model.Hwt.toThree())),
    children: [this.basis(), this.accelerometer()],
  }))

  private readonly basis = group(() => ({
    children: [
      new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0xff0000),
      new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0x00ff00),
      new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0x0000ff),
    ],
  }))

  private readonly accelerometer = group(() => ({
    children: [
      new THREE.ArrowHelper(
        this.model.accelerometer.normalize().toThree(),
        undefined,
        this.model.accelerometer.length / 9.8,
        0xffffff,
      ),
    ],
  }))

  private readonly leftFoot = group(() => {
    const {
      leftFoot: { Hwf },
    } = this.model
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwf.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwf.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0xff00ff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0xff00ff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0xff00ff),
      ],
    }
  })

  private readonly leftFoot2 = group(() => {
    const {
      Hwt,
      leftFoot: { Htf },
    } = this.model
    const Hwf = Matrix4.fromThree(Hwt.toThree().multiply(Htf.toThree()))
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwf.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwf.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0x00ffff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0x00ffff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0x00ffff),
      ],
    }
  })

  private readonly leftFootTorso = group(() => {
    const Hft = new THREE.Matrix4().getInverse(this.model.leftFoot.Htf.toThree())
    const Hwt = Matrix4.fromThree(this.model.leftFoot.Hwf.toThree().multiply(Hft))
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwt.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwt.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0xff0000),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0x00ff00),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0x0000ff),
      ],
    }
  })

  private readonly rightFoot = group(() => {
    const {
      rightFoot: { Hwf: footHwf },
    } = this.model
    const Hwf = footHwf
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwf.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwf.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0xff00ff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0xff00ff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0xff00ff),
      ],
    }
  })

  private readonly rightFoot2 = group(() => {
    const {
      Hwt,
      rightFoot: { Htf },
    } = this.model
    const Hwf = Matrix4.fromThree(Hwt.toThree().multiply(Htf.toThree()))
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwf.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwf.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0x00ffff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0x00ffff),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0x00ffff),
      ],
    }
  })

  private readonly rightFootTorso = group(() => {
    const Hft = new THREE.Matrix4().getInverse(this.model.rightFoot.Htf.toThree())
    const Hwt = Matrix4.fromThree(this.model.rightFoot.Hwf.toThree().multiply(Hft))
    return {
      scale: new Vector3(0.2, 0.2, 0.2),
      position: Hwt.t.vec3(),
      rotation: Vector3.fromThree(new THREE.Euler().setFromRotationMatrix(Hwt.toThree())),
      children: [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 1, 0xff0000),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 1, 0x00ff00),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 1, 0x0000ff),
      ],
    }
  })

  @computed
  private get rTWw() {
    return this.model.Hwt.t.vec3()
  }

  private readonly floor = group(() => ({
    rotation: new Vector3(Math.PI / 2, 0, 0),
    children: [new THREE.GridHelper(100, 100)],
  }))
}
