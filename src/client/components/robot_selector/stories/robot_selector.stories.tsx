import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import { action as mobxAction, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'

import { BrowserSystemClock } from '../../../../client/time/browser_clock'
import { CancelTimer, Clock } from '../../../../shared/time/clock'
import { RobotNetworkStatsModel } from '../../../network/model'
import { RobotModel } from '../../robot/model'
import { RobotSelector } from '../view'

const actions = {
  selectRobot: action('selectRobot'),
}

storiesOf('components.robot_selector', module)
  .addDecorator(story => <div style={{ maxWidth: '320px' }}>{story()}</div>)
  .add('renders empty', () => {
    return <RobotSelector
      robots={[]}
      selectRobot={actions.selectRobot}
    />
  })
  .add('renders with robots', () => {
    const robots = getRobots()
    return <RobotSelector
      robots={robots}
      selectRobot={actions.selectRobot}
    />
  })
  .add('renders with updating stats', () => {
    const robots = getRobots()
    const model = observable({
      robots,
    })
    return <UpdatingStatsStory robots={model.robots} />
  })
  .add('interactive', () => {
    const robots = getRobots()
    const model = observable({
      robots,
    })
    const selectRobot = mobxAction((robot: RobotModel) => robot.enabled = !robot.enabled)
    const Component = observer(() => <RobotSelector
      robots={model.robots}
      selectRobot={selectRobot}
    />)
    return <Component/>
  })

function getRobots(): RobotModel[] {
  return [
    {
      id: '1',
      name: 'Virtual Robot 1',
      connected: true,
      enabled: true,
      address: '',
      port: 0,
    },
    {
      id: '2',
      name: 'Virtual Robot 2',
      connected: true,
      enabled: true,
      address: '',
      port: 0,
    },
    {
      id: '3',
      name: 'Virtual Robot 3',
      connected: false,
      enabled: true,
      address: '',
      port: 0,
    },
  ]
}


@observer
export class UpdatingStatsStory extends React.Component<{ robots: RobotModel[] }> {
  cancelUpdateInterval?: CancelTimer

  render() {
    const { robots } = this.props

    return <RobotSelector
      robots={robots}
      selectRobot={actions.selectRobot}
    />
  }

  @mobxAction
  updateStats = () => {
    this.props.robots
      .filter(robotModel => robotModel.connected)
      .forEach(robotModel => {
        const stats = RobotNetworkStatsModel.of(robotModel)
        const packets = randomIntBetween(1, 3)
        stats.packets += packets
        stats.packetsPerSecond.update(packets)
        const bytes = randomIntBetween(1, 2e3)
        stats.bytes += bytes
        stats.bytesPerSecond.update(bytes)
      })
  }

  componentDidMount() {
    this.cancelUpdateInterval = BrowserSystemClock.setInterval(this.updateStats, 0.5)
  }

  componentWillUnmount() {
    if (this.cancelUpdateInterval) {
      this.cancelUpdateInterval()
      this.cancelUpdateInterval = undefined
    }
  }
}

function randomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * max) + min
}
