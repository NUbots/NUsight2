import { observer } from 'mobx-react'
import * as Plotly from 'plotly.js'
import * as React from 'react'
import { HTMLProps } from 'react'
import { MenuBar } from '../menu_bar/view'
import { ScatterplotController } from './controller'
import * as style from './style.css'

interface Trace {
  mode: string
  type: string
  hoverinfo: string
  marker: Plotly.ShortMarker
  name: string
  xVal: number
  id: number
  display: boolean
  addTrace: boolean
}

interface DataPoint {
  label: string
  values: number[]
}

interface ScatterplotViewProps extends HTMLProps<JSX.Element> {
  controller: ScatterplotController
}

@observer
export class ScatterplotView extends React.Component<ScatterplotViewProps> {

  private controller: ScatterplotController

  private canvas: HTMLDivElement
  private updateLoopId: number

  private traces: Map<string, Trace>
  private nextTraceId: number = 0

  private graphUpdateX: Map<number, number[]>
  private graphUpdateY: Map<number, number[]>
  private graphUpdateZ: Map<number, number[]>

  // config settings
  private maxPoints: number = 100
  private fps: number = 30

  constructor(props: any, context: any) {
    super(props, context)
    this.traces = new Map<string, Trace>()
    this.graphUpdateX = new Map<number, number[]>()
    this.graphUpdateY = new Map<number, number[]>()
    this.graphUpdateZ = new Map<number, number[]>()
  }

  public render(): JSX.Element {
    return (
      <div className={style.scatterplot}>
        <ScatterplotMenuBar onScatterplot2d={this.onScatterplot2d} onScatterplot3d={this.onScatterplot3d}/>
        <div className={style.scatterplot_container}>
          <div className={style.scatterplot_plotly} ref={canvas => {
            if (canvas) {
              this.canvas = canvas
            }
          }}>
          </div>
        </div>
      </div>
    )
  }

  public onDataPoint(data: DataPoint): void {
    let trace = this.traces.get(data.label)

    // if the DataPoint's label has never been seen before, create a new trace
    if (trace == null) {
      trace = this.createTrace(data.label)
      this.traces.set(data.label, trace)
    }

    // if we should add the trace info to plotly
    if (trace.addTrace) {
      trace.addTrace = false

      trace.id = this.nextTraceId
      this.nextTraceId += 1

      this.addTrace(trace.name)
    }

    // if we are currently updating the plotly trace
    if (trace.display) {
      let updateX = this.graphUpdateX.get(trace.id)
      let updateY = this.graphUpdateY.get(trace.id)
      let updateZ = this.graphUpdateZ.get(trace.id)

      // if no updates to the trace has been made since the last graph update
      // add it to the update lists
      if (updateX == null) {
        updateX = []
        this.graphUpdateX.set(trace.id, updateX)
      }
      if (updateY == null) {
        updateY = []
        this.graphUpdateY.set(trace.id, updateY)
      }
      if (updateZ == null) {
        updateZ = []
        this.graphUpdateZ.set(trace.id, updateZ)
      }

      // append our new data to the update lists
      if (data.values.length === 1) {
        trace.xVal += 1
        updateX.push(trace.xVal)
        updateY.push(data.values[0])
        updateZ.push(0)
      } else if (data.values.length === 2) {
        updateX.push(data.values[0])
        updateY.push(data.values[1])
        updateZ.push(0)
      } else if (data.values.length >= 3) { // TODO: work out how to deal with data points with more then 3 values
        updateX.push(data.values[0])
        updateY.push(data.values[1])
        updateZ.push(data.values[2])
      }
    }
  }

  public addTrace(label: string): void {
    const newTrace: Plotly.ShortData = {
      x: [],
      y: [],
      z: [],
      mode: 'markers',
      type: 'scattergl',
      marker: {
        size: 10,
      },
      name: label,
    }

    Plotly.addTraces(this.canvas, newTrace)
  }

  public createTrace(label: string): Trace {
    const trace: Trace = {
      mode: 'markers',
      type: 'scattergl',
      hoverinfo: 'x+y',
      marker: { size: 12 },
      name: label,
      xVal: 0,
      id: -1,
      display: true, // TODO: set this to false, and create a config panel to enable it
      addTrace: true, // TODO: set this to false, and create a config panel to enable it
    }
    return trace
  }

  public updateDimensions(): void {
    const layout = {
      width: this.canvas.offsetWidth,
      height: this.canvas.offsetHeight,
    }
    Plotly.relayout(this.canvas, layout)
  }

  public componentDidMount(): void {
    window.addEventListener('resize', this.updateDimensions.bind(this))

    const data: any = [
    ]

    Plotly.newPlot(this.canvas, data)

    const me = this

    this.updateLoopId = window.setInterval(() => {
      const update = {
        x: Array.from(me.graphUpdateX.values()),
        y: Array.from(me.graphUpdateY.values()),
        z: Array.from(me.graphUpdateZ.values()),
      }

      Plotly.extendTraces(this.canvas, update, Array.from(me.graphUpdateX.keys()), me.maxPoints)

      me.graphUpdateX.clear()
      me.graphUpdateY.clear()
      me.graphUpdateZ.clear()
    }, 1000 / this.fps)

    this.simulateData()
  }

  public simulateData(): void {

    this.onDataPoint({
      label: 'Testing 1',
      values: [0, 0],
    })

    this.onDataPoint({
      label: 'Testing 2',
      values: [0, 0],
    })

    const me = this

    window.setInterval(() => {
      const now = Date.now()
      const period = 1000 * 10
      const theta = 2 * Math.PI * now / period
      const sine = Math.sin(theta)
      const cosine = Math.cos(theta)

      this.onDataPoint({
        label: 'Testing 1',
        values: [sine, cosine],
      })

      this.onDataPoint({
        label: 'Testing 2',
        values: [sine * 4 , cosine * 4, sine * 2],
      })
    }, 1000 / this.fps)
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.updateLoopId)
  }

  private onScatterplot2d = () => {
    this.props.controller.onScatterplot2d(this.canvas)
  }

  private onScatterplot3d = () => {
    this.props.controller.onScatterplot3d(this.canvas)
  }
}

interface ScatterplotMenuBarProps {
  onScatterplot2d(): void
  onScatterplot3d(): void
}

const ScatterplotMenuBar = observer((props: ScatterplotMenuBarProps) => {
  return (
    <MenuBar>
      <ul className={style.scatterplot__menu}>
        <li className={style.scatterplot__menuItem}>
          <button className={style.scatterplot__menuButton} onClick={props.onScatterplot2d}>Scatterplot 2D</button>
        </li>
        <li className={style.scatterplot__menuItem}>
          <button className={style.scatterplot__menuButton} onClick={props.onScatterplot3d}>Scatterplot 3D</button>
        </li>
      </ul>
    </MenuBar>
  )
})
