import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import * as React from 'react'

import { Select } from '../view'

import Icon from './icon.svg'

const actions = {
  onChange: action('onChange'),
}

const Container = ({ children }: { children: any }) => {
  return <div style={{ maxWidth: '320px', fontFamily: 'Arial, sans-serif' }}>
    {children}
  </div>
}

storiesOf('components.select', module)
  .add('renders basic', () => {
    return <Container>
      <Select
        options={[]}
        onChange={actions.onChange}
        placeholder='Select...'
      />
    </Container>
  })
  .add('renders empty', () => {
    const empty = (
      <div>
        <h4>No options</h4>
        <p>Add options to see them here</p>
      </div>
    )
    return <Container>
      <Select
        options={[]}
        onChange={actions.onChange}
        placeholder='Select...'
        empty={empty}
      />
    </Container>
  })
  .add('renders with options', () => {
    const options = getOptions()
    return <Container>
      <Select
        options={options}
        onChange={actions.onChange}
        placeholder='Select a color...'
      />
    </Container>
  })
  .add('renders with selection', () => {
    const options = getOptions()
    const selected = options[1]
    return <Container>
      <Select
        options={options}
        selectedOption={selected}
        onChange={actions.onChange}
        placeholder='Select a color...'
      />
    </Container>
  })
  .add('renders with icon', () => {
    const options = getOptions()
    return <Container>
      <Select
        options={options}
        onChange={actions.onChange}
        placeholder='Select a color...'
        icon={<Icon />}
      />
    </Container>
  })

function getOptions() {
  return [
    { id: 'red', label: 'Red' },
    { id: 'green', label: 'Green' },
    { id: 'blue', label: 'Blue' },
  ]
}
