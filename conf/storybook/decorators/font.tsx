import * as React from 'react'

import * as style from './font.css'

export function fontDecorator(story: any) {
  return <div className={style.font}>{story()}</div>
}
