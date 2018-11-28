import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { Servo } from '../../model'

import { LineEditorController } from './controller'
import * as style from './style.css'
import { LineEditorViewModel } from './view_model'

type LineEditorProps = {
  className?: string,
  servo: Servo,
  controller: LineEditorController
}

function scale(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

@observer
export class LineEditor extends Component<LineEditorProps> {
  render() {
    const viewModel = LineEditorViewModel.of(this.props.servo)
    const cellWidth = 32
    const width = viewModel.points.length * cellWidth

    return <div className={style.lineEditor}>
      <svg
        // viewBox='0 0 60 6.283185307179586'
        // xmlns='http://www.w3.org/2000/svg'
        className={style.lineEditorSvg}
        vectorEffect='non-scaling-stroke'
        height='200px'
        width={width + 'px'}
      >
        <line x1='0' y1='50%' x2='100%' y2='50%' stroke='gray' strokeWidth='1'></line>

        {
          viewModel.points.map((point, index) => {
            const position = index * cellWidth
            return <line x1={position} y1='0' x2={position} y2='100%' stroke='gray' strokeWidth='1' key={index} />
          })
        }

        {
          viewModel.svgLineSegments.map((segment, index) => {
            return <line
              key={index}
              x1={segment.x1 * cellWidth}
              y1={segment.y1 * cellWidth}
              x2={segment.x2 * cellWidth}
              y2={segment.y2 * cellWidth}

              stroke='black'
              strokeWidth='1'
            />
          })
        }

        {
          viewModel.svgPoints.map((point, index) => {
            return <circle
              className={style.lineEditorDraggable}
              key={index}
              cx={point.x * cellWidth}
              cy={point.y * cellWidth}
              data-index={index}

              fill='orange'
              r='4'
              stroke='black'
              strokeWidth='1'
            >
              <title>{ `(${point.x}, ${point.y})` }</title>
            </circle>
          })
        }
      </svg>
    </div>
  }
}
