import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import { action as mobxAction, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'

import { Switch } from '../view'

storiesOf('Switch', module)
  .add('interactive', () => {
    const model = observable({
      on: false,
    })
    const onChange = mobxAction(() => {
      model.on = !model.on
    })
    const InteractiveSwitch = observer(() => <Switch on={model.on} onChange={onChange}/>)
    return <InteractiveSwitch/>
  })
  .add('on', () => {
    return <Switch on={true} onChange={action('onChange')}/>
  })
  .add('off', () => {
    return <Switch on={false} onChange={action('onChange')}/>
  })
  .add('on disabled', () => {
    return <Switch on={true} disabled={true} onChange={action('onChange')}/>
  })
  .add('off disabled', () => {
    return <Switch on={false} disabled={true} onChange={action('onChange')}/>
  })
