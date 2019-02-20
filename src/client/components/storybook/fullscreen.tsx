import { RenderFunction } from '@storybook/react'
import * as React from 'react'

import * as style from './fullscreen.css'

export function fullscreen(story: RenderFunction) {
  return <div className={style.fullscreen}>
    <style>{`body { margin: 0; padding: 0; }`}</style>
    {story()}
  </div>
}
