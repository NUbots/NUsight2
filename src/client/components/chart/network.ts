import { action } from 'mobx'

import { BrowserSystemClock } from '../../../client/time/browser_clock'
import { message } from '../../../shared/proto/messages'
import { Clock } from '../../../shared/time/clock'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { ChartModel } from './model'
import { TreeDataSeries } from './model'
import { TreeData } from './model'

import { google } from '../../../shared/proto/messages'
import Timestamp = google.protobuf.Timestamp$Properties
import DataPoint = message.support.nubugger.DataPoint
import DataPoint$Properties = message.support.nubugger.DataPoint$Properties
import Sensors = message.input.Sensors

const ServoIds = [
  'Right Shoulder Pitch',
  'Left Shoulder Pitch',
  'Right Shoulder Roll',
  'Left Shoulder Roll',
  'Right Elbow',
  'Left Elbow',
  'Right Hip Yaw',
  'Left Hip Yaw',
  'Right Hip Roll',
  'Left Hip Roll',
  'Right Hip Pitch',
  'Left Hip Pitch',
  'Right Knee',
  'Left Knee',
  'Right Ankle Pitch',
  'Left Ankle Pitch',
  'Right Ankle Roll',
  'Left Ankle Roll',
  'Head Yaw',
  'Head Pitch',
]

export class ChartNetwork {
  constructor(private clock: Clock,
              private network: Network,
              private model: ChartModel) {
    this.network.on(DataPoint, this.onDataPoint)
    this.network.on(Sensors, this.onSensorData)
  }

  static of(nusightNetwork: NUsightNetwork, model: ChartModel): ChartNetwork {
    const network = Network.of(nusightNetwork)
    return new ChartNetwork(BrowserSystemClock, network, model)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onDataPoint = (robotModel: RobotModel, data: DataPoint) => {
    if (data.value.length === 0) {
      return
    }

    const basePath = [robotModel.name].concat(data.label.split('/'))
    const keys = data.value.length === 1
      ? [basePath.pop()]
      : data.value.length < 5 ? ['x', 'y', 'z', 'w'] : data.value.map((v, i) => `s${i}`)

    const node = basePath.reduce((accumulator: TreeData, p: string, index: number) => {
      if (!accumulator.has(p)) {
        accumulator.set(p, new Map<string, TreeData | TreeDataSeries>())
      }
      return accumulator.get(p)! as TreeData
    }, this.model.treeData)

    data.value.forEach((v, i) => {
      const key = keys[i]!

      if (!node.has(key)) {
        node.set(key, new TreeDataSeries())
      }

      const leaf = node.get(key) as TreeDataSeries

      leaf.series.push({
        timestamp: toSeconds(data.timestamp),
        value: v
      })
    })
  }

  @action
  private onSensorData = (robotModel: RobotModel, sensorData: Sensors) => {
    const { accelerometer, gyroscope, world, fsr, battery, voltage, led, servo } = sensorData
    const timestamp = sensorData.timestamp!

    if (accelerometer) {
      this.onDataPoint(robotModel, new DataPoint({
        label: 'Accelerometer',
        value: [
          accelerometer!.x!,
          accelerometer!.y!,
          accelerometer!.z!,
        ],
        timestamp,
      }))
    }

    if (gyroscope) {
      this.onDataPoint(robotModel, new DataPoint({
        label: 'Gyroscope',
        value: [
          gyroscope!.x!,
          gyroscope!.y!,
          gyroscope!.z!,
        ],
        timestamp,
      }))
    }

    // FSRs
    if (sensorData.fsr) {
      sensorData.fsr.forEach((fsr: Sensors.FSR$Properties, index: number) => {
        // Our FSR values
        this.onDataPoint(robotModel, new DataPoint({
          label: `FSR/${index ? 'Right' : 'Left'}/Values`,
          value: fsr.value,
          timestamp,
        }))

        // Our FSR centre
        this.onDataPoint(robotModel, new DataPoint({
          label: `FSR/${index ? 'Right' : 'Left'}/Centre`,
          value: [
            fsr!.centre!.x!,
            fsr!.centre!.y!,
          ],
          timestamp,
        }))
      })
    }

    // Servos
    if (sensorData.servo) {
      sensorData.servo.forEach((servo: Sensors.Servo$Properties) => {
        const name = ServoIds[servo!.id!]

        // PID gain
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Gain`,
          value: [
            servo!.pGain!,
            servo!.iGain!,
            servo!.dGain!,
          ],
          timestamp,
        }))

        // Goal position
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Position/Goal`,
          value: [
            servo!.goalPosition!,
          ],
          timestamp,
        }))

        // Goal Velocity
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Velocity/Goal`,
          value: [
            servo!.goalVelocity!,
          ],
          timestamp,
        }))

        // Present position
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Position/Present`,
          value: [
            servo!.presentPosition!,
          ],
          timestamp,
        }))

        // Present Velocity
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Velocity/Present`,
          value: [
            servo!.presentVelocity!,
          ],
          timestamp,
        }))

        // Load
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Load`,
          value: [
            servo!.load!,
          ],
          timestamp,
        }))

        // Voltage
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Voltage`,
          value: [
            servo!.voltage!,
          ],
          timestamp,
        }))

        // Temperature
        this.onDataPoint(robotModel, new DataPoint({
          label: `Servo/${name}/Temperature`,
          value: [
            servo!.temperature!,
          ],
          timestamp,
        }))
      })
    }
  }
}

function toSeconds(timestamp: Timestamp | null): number {
  if (!timestamp) {
    timestamp = { seconds: 0, nanos: 0 }
  }
  const seconds: number = Number(timestamp.seconds)
  const nanos: number = timestamp.nanos! || 0
  return seconds + (nanos * 1e-9)
}
