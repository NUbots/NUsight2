import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import * as React from 'react'

import { RobotSelector } from '../view'

const actions = {
  onSelect: action('onSelect'),
}

const container = { maxWidth: '320px', fontFamily: 'Arial, sans-serif' }

storiesOf('components.robot_selector', module)
  .add('renders empty', () => {
    return <div style={container}>
      <RobotSelector
        robots={[]}
        onSelect={actions.onSelect}
      />
    </div>
  })
  .add('renders with robots', () => {
    const robots = getRobots()
    return <div style={container}>
      <RobotSelector
        robots={robots}
        onSelect={actions.onSelect}
      />
    </div>
  })
  .add('renders with selection', () => {
    const robots = getRobots()
    const selected = robots[0]
    return <div style={container}>
      <RobotSelector
        robots={robots}
        selected={selected}
        onSelect={actions.onSelect}
      />
    </div>
  })

function getRobots() {
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
      connected: true,
      enabled: true,
      address: '',
      port: 0,
    },
  ]
}
