import * as React from 'react'
import * as Plotly from 'plotly.js'
import * as style from './style.css'

export class ScatterplotView extends React.Component<any, any> {
  
  private canvas: HTMLDivElement
  private updateLoopId

  constructor(props: any, context: any) {
    super(props, context)
  }

  public render(): JSX.Element {
    return (
      <div className={style.scatterplot} ref={canvas => {
            this.canvas = canvas
          }}>
      </div>
    )
  }

  public componentDidMount(): void {
    var data: any = [
      {
        x: [10, 17, 54],
        y: [20, 14, 23],
        type: 'scattergl',
        mode: 'markers',
        marker: {
          size: 10
        }
      },
      {
        x: [5, 8, 12],
        y: [10, 19, 26],
        type: 'scattergl',
        mode: 'markers',
        marker: {
          size: 10
        }
      }
    ];

    Plotly.newPlot(this.canvas, data)

    this.updateLoopId = setInterval(() => {
      const update = {
        x: [[Math.floor(Math.random() * 100)], [Math.floor(Math.random() * 100)]],
        y: [[Math.floor(Math.random() * 100)], [Math.floor(Math.random() * 100)]]
      }
      Plotly.extendTraces(this.canvas, update, [0, 1], 100)
    }, 1000 / 30)
  }

  public componentWillUnmount(): void {
    clearInterval(this.updateLoopId)
  }

  public componentDidUpdate(): void {
  }
}


export default ScatterplotView
