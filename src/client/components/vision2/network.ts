import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { toSeconds } from '../../../shared/time/timestamp'
import { fourcc } from '../../image_decoder/fourcc'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { Vector3 } from '../../math/vector3'
import { Vector4 } from '../../math/vector4'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { CameraModel } from './camera/model'
import { VisionRobotModel } from './model'
import RawImage = message.input.Image
import CompressedImage = message.output.CompressedImage
import Balls = message.vision.Balls
import Goal = message.vision.Goal
import Goals = message.vision.Goals
import GreenHorizon = message.vision.GreenHorizon
import VisualMesh = message.vision.VisualMesh

export class VisionNetwork {

  constructor(private network: Network) {
    this.network.on(RawImage, this.onImage)
    this.network.on(CompressedImage, this.onImage)
    this.network.on(VisualMesh, this.onMesh)
    this.network.on(Balls, this.onBalls)
    this.network.on(Goals, this.onGoals)
    this.network.on(GreenHorizon, this.onGreenHorizon)
  }

  static of(nusightNetwork: NUsightNetwork): VisionNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionNetwork(network)
  }

  destroy() {
    this.network.off()
  }

  private onImage = (robotModel: RobotModel, image: RawImage | CompressedImage) => {
    const robot = VisionRobotModel.of(robotModel)
    const { cameraId, name, dimensions, format, data, Hcw } = image
    const { projection, focalLength, centre } = image!.lens!

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of({ id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }
    if (fourcc('JPEG') === format) {
      jpegBufferToImage(data).then(action((image: HTMLImageElement) => {
        if (!camera) {
          throw new Error()
        }
        camera.image = {
          width: dimensions!.x!,
          height: dimensions!.y!,
          image: { type: 'element', element: image, format },
          lens: {
            projection: projection || 0,
            focalLength: focalLength!,
            centre: Vector2.from(centre),
          },
          Hcw: Matrix4.from(Hcw),
        }
      }))
    }
    camera.name = name
  }

  @action
  private onMesh(robotModel: RobotModel, packet: VisualMesh) {
    const robot = VisionRobotModel.of(robotModel)
    const { cameraId, neighbourhood, rays, classifications } = packet

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of({ id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }

    // We don't need to know phi, just how many items are in each ring
    camera.visualmesh = {
      neighbours: neighbourhood!.v!,
      rays: rays!.v!,
      classifications: { dim: classifications!.rows!, values: classifications!.v! },
    }
  }

  @action
  private onBalls(robotModel: RobotModel, packet: Balls) {
    const robot = VisionRobotModel.of(robotModel)
    const { cameraId, timestamp, Hcw, balls } = packet
    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of({ id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }
    camera.balls = balls.map(ball => ({
      timestamp: toSeconds(timestamp),
      Hcw: Matrix4.from(Hcw),
      cone: {
        axis: Vector3.from(ball.cone!.axis),
        radius: ball.cone!.radius!,
      },
      distance: Math.abs(ball.measurements![0].rBCc!.x!),
      colour: Vector4.from(ball.colour),
    }))
  }

  @action
  private onGoals(robotModel: RobotModel, packet: Goals) {
    const robot = VisionRobotModel.of(robotModel)
    const { cameraId, timestamp, Hcw, goals } = packet
    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of({ id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }
    camera.goals = goals.map(goal => ({
      timestamp: toSeconds(timestamp),
      Hcw: Matrix4.from(Hcw),
      side: goal.side === Goal.Side.LEFT ? 'left' : goal.side === Goal.Side.RIGHT ? 'right' : 'unknown',
      post: {
        top: Vector3.from(goal.post!.top),
        bottom: Vector3.from(goal.post!.bottom),
        distance: goal.post!.distance!,
      },
    }))
  }

  @action
  private onGreenHorizon(robotModel: RobotModel, packet: GreenHorizon) {
    const robot = VisionRobotModel.of(robotModel)
    const { horizon, Hcw, cameraId } = packet
    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of({ id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }
    camera.greenhorizon = {
      horizon: horizon!.map(v => Vector3.from(v)),
      Hcw: Matrix4.from(Hcw),
    }
  }
}

async function jpegBufferToImage(buffer: ArrayBuffer): Promise<HTMLImageElement> {
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  const url = window.URL.createObjectURL(blob)
  const image = await loadImage(url)
  window.URL.revokeObjectURL(url)
  return image
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject()
    image.src = url
  })
}
