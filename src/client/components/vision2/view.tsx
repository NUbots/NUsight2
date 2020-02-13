import { observer } from 'mobx-react'
import React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { CameraView } from './camera/view'
import { VisionModel } from './model'
import { VisionNetwork } from './network'
import styles from './styles.css'

@observer
export class VisionView extends Component<{
  model: VisionModel
  network: VisionNetwork
  Menu: ComponentType
}> {
  componentWillUnmount() {
    this.props.network.destroy()
  }

  render() {
    const { model: { robots }, Menu } = this.props
    return (
      <div className={styles.vision}>
        <Menu/>
        <div style={{ display: 'flex', flexGrow: 1 }}>
          {robots.map(({ id, name, cameras }) => (
            <div key={id} style={{ flex: '1 1 0', position: 'relative' }}>
              <h1>{name}</h1>
              {Array.from(cameras.values()).map(camera => <CameraView key={camera.id} model={camera}/>)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
