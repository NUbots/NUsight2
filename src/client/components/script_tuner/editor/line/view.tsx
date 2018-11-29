import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { Servo } from '../../model'
import { EditorViewModel } from '../view_model'

import { LineEditorController } from './controller'
import * as style from './style.css'
import { LineEditorViewModel } from './view_model'

type LineEditorProps = {
  className?: string,
  servo: Servo,
  controller: LineEditorController
  editorViewModel: EditorViewModel
}

@observer
export class LineEditor extends Component<LineEditorProps> {
  render() {
    const viewModel = LineEditorViewModel.of({
      servo: this.props.servo,
      editorViewModel: this.props.editorViewModel,
    })

    return <div className={style.lineEditor}>
      <svg
        className={style.lineEditorSvg}
        vectorEffect='non-scaling-stroke'
        height={viewModel.height + 'px'}
        width={viewModel.width + 'px'}
      >
        // Vertical grid lines
        <line x1='0' y1='25%' x2='100%' y2='25%' stroke='#CCC' strokeWidth='1'></line>
        <line x1='0' y1='50%' x2='100%' y2='50%' stroke='#888' strokeWidth='1'></line>
        <line x1='0' y1='75%' x2='100%' y2='75%' stroke='#CCC' strokeWidth='1'></line>

        {
          // Horizontal grid lines
          new Array(viewModel.width).fill(0).map((_, index) => {
            const x = index * viewModel.cellWidth
            return <line x1={x} y1='0' x2={x} y2='100%' stroke='#CCC' strokeWidth='1' key={index} />
          })
        }

        {
          // The main plot line
          viewModel.svgLineSegments.map((segment, index) => {
            return <line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}

              stroke='black'
              strokeWidth='1'
            />
          })
        }

        {
          // Points on the main plot line
          viewModel.svgPoints.map((point, index) => {
            return <circle
              className={style.lineEditorDraggable}
              key={index}
              cx={point.x}
              cy={point.y}
              data-index={index}

              fill='orange'
              r='4'
              stroke='black'
              strokeWidth='1'
            >
              <title>{ point.label }</title>
            </circle>
          })
        }
      </svg>
    </div>
  }
}
