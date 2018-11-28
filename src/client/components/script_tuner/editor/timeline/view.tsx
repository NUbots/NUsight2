import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type TimelineProps = {
  className?: string,
  length: number
}

@observer
export class Timeline extends React.Component<TimelineProps> {
  render() {
    const height = 20
    const cellWidth = 32
    const width = this.props.length * cellWidth
    const cells = new Array(Math.ceil(width / cellWidth)).fill(0)

    return <div className={style.timeline}>
      <svg xmlns='http://www.w3.org/2000/svg' className={style.timelineSvg} width={width + 'px'}>
        <g transform='translate(0, 0)'>
          <rect width={width} height={height} fill='#AAA' />
          <g>
            {
              cells.map((_, i) => <g>
                <line
                  x1={i * cellWidth}
                  x2={i * cellWidth}
                  y1={i % 5 === 0 ? height / 2.5 : height / 2}
                  y2={height}
                  stroke={ i % 5 === 0 ? '#656565' : '#777777' }
                />
                <text x={(i * cellWidth) + 2} y={height - 1} className={style.timelineText}>{ i }</text>
              </g>)
            }
          </g>
        </g>
      </svg>
    </div>
  }
}
