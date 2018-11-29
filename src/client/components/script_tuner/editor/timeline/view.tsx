import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type TimelineProps = {
  className?: string,
  cellWidth: number,
  scaleX: number,
  length: number
}

@observer
export class Timeline extends React.Component<TimelineProps> {
  render() {
    const length = this.props.length + 1 // How many points on the timeline
    const scaleX = this.props.scaleX
    const cellWidth = this.props.cellWidth // Space between each point on the timeline
    const width = length * cellWidth * scaleX // Full width of the timeline
    const height = 20 // Height of the timeline
    const cells = new Array(Math.ceil(length * scaleX)).fill(0) // The cells on the timeline

    return <div className={style.timeline}>
      <svg
        className={style.timelineSvg}
        width={width + 'px'}
        vectorEffect='non-scaling-stroke'
      >
        <g transform='translate(0, 0)'>
          <rect width={width} height={height} fill='#AAA' />
          <g>
            {
              cells.map((_, i) => {
                const isPrimaryCell = i % scaleX === 0
                return <g key={i}>
                  <line
                    x1={i * cellWidth}
                    x2={i * cellWidth}
                    y1={isPrimaryCell ? height / 2.5 : height / 1.5}
                    y2={height}
                    stroke={ isPrimaryCell ? '#656565' : '#777' }
                  />
                  { isPrimaryCell &&
                    <text x={(i * cellWidth) + 2} y={height - 1} className={style.timelineText}>{ i / scaleX }</text>
                  }
                </g>
              })
            }
          </g>
        </g>
      </svg>
    </div>
  }
}
