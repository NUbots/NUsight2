import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import { action as mobxAction, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'

import { SwitchesMenu, SwitchesMenuOption } from '../view'

const actions = {
  onToggleOption: action('onToggleOption'),
}

storiesOf('components.switches_menu', module)
  .addDecorator(story => <div style={{ maxWidth: '350px' }}>{story()}</div>)
  .add('renders empty', () => {
    return <SwitchesMenu
      options={[]}
      toggleOption={actions.onToggleOption}
    />
  })
  .add('renders with options', () => {
    const options = getOptions()
    return <SwitchesMenu
      options={options}
      toggleOption={actions.onToggleOption}
    />
  })
  .add('dropdown right', () => {
    const options = getOptions()
    const style = { backgroundColor: '#eee', display: 'flex', justifyContent: 'flex-end' }
    return <div style={style}>
      <SwitchesMenu
        options={options}
        dropdownMenuPosition='right'
        toggleOption={actions.onToggleOption}
      />
    </div>
  })
  .add('interactive', () => {
    const options = getOptions()
    const model = observable({
      options,
    })
    const onChange = mobxAction((option: SwitchesMenuOption) => option.enabled = !option.enabled)
    const Component = observer(() => <SwitchesMenu
      options={model.options}
      toggleOption={onChange}
    />)

    return <Component />
  })

function getOptions(): SwitchesMenuOption[] {
  return [
    { label: 'Lines', enabled: true },
    { label: 'Balls', enabled: true },
    { label: 'Goals', enabled: false },
  ]
}
