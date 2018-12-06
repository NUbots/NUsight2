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
  isDragging: boolean = false
  selectedElement: HTMLElement | undefined
  svgRef: React.RefObject<SVGSVGElement>

  constructor(props: LineEditorProps) {
    super(props)
    this.svgRef = React.createRef()
  }

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
        ref={this.svgRef}

        onMouseDown={(e) => this.onMouseDown(e, viewModel)}
        onMouseMove={(e) => this.onMouseMove(e, viewModel)}
        onDoubleClick={(e) => this.onDoubleClick(e.nativeEvent, viewModel)}
      >
        { /* Horizontal grid lines */ }
        <line x1='0' y1='25%' x2='100%' y2='25%' stroke='#CCC' strokeWidth='1'></line>
        <line x1='0' y1='50%' x2='100%' y2='50%' stroke='#888' strokeWidth='1'></line>
        <line x1='0' y1='75%' x2='100%' y2='75%' stroke='#CCC' strokeWidth='1'></line>

        {
          // Vertical grid lines
          new Array(viewModel.width).fill(0).map((_, index) => {
            const x = index * viewModel.cellWidth
            return <line key={index} x1={x} y1='0' x2={x} y2='100%' stroke='#CCC' strokeWidth='1' />
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
              key={index}
              className={style.lineEditorDraggable}
              cx={point.x}
              cy={point.y}

              data-index={index}
              data-draggable='true'

              fill='orange'
              r='4'
              stroke='black'
              strokeWidth='1'

              onContextMenu={(e) => this.onRightClick(e, index)}
            >
              <title>{ point.label }</title>
            </circle>
          })
        }

      { /* The current play position indicator */ }
        <line
          stroke='#1565C0'
          strokeWidth='2'
          x1={viewModel.playPosition}
          x2={viewModel.playPosition}
          y1='0'
          y2='100%'
        />
      </svg>
    </div>
  }

  private onDoubleClick(event: MouseEvent, viewModel: LineEditorViewModel) {
    const svg = this.svgRef.current!
    const reference = svg.createSVGPoint()

    reference.x = event.clientX
    reference.y = event.clientY

    const { x, y } = reference.matrixTransform(svg.getScreenCTM()!.inverse())

    this.props.controller.addFrame({
      time: viewModel.svgToTime(x),
      angle: viewModel.svgToAngle(y),
    })
  }

  private onRightClick = ({ nativeEvent: event }: React.MouseEvent, pointIndex: number) => {
    event.preventDefault()
    this.props.controller.removeFrame(pointIndex)
  }

  private startDrag() {
    this.isDragging = true

    document.addEventListener('mouseup', (event: MouseEvent) => {
      this.endDrag()
    }, { once: true })
  }

  private endDrag() {
    this.isDragging = false
    this.selectedElement = undefined
  }

  private onMouseDown = ({ nativeEvent: event }: React.MouseEvent, viewModel: LineEditorViewModel) => {
    if ((event.target as HTMLElement).dataset.draggable) {
      this.selectedElement = (event.target as HTMLElement)
    }
  }

  private onMouseMove = ({ nativeEvent: event }: React.MouseEvent, viewModel: LineEditorViewModel) => {
    if (!this.selectedElement) {
      return
    }

    // Prevent things that happen on drag, like text selection
    event.preventDefault()

    // Start the drag if not already dragging
    if (!this.isDragging) {
      this.startDrag()
    }

    const index = Number(this.selectedElement.dataset.index!)
    const mouse = this.getMousePositionInSvgSpace(event)

    const minFrameSeparation = 0.05

    const previousFrameTime = index === 0
      ? 0 - minFrameSeparation
      : viewModel.points[index - 1].time

    const nextFrameTime = index === viewModel.points.length - 1
      ? viewModel.points.length + minFrameSeparation
      : viewModel.points[index + 1].time

    // The drag needs to be constrained between the points's neighbours
    const time = this.clampToRange(
      viewModel.svgToTime(mouse.x),
      previousFrameTime + minFrameSeparation,
      nextFrameTime - minFrameSeparation,
    )

    const angle = viewModel.svgToAngle(mouse.y)

    this.props.controller.updateFrame(index, { time, angle })
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
