import * as bounds from 'binary-search-bounds'
import { action } from 'mobx'

import { BrowserSystemClock } from '../../../client/time/browser_clock'
import { message } from '../../../shared/proto/messages'
import { google } from '../../../shared/proto/messages'
import { Clock } from '../../../shared/time/clock'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { ChartModel } from './model'
import { DataSeries } from './model'
import { TreeData } from './model'
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
        accumulator.set(p, new Map<string, TreeData | DataSeries>())
      }
      return accumulator.get(p)! as TreeData
    }, this.model.treeData)

    data.value.forEach((v, i) => {
      const key = keys[i]!

      if (!node.has(key)) {
        node.set(key, new DataSeries())
      }

      const leaf = node.get(key) as DataSeries
      const series = leaf.series

      const now = this.clock.now()
      const rawTime = toSeconds(data.timestamp)
      const time = toSeconds(data.timestamp) - this.model.startTime

      // Estimate the difference between the clocks
      leaf.updateDelta(rawTime - now)

      // Add the series element
      series.push(Vector2.of(time, v))

      // Swap it backward until it's in place (keeping the list sorted)
      for (let i = series.length - 1; i > 0; i--) {
        if (series[i - 1].x > time) {
          [series[i - 1], series[i]] = [series[i], series[i - 1]]
        } else {
          break
        }
      }

      // Find where our old data starts so we can remove it
      const cutoff = now - this.model.startTime + leaf.timeDelta - 10
      const newStart = bounds.lt(series, Vector2.of(), p => p.x - cutoff)

      // Remove old series elements (keep 10 seconds of buffer)
      if (newStart > 50) {
        series.splice(0, newStart)
      }
    })
  }

  @action
  private onSensorData = (robotModel: RobotModel, sensorData: Sensors) => {
    const { accelerometer, gyroscope, world, fsr, battery, voltage, led, servo } = sensorData
    const timestamp = sensorData.timestamp!

    if (accelerometer) {
      this.onDataPoint(robotModel, new DataPoint({
        label: 'Sensor/Accelerometer',
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
        label: 'Sensor/Gyroscope',
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
          label: `Sensor/FSR/${index ? 'Right' : 'Left'}/Values`,
          value: fsr.value,
          timestamp,
        }))

        // Our FSR centre
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/FSR/${index ? 'Right' : 'Left'}/Centre`,
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
      sensorData.servo.forEach((servo: Sensors.Servo$Properties, index: number) => {
        const name = ServoIds[servo!.id! || index]

        // PID gain
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Gain`,
          value: [
            servo!.pGain!,
            servo!.iGain!,
            servo!.dGain!,
          ],
          timestamp,
        }))

        // Goal position
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Position/Goal`,
          value: [
            servo!.goalPosition!,
          ],
          timestamp,
        }))

        // Goal Velocity
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Velocity/Goal`,
          value: [
            servo!.goalVelocity!,
          ],
          timestamp,
        }))

        // Present position
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Position/Present`,
          value: [
            servo!.presentPosition!,
          ],
          timestamp,
        }))

        // Present Velocity
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Velocity/Present`,
          value: [
            servo!.presentVelocity!,
          ],
          timestamp,
        }))

        // Load
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Load`,
          value: [
            servo!.load!,
          ],
          timestamp,
        }))

        // Voltage
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Voltage`,
          value: [
            servo!.voltage!,
          ],
          timestamp,
        }))

        // Temperature
        this.onDataPoint(robotModel, new DataPoint({
          label: `Sensor/Servos/${name}/Temperature`,
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
