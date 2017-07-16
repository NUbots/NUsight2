import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'
import { Component } from 'react'
import { NUsightNetwork } from '../../network/nusight_network'
import { RecordController } from './controller'
import { RecordModel } from './model'
import * as styles from './styles.css'

type Props = {
  menu: ComponentType<{}>
  controller: RecordController
  model: RecordModel
}

@observer
export class RecordView extends Component<Props> {
  render() {
    const { menu, controller, model } = this.props
    const { robots } = model
    return (
      <div className={styles.record}>
        <RecordMenuBar menu={menu}/>
        <div>
          {robots.map(robot => (
            <div key={robot.name}>
              <div>Name: {robot.name}</div>
              <div>Record: {robot.recording
                ? <button style={{ border: 'none', backgroundColor: 'red' }}
                          onClick={() => controller.onStopRecordingClick(robot)}>Stop recording</button>
                : <button style={{ border: 'none', backgroundColor: 'white' }}
                          onClick={() => controller.onStartRecordingClick(robot)}>Start recording</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  public static of(menu: ComponentType<{}>, nusightNetwork: NUsightNetwork, model: RecordModel) {
    const controller = RecordController.of(nusightNetwork)
    return <RecordView menu={menu} controller={controller} model={model}/>
  }
}

type RecordMenuBarProps = {
  menu: ComponentType<{}>
}

const RecordMenuBar = observer((props: RecordMenuBarProps) => {
  const { menu: Menu } = props
  return (
    <Menu>
      <ul className={styles.recordMenuBar}></ul>
    </Menu>
  )
})
