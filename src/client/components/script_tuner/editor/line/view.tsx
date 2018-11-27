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

@observer
export class LineEditor extends Component<LineEditorProps> {
  render() {
    const viewModel = LineEditorViewModel.of(this.props.servo)

    return <div className={style.lineEditor}>
      <svg
        viewBox='0 0 60 6.283185307179586'
        xmlns='http://www.w3.org/2000/svg'
        className={style.lineEditorSvg}
        vectorEffect='non-scaling-stroke'
      >
        <line x1='0' y1='50%' x2='100%' y2='50%' stroke='gray' strokeWidth='0.01'></line>

        {
          viewModel.points.map((point, index) => {
            const position = index
            return <g key={position}>
              <line x1={position} y1='0' x2={position} y2='100%' stroke='gray' strokeWidth='0.01' />
              <text x={(position) + 0.05} y='100%' className={style.lineEditorText}>{ position }</text>
            </g>
          })
        }

        {
          viewModel.svgLineSegments.map((segment, index) => {
            return <line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}

              stroke='black'
              strokeWidth='0.01'
            />
          })
        }

        {
          viewModel.svgPoints.map((point, index) => {
            return <circle
              className={style.lineEditorDraggable}
              key={index}
              cx={point.x}
              cy={point.y}
              data-index={index}

              fill='orange'
              r='0.08'
              stroke='black'
              strokeWidth='0.01'
            >
              <title>{ `(${point.x}, ${point.y})` }</title>
            </circle>
          })
        }
      </svg>
    </div>
  }
}
