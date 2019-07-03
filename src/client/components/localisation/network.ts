import { action } from 'mobx'
import * as THREE from 'three'
import { Quaternion } from 'three'
import { Vector3 } from 'three'

import { message } from '../../../shared/proto/messages'
import { Imat4 } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { Vector4 } from '../../math/vector4'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { ConfidenceEllipse } from './darwin_robot/model'
import { LocalisationRobotModel } from './darwin_robot/model'
import { LocalisationModel } from './model'
import Sensors = message.input.Sensors
import Ball = message.localisation.Ball
import Field = message.localisation.Field

export class LocalisationNetwork {
  constructor(private network: Network,
              private model: LocalisationModel) {
    this.network.on(Sensors, this.onSensors)
    this.network.on(Field, this.onField)
    this.network.on(Ball, this.onBall)
  }

  static of(nusightNetwork: NUsightNetwork, model: LocalisationModel): LocalisationNetwork {
    const network = Network.of(nusightNetwork)
    return new LocalisationNetwork(network, model)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onSensors = (robotModel: RobotModel, sensors: Sensors) => {
    const robot = LocalisationRobotModel.of(robotModel)

    const { translation: rTWw, rotation: Rwt } = decompose(new THREE.Matrix4().getInverse(fromProtoMat44(sensors.Htw!)))
    robot.rTWw.set(rTWw.x, rTWw.y, rTWw.z)
    robot.Rwt.set(Rwt.x, Rwt.y, Rwt.z, Rwt.w)

    robot.motors.rightShoulderPitch.angle = sensors.servo[0].presentPosition!
    robot.motors.leftShoulderPitch.angle = sensors.servo[1].presentPosition!
    robot.motors.rightShoulderRoll.angle = sensors.servo[2].presentPosition!
    robot.motors.leftShoulderRoll.angle = sensors.servo[3].presentPosition!
    robot.motors.rightElbow.angle = sensors.servo[4].presentPosition!
    robot.motors.leftElbow.angle = sensors.servo[5].presentPosition!
    robot.motors.rightHipYaw.angle = sensors.servo[6].presentPosition!
    robot.motors.leftHipYaw.angle = sensors.servo[7].presentPosition!
    robot.motors.rightHipRoll.angle = sensors.servo[8].presentPosition!
    robot.motors.leftHipRoll.angle = sensors.servo[9].presentPosition!
    robot.motors.rightHipPitch.angle = sensors.servo[10].presentPosition!
    robot.motors.leftHipPitch.angle = sensors.servo[11].presentPosition!
    robot.motors.rightKnee.angle = sensors.servo[12].presentPosition!
    robot.motors.leftKnee.angle = sensors.servo[13].presentPosition!
    robot.motors.rightAnklePitch.angle = sensors.servo[14].presentPosition!
    robot.motors.leftAnklePitch.angle = sensors.servo[15].presentPosition!
    robot.motors.rightAnkleRoll.angle = sensors.servo[16].presentPosition!
    robot.motors.leftAnkleRoll.angle = sensors.servo[17].presentPosition!
    robot.motors.headPan.angle = sensors.servo[18].presentPosition!
    robot.motors.headTilt.angle = sensors.servo[19].presentPosition!
  }

  @action
  private onField = (robotModel: RobotModel, field: Field) => {
    const robot = LocalisationRobotModel.of(robotModel)
    robot.confidenceEllipse = calculateConfidenceEllipse(
      field.covariance!.x!.x!,
      field.covariance!.x!.y!,
      field.covariance!.y!.y!,
    )
    robot.Hfw = fromThreeMatrix4(new THREE.Matrix4()
      .makeTranslation(field.position!.x!, field.position!.y!, 0)
      .multiply(new THREE.Matrix4().makeRotationZ(field.position!.z!)))
  }

  @action
  private onBall = (robotModel: RobotModel, ball: Ball) => {
    const robot = LocalisationRobotModel.of(robotModel)
    robot.ball = {
      position: Vector2.from(ball.position),
      confidenceEllipse: calculateConfidenceEllipse(
        ball.covariance!.x!.x!,
        ball.covariance!.x!.y!,
        ball.covariance!.y!.y!,
      ),
    }
  }
}

function decompose(m: THREE.Matrix4): { translation: Vector3, rotation: Quaternion, scale: Vector3 } {
  const translation = new Vector3()
  const rotation = new Quaternion()
  const scale = new Vector3()
  m.decompose(translation, rotation, scale)
  return { translation, rotation, scale }
}

function fromProtoMat44(m: Imat4): THREE.Matrix4 {
  return new THREE.Matrix4().set(
    m!.x!.x!, m!.y!.x!, m!.z!.x!, m!.t!.x!,
    m!.x!.y!, m!.y!.y!, m!.z!.y!, m!.t!.y!,
    m!.x!.z!, m!.y!.z!, m!.z!.z!, m!.t!.z!,
    m!.x!.t!, m!.y!.t!, m!.z!.t!, m!.t!.t!,
  )
}

function fromThreeMatrix4(mat4: THREE.Matrix4): Matrix4 {
  return new Matrix4(
    new Vector4(mat4.elements[0], mat4.elements[1], mat4.elements[2], mat4.elements[3]),
    new Vector4(mat4.elements[4], mat4.elements[5], mat4.elements[6], mat4.elements[7]),
    new Vector4(mat4.elements[8], mat4.elements[9], mat4.elements[10], mat4.elements[11]),
    new Vector4(mat4.elements[12], mat4.elements[13], mat4.elements[14], mat4.elements[15]),
  )
}

/**
 * Based on http://www.math.harvard.edu/archive/21b_fall_04/exhibits/2dmatrices/index.html
 * and http://www.visiondummy.com/2014/04/draw-error-ellipse-representing-covariance-matrix/
 */
function calculateConfidenceEllipse(xx: number, xy: number, yy: number): ConfidenceEllipse {
  const scalefactor = 2.4477 // for 99% confidence.

  const trace = xx + yy
  const det = xx * yy - xy * xy

  const Eig1 = trace / 2 + Math.sqrt(trace * trace / 4 - det)
  const Eig2 = trace / 2 - Math.sqrt(trace * trace / 4 - det)

  const maxEig = Math.max(Eig1, Eig2)
  const minEig = Math.min(Eig1, Eig2)

  return {
    scaleX: Math.sqrt(maxEig) * scalefactor,
    scaleY: Math.sqrt(minEig) * scalefactor,
    rotation: Math.atan2(xy, maxEig - yy),
  }
}

