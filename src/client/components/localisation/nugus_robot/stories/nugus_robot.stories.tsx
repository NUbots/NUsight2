import { storiesOf } from '@storybook/react'
import { computed } from 'mobx'
import { reaction } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { now } from 'mobx-utils'
import * as React from 'react'

import { Vector3 } from '../../../../math/vector3'
import { RobotModel } from '../../../robot/model'
import { fullscreen } from '../../../storybook/fullscreen'
import { LocalisationRobotModel } from '../../darwin_robot/model'
import { ModelVisualiser } from '../../darwin_robot/stories/model_visualizer'
import { NUgusViewModel } from '../view_model'

storiesOf('component.localisation.nugus_robot', module)
  .addDecorator(fullscreen)
  .add('renders statically', () => <NUgusVisualizer/>)
  .add('renders animated', () => <NUgusVisualizer animate/>)

class NUgusVisualizer extends React.Component<{ animate?: boolean }> {
  render() {
    return <ModelVisualiser model={this.createModel()} cameraPosition={new Vector3(0.5, 0.6, 0.5)}/>
  }

  private createModel() {
    const robotModel = RobotModel.of({
      id: 'Darwin #1',
      connected: true,
      enabled: true,
      name: 'Darwin #1',
      address: '127.0.0.1',
      port: 1234,
    })
    const model = LocalisationRobotModel.of(robotModel)
    this.props.animate && disposeOnUnmount(this, reaction(
      () => 2 * Math.PI * now('frame') / 1000,
      t => this.simulateWalk(model, t),
      { fireImmediately: true },
    ))
    return computed(() => NUgusViewModel.of(model).robot, { equals: () => false })
  }

  simulateWalk(model: LocalisationRobotModel, t: number) {
    model.motors.rightShoulderPitch.angle = 3 * Math.PI / 4 + 0.5 * Math.cos(t - Math.PI)
    model.motors.leftShoulderPitch.angle = 3 * Math.PI / 4 + 0.5 * Math.cos(t)
    model.motors.rightShoulderRoll.angle = -Math.PI / 8
    model.motors.leftShoulderRoll.angle = Math.PI / 8
    model.motors.rightElbow.angle = -3 * Math.PI / 4
    model.motors.leftElbow.angle = -3 * Math.PI / 4
    model.motors.rightHipYaw.angle = 0
    model.motors.leftHipYaw.angle = 0
    model.motors.rightHipRoll.angle = 0
    model.motors.leftHipRoll.angle = 0
    model.motors.rightHipPitch.angle = 0.5 * (Math.cos(t) - 1)
    model.motors.leftHipPitch.angle = 0.5 * (Math.cos(t - Math.PI) - 1)
    model.motors.rightKnee.angle = 0.5 * (-Math.cos(t) + 1)
    model.motors.leftKnee.angle = 0.5 * (-Math.cos(t - Math.PI) + 1)
    model.motors.rightAnklePitch.angle = 0
    model.motors.leftAnklePitch.angle = 0
    model.motors.rightAnkleRoll.angle = 0
    model.motors.leftAnkleRoll.angle = 0
    model.motors.headPan.angle = 0.1 * Math.cos(t)
    model.motors.headTilt.angle = 0.1 * Math.cos(t / 3) + 0.4
  }
}
