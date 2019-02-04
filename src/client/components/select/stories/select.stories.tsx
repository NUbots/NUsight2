import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import * as React from 'react'

import { Select, SelectOption } from '../view'

import Icon from './icon.svg'

const actions = {
  onChange: action('onChange'),
}

const container = { maxWidth: '320px', fontFamily: 'Arial, sans-serif' }

storiesOf('components.select', module)
  .add('renders basic', () => {
    return <div style={container}>
      <Select
        options={[]}
        onChange={actions.onChange}
        placeholder='Select...'
      />
    </div>
  })
  .add('renders empty', () => {
    const empty = (
      <div>
        <h4>No options</h4>
        <p>Add options to see them here</p>
      </div>
    )
    return <div style={container}>
      <Select
        options={[]}
        onChange={actions.onChange}
        placeholder='Select...'
        empty={empty}
      />
    </div>
  })
  .add('renders with options', () => {
    const options = getOptions()
    return <div style={container}>
      <Select
        options={options}
        onChange={actions.onChange}
        placeholder='Select a color...'
      />
    </div>
  })
  .add('renders with selection', () => {
    const options = getOptions()
    const selected = options[1]
    return <div style={container}>
      <Select
        options={options}
        selectedOption={selected}
        onChange={actions.onChange}
        placeholder='Select a color...'
      />
    </div>
  })
  .add('renders with icon', () => {
    const options = getOptions()
    return <div style={container}>
      <Select
        options={options}
        onChange={actions.onChange}
        placeholder='Select a color...'
        icon={<Icon />}
      />
    </div>
  })

function getOptions() {
  return [
    { id: 'red', label: 'Red' },
    { id: 'green', label: 'Green' },
    { id: 'blue', label: 'Blue' },
  ]
}
