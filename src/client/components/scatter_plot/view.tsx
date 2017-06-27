import { autorun } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import { ScatterplotModel } from './model'
import * as Plotly from 'plotly.js'
import * as React from 'react'
import { HTMLProps } from 'react'
import { MenuBar } from '../menu_bar/view'
import { ScatterplotController } from './controller'
import * as style from './style.css'
import { ScatterplotNetwork } from './network'

interface DataPoint {
  label: string
  values: number[]
}

interface ScatterplotViewProps extends HTMLProps<JSX.Element> {
  controller: ScatterplotController
  model: ScatterplotModel
  network: ScatterplotNetwork
}

@observer
export class ScatterplotView extends React.Component<ScatterplotViewProps> {

  private canvas: HTMLDivElement
  private updateLoopId: number
  private stopAutorunGraph: IReactionDisposer

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
              this.props.model.setPlotlyCanvas(canvas)
            }
          }}>
          </div>
        </div>
      </div>
    )
  }

  public updateDimensions(): void {
    const layout = {
      width: this.canvas.offsetWidth,
      height: this.canvas.offsetHeight,
    }
    Plotly.relayout(this.canvas, layout)
  }

  public changeGraph(): void {
    const update = {
      type: this.props.model.graphType,
    }
    Plotly.restyle(this.canvas, update)
  }

  public componentDidMount(): void {
    window.addEventListener('resize', this.updateDimensions.bind(this))

    const data: any = [
    ]

    Plotly.newPlot(this.canvas, data)

    this.stopAutorunGraph = autorun(() => this.changeGraph())

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
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.updateLoopId)
    this.stopAutorunGraph()
    this.props.network.destroy()
  }

  private onScatterplot2d = () => {
    this.props.controller.onScatterplot2d(this.props.model)
  }

  private onScatterplot3d = () => {
    this.props.controller.onScatterplot3d(this.props.model)
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
