import { action } from 'mobx'
import { Matrix4 } from 'three'
import { Quaternion } from 'three'
import { Vector3 } from 'three'
import { message } from '../../../shared/proto/messages'
import { mat44$Properties } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { LocalisationRobotModel } from './darwin_robot/model'
import { LocalisationModel } from './model'
import Sensors = message.input.Sensors
import Ball = message.localisation.Ball

export class LocalisationNetwork {
  public constructor(private network: Network,
                     private model: LocalisationModel) {
    this.network.on(Sensors, this.onSensors)
    this.network.on(Ball, this.onBall)
  }

  public static of(nusightNetwork: NUsightNetwork, model: LocalisationModel): LocalisationNetwork {
    const network = Network.of(nusightNetwork)
    return new LocalisationNetwork(network, model)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onSensors = (robotModel: RobotModel, sensors: Sensors) => {
    const robot = LocalisationRobotModel.of(robotModel)

    const { translation: rWTt, rotation: Rwt } = decompose(new Matrix4().getInverse(fromProtoMat44(sensors.world!)))
    robot.rWTt.set(rWTt.x, rWTt.y, rWTt.z)
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
  private onBall = (robotModel: RobotModel, ball: Ball) => {
    const robot = LocalisationRobotModel.of(robotModel)

    robot.ball.position.set(ball.position!.x!, ball.position!.y!, robot.ball.position.z)

    const ellipse = calculateConfidenceEllipse(ball.covariance!.x!.x!, ball.covariance!.x!.y!, ball.covariance!.y!.y!)
    const confidenceEllipse = robot.ball.confidenceEllipse

    confidenceEllipse.scaleX = ellipse.x
    confidenceEllipse.scaleY = ellipse.y
    confidenceEllipse.rotationAngle = ellipse.angle
  }
}

function decompose(m: Matrix4): { translation: Vector3, rotation: Quaternion, scale: Vector3 } {
  const translation = new Vector3()
  const rotation = new Quaternion()
  const scale = new Vector3()
  m.decompose(translation, rotation, scale)
  return { translation, rotation, scale }
}

function fromProtoMat44(m: mat44$Properties): Matrix4 {
  return new Matrix4().set(
    m!.x!.x!, m!.y!.x!, m!.z!.x!, m!.t!.x!,
    m!.x!.y!, m!.y!.y!, m!.z!.y!, m!.t!.y!,
    m!.x!.z!, m!.y!.z!, m!.z!.z!, m!.t!.z!,
    m!.x!.t!, m!.y!.t!, m!.z!.t!, m!.t!.t!,
  )
}

interface ConfidenceEllipseData {
  x: number,
  y: number,
  angle: number
}

/**
 * Based on http://www.math.harvard.edu/archive/21b_fall_04/exhibits/2dmatrices/index.html
 * and http://www.visiondummy.com/2014/04/draw-error-ellipse-representing-covariance-matrix/
 */
function calculateConfidenceEllipse(xx: number, xy: number, yy: number): ConfidenceEllipseData {
  const ellipse: ConfidenceEllipseData = {
    x: 0,
    y: 0,
    angle: 0,
  }

  const scalefactor = 2.4477 // for 95% confidence.

  const trace = xx + yy
  const det = xx * yy - xy * xy

  const Eig1 = trace / 2 + Math.sqrt(trace * trace / 4 - det)
  const Eig2 = trace / 2 - Math.sqrt(trace * trace / 4 - det)

  const maxEig = Math.max(Eig1, Eig2)
  const minEig = Math.min(Eig1, Eig2)

  ellipse.x = Math.sqrt(maxEig) * scalefactor
  ellipse.y = Math.sqrt(minEig) * scalefactor

  ellipse.angle = Math.atan2(xy, maxEig - yy)

  return ellipse
}
