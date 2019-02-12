import { observer } from 'mobx-react'
import * as React from 'react'

import { EditorViewModel } from '../view_model'

import * as style from './style.css'
import { TimelineViewModel } from './view_model'

type TimelineProps = {
  className?: string,
  editorViewModel: EditorViewModel,
  setPlayTime(time: number): void
}

@observer
export class Timeline extends React.Component<TimelineProps> {
  readyToDrag: boolean = false
  isDragging: boolean = false
  svgRef: React.RefObject<SVGSVGElement>
  viewModel?: TimelineViewModel

  constructor(props: TimelineProps) {
    super(props)
    this.svgRef = React.createRef()
  }

  render() {
    const viewModel = TimelineViewModel.of(this.props.editorViewModel)
    this.viewModel = viewModel

    return <div className={style.timeline}>
      <svg
        className={style.timelineSvg}
        vectorEffect='non-scaling-stroke'
        width={viewModel.width + 'px'}
        ref={this.svgRef}

        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onClick={this.onClick}
      >
        <g transform='translate(0, 0)'>
          <rect width={viewModel.width} height={viewModel.height} fill='#CCC' />
          <g>
            {
              viewModel.cells.map((_, i) => {
                const isPrimaryCell = i % viewModel.scaleX === 0
                return <g key={i}>
                  <line
                    x1={i * viewModel.cellWidth}
                    x2={i * viewModel.cellWidth}
                    y1={isPrimaryCell ? viewModel.height / 2.5 : viewModel.height / 1.5}
                    y2={viewModel.height}
                    stroke={ isPrimaryCell ? '#656565' : '#777' }
                  />
                  { isPrimaryCell &&
                    <text
                      className={style.timelineText}
                      x={(i * viewModel.cellWidth) + 2}
                      y={viewModel.height - 1}
                    >{ i / viewModel.scaleX }</text>
                  }
                </g>
              })
            }
          </g>

          { /* Play head. 26 is the natural height of the play head symbol, in pixels. */ }
          <g transform={`translate(${viewModel.playHeadPosition}, 0) scale(${viewModel.height / 26})`}>
            <path
              d='M0.5 17V0.5H23.5V17L12 25.5L0.5 17Z'
              fill='#2196F3'
              stroke='#1565C0'
              strokeWidth='2'
              data-draggable={true}
            />
          </g>
        </g>
      </svg>
    </div>
  }

  private onClick({ nativeEvent: event }: React.MouseEvent) {
    const viewModel = this.viewModel

    if (!viewModel) {
      return
    }

    const svg = this.svgRef.current!
    const reference = svg.createSVGPoint()

    reference.x = event.clientX
    reference.y = event.clientY

    const { x } = reference.matrixTransform(svg.getScreenCTM()!.inverse())

    this.props.setPlayTime(viewModel.svgToTime(x))
  }

  private startDrag() {
    this.isDragging = true

    document.addEventListener('mouseup', (event: MouseEvent) => {
      this.endDrag()
    }, { once: true })
  }

  private endDrag() {
    this.isDragging = false
    this.readyToDrag = false
  }

  private onMouseDown = ({ nativeEvent: event }: React.MouseEvent) => {
    const viewModel = this.viewModel
    if (viewModel && (event.target as HTMLElement).dataset.draggable) {
      this.readyToDrag = true
    }
  }

  private onMouseMove = ({ nativeEvent: event }: React.MouseEvent) => {
    const viewModel = this.viewModel

    if (!viewModel || !this.readyToDrag) {
      return
    }

    // Prevent things that happen on drag, like text selection
    event.preventDefault()

    // Start the drag if not already dragging
    if (!this.isDragging) {
      this.startDrag()
    }

    const { x } = this.getMousePositionInSvgSpace(event)

    this.props.setPlayTime(
      this.clampToRange(viewModel.svgToTime(x), 0, viewModel.timelineLength),
    )
  }

  private getMousePositionInSvgSpace(event: MouseEvent) {
    const svg = this.svgRef.current!
    const CTM = svg.getScreenCTM()!

    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    }
  }

  private clampToRange(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }
}
