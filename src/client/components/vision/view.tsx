import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { VisionNetwork } from './network'
import * as styles from './styles.css'
import { VisionViewModel } from './view_model'
import { RobotViewModel } from './view_model'
import { CameraView } from './camera/view'
import { CameraViewModel } from './camera/view_model'

@observer
export class VisionView extends Component<{
  viewModel: VisionViewModel
  network: VisionNetwork
  Menu: ComponentType
}> {
  componentWillUnmount() {
    this.props.network.destroy()
  }

  render() {
    const { viewModel, Menu } = this.props
    // TODO: Some kind of intelligent layout resizing to make it look good.
    return (
      <div className={styles.vision}>
        <Menu/>
        <div>
          {viewModel.robots.map(robot => {
            return <div key={robot.id}>
              <span>{robot.name}</span>
              {
                robot.cameras.map(camera => (
                  <CameraView key={camera.id} viewModel={camera}/>
                ))
              }
            </div>
          })}
        </div>
      </div>
    )
  }
}
