import { observer } from 'mobx-react'
import { ScatterplotModel } from './model'
import * as Plotly from 'plotly.js'
import * as React from 'react'
import { HTMLProps } from 'react'
import { MenuBar } from '../menu_bar/view'
import { ScatterplotController } from './controller'
import * as style from './style.css'

interface DataPoint {
  label: string
  values: number[]
}

interface ScatterplotViewProps extends HTMLProps<JSX.Element> {
  controller: ScatterplotController
  model: ScatterplotModel
}

@observer
export class ScatterplotView extends React.Component<ScatterplotViewProps> {

  private canvas: HTMLDivElement
  private updateLoopId: number


  constructor(props: any, context: any) {
    super(props, context)
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
    let trace = this.props.model.getTrace(data.label)

    // if we should add the trace info to plotly
    if (trace.addTrace) {
      trace.addTrace = false

      trace.id = this.props.model.getNextTraceID()

      this.addTrace(trace.name)
    }

    // if we are currently updating the plotly trace
    if (trace.display) {
      let updateX: number[] = this.props.model.getGraphUpdateX(trace.id)
      let updateY: number[] = this.props.model.getGraphUpdateY(trace.id)
      let updateZ: number[] = this.props.model.getGraphUpdateZ(trace.id)

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
        x: Array.from(me.props.model.graphUpdateX.values()),
        y: Array.from(me.props.model.graphUpdateY.values()),
        z: Array.from(me.props.model.graphUpdateZ.values()),
      }

      Plotly.extendTraces(this.canvas, update, Array.from(me.props.model.graphUpdateX.keys()), me.props.model.maxPoints)

      me.props.model.graphUpdateX.clear()
      me.props.model.graphUpdateY.clear()
      me.props.model.graphUpdateZ.clear()
    }, 1000 / this.props.model.fps)

    this.simulateData()
  }

  public simulateData(): void {

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
    }, 1000 / this.props.model.fps)
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
