import { action } from '@storybook/addon-actions'
import { storiesOf } from '@storybook/react'
import { action as mobxAction, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'

import { File } from '../model'
import { FileBrowser } from '../view'

const actions = {
  onSelect: action('onSelect'),
}

storiesOf('components.file_tree', module)
  .addDecorator(story => {
    return <div style={{
      maxWidth: '320px',
      maxHeight: '400px',
      border: '1px solid #EEE',
      overflowY: 'auto',
    }}>{story()}</div>
  })
  .add('empty', () => {
    return <FileBrowser
      files={[]}
      onSelect={actions.onSelect}
    />
  })
  .add('interactive', () => {
    const files = getFiles()
    return <FileBrowser
      files={files}
      onSelect={actions.onSelect}
    />
  })
  .add('no animation', () => {
    const files = getFiles()
    return <FileBrowser
      files={files}
      animate={false}
      onSelect={actions.onSelect}
    />
  })

function getFiles(): File[] {
  return [
    {
      path: 'scripts/igus1/Stand.yaml',
    },
    {
      path: 'scripts/igus1/GetupFront.yaml',
    },
    {
      path: 'scripts/igus1/GetupBack.yaml',
    },
    {
      path: 'scripts/igus2/Stand.yaml',
    },
    {
      path: 'scripts/igus2/GetupFront.yaml',
    },
    {
      path: 'scripts/igus2/GetupBack.yaml',
    },
    {
      path: 'config/igus1/NUsight.yaml',
    },
    {
      path: 'config/igus1/DataLogger.yaml',
    },
    {
      path: 'config/igus1/WalkEngine.yaml',
    },
    {
      path: 'config/igus2/NUsight.yaml',
    },
    {
      path: 'config/igus2/DataLogger.yaml',
    },
    {
      path: 'config/igus2/WalkEngine.yaml',
    },
    {
      path: 'TopLevelFile.yaml',
    },
    {
      path: 'AnotherTopLevelFile.yaml',
    },
  ]
}
