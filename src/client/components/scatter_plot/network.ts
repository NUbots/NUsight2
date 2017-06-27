import { action } from 'mobx'
import * as Plotly from 'plotly.js'
import { message } from '../../../shared/proto/messages'
import { GlobalNetwork } from '../../network/global_network'
import { Network } from '../../network/network'
import { ScatterplotModel } from './model'
import Sensors = message.input.Sensors
import DataPoint = message.support.nubugger.DataPoint

export class ScatterplotNetwork {
  private servoMap: string[] = [
    'R_SHOULDER_PITCH',
    'L_SHOULDER_PITCH',
    'R_SHOULDER_ROLL',
    'L_SHOULDER_ROLL',
    'R_ELBOW',
    'L_ELBOW',
    'R_HIP_YAW',
    'L_HIP_YAW',
    'R_HIP_ROLL',
    'L_HIP_ROLL',
    'R_HIP_PITCH',
    'L_HIP_PITCH',
    'R_KNEE',
    'L_KNEE',
    'R_ANKLE_PITCH',
    'L_ANKLE_PITCH',
    'R_ANKLE_ROLL',
    'L_ANKLE_ROLL',
    'HEAD_PAN',
    'HEAD_TILT',
  ]

  public constructor(private network: Network, private model: ScatterplotModel) {
    this.network.on(Sensors, this.onSensors)
    this.network.on(DataPoint, this.onDataPoint)
  }

  public static of(globalNetwork: GlobalNetwork, model: ScatterplotModel): ScatterplotNetwork {
    const network = Network.of(globalNetwork)
    return new ScatterplotNetwork(network, model)
  }

  public destroy() {
    this.network.off()
  }


  @action
  private onSensors = (sensors: Sensors) => {
    // Accelerometer
    const accel = sensors.accelerometer
    if (accel) {
      this.onDataPoint(new DataPoint({
        label: 'Accelerometer',
        value: [
          accel.x!,
          accel.y!,
          accel.z!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))
    }

    // Gyroscope
    const gyro = sensors.gyroscope
    if (gyro) {
      this.onDataPoint(new DataPoint({
        label: 'Gyroscope',
        value: [
          gyro.x!,
          gyro.y!,
          gyro.z!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))
    }

    // World
    const world = sensors.world
    if (world) {
      this.onDataPoint(new DataPoint({
        label: 'World',
        value: [
          world.x!.x!,
          world.y!.x!,
          world.z!.x!,
          world.t!.x!,
          world.x!.y!,
          world.y!.y!,
          world.z!.y!,
          world.t!.y!,
          world.x!.z!,
          world.y!.z!,
          world.z!.z!,
          world.t!.z!,
          world.x!.t!,
          world.y!.t!,
          world.z!.t!,
          world.t!.t!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))
    }

    // FSRs
    sensors.fsr.forEach((fsr, index) => {
      // Our FSR values
      if (fsr.value) {
        this.onDataPoint(new DataPoint({
          label: 'FSR ' + index,
          value: [fsr.value[0]],
          type: DataPoint.Type.FLOAT_LIST,
        }))
      }

      if (fsr.centre) {
        // Our FSR centre
        this.onDataPoint(new DataPoint({
          label: 'FSR Centre ' + index,
          value: [
            fsr.centre.x!,
            fsr.centre.y!,
          ],
          type: DataPoint.Type.FLOAT_LIST,
        }))
      }
    }, this)

    // Servos
    sensors.servo.forEach((servo) => {
      const name = this.servoMap[servo.id!] // TODO use the ID to get a name from a cache

      // PID gain
      this.onDataPoint(new DataPoint({
        label: name + ' Gain',
        value: [
          servo.pGain!,
          servo.iGain!,
          servo.dGain!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Goal position
      this.onDataPoint(new DataPoint({
        label: name + ' Goal Position',
        value: [
          servo.goalPosition!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Goal Velocity
      this.onDataPoint(new DataPoint({
        label: name + ' Goal Velocity',
        value: [
          servo.goalVelocity!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Present position
      this.onDataPoint(new DataPoint({
        label: name + ' Present Position',
        value: [
          servo.presentPosition!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Present Velocity
      this.onDataPoint(new DataPoint({
        label: name + ' Present Velocity',
        value: [
          servo.presentVelocity!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Load
      this.onDataPoint(new DataPoint({
        label: name + ' Load',
        value: [
          servo.load!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Voltage
      this.onDataPoint(new DataPoint({
        label: name + ' Voltage',
        value: [
          servo.voltage!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))

      // Temperature
      this.onDataPoint(new DataPoint({
        label: name + ' Temperature',
        value: [
          servo.temperature!,
        ],
        type: DataPoint.Type.FLOAT_LIST,
      }))
    }, this)
  }

  @action
  private onDataPoint = (dataPoint: DataPoint) => {
    let trace = this.model.getTrace(dataPoint.label)

    // if we should add the trace info to plotly
    if (trace.addTrace) {
      trace.addTrace = false

      trace.id = this.model.getNextTraceID()

      this.addTrace(trace.name)
    }

    // if we are currently updating the plotly trace
    if (trace.display) {
      let updateX: number[] = this.model.getGraphUpdateX(trace.id)
      let updateY: number[] = this.model.getGraphUpdateY(trace.id)
      let updateZ: number[] = this.model.getGraphUpdateZ(trace.id)

      // append our new data to the update lists
      if (dataPoint.value.length === 1) {
        trace.xVal += 1
        updateX.push(trace.xVal)
        updateY.push(dataPoint.value[0])
        updateZ.push(0)
      } else if (dataPoint.value.length === 2) {
        updateX.push(dataPoint.value[0])
        updateY.push(dataPoint.value[1])
        updateZ.push(0)
      } else if (dataPoint.value.length >= 3) { // TODO: work out how to deal with data points with more then 3 values
        updateX.push(dataPoint.value[0])
        updateY.push(dataPoint.value[1])
        updateZ.push(dataPoint.value[2])
      }
    }
  }

  private addTrace(label: string) {
    const trace = {
      x: [],
      y: [],
      z: [],
      mode: 'markers',
      type: 'scattergl',
      marker: {
        size: 10,
      },
      name: label,
    }
    Plotly.addTraces(this.model.plotlyCanvas, trace)
  }
}
