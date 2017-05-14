import * as React from 'react'
import {SmoothieChart, TimeSeries} from 'smoothie'
import * as style from './style.css'

const MenuBar = () => {
  return (
      <ul className={style.chart__menu}>
      </ul>
  )
}

export class ChartView extends React.Component<any, any> {

  private canvas: HTMLCanvasElement
  private smoothie: SmoothieChart
  private timeseries: TimeSeries[]
  private dataGenerator: any

  constructor(props: any, context: any) {
    super(props, context)
    
    this.timeseries = []
  }

  public render(): JSX.Element {
    return (
      <div className={style.chart}>
        <MenuBar/>
        <div className={style.chart__canvasContainer}>
          <canvas className={style.chart__canvas} ref={canvas => {
            this.canvas = canvas
          }}/>
        </div>
      </div>
    )
  }

  public componentDidMount(): void {

    if (!this.smoothie) {
      this.smoothie = new SmoothieChart({
        interpolation: 'linear',
        responsive: true,
      })
    }

    if (this.canvas) {
      this.smoothie.streamTo(this.canvas, 0)
    }

    this.timeseries.push(new TimeSeries())
    this.timeseries.push(new TimeSeries())
    this.timeseries.push(new TimeSeries())
    this.timeseries.push(new TimeSeries())

    const colours = [
      '#e41a1c',
      '#4daf4a',
      '#377eb8',
      '#984ea3',
      '#ff7f00',
      '#ffff33',
      '#a65628',
      '#f781bf',
    ]

    let i = 0
    this.timeseries.forEach(series => {
      this.smoothie.addTimeSeries(series, {strokeStyle: colours[i++], lineWidth: 2})
    })

    this.dataGenerator = setInterval(() => {
      let i = 0
      const time = new Date().getTime()
      this.timeseries.forEach(series => {
        series.append(time, i * Math.sin(++i + (time * i)/1000))
      })
    }, 10)
  }

  public componentWillUnmount(): void {
    this.smoothie.stop();
    clearInterval(this.dataGenerator)
  }
}

export default ChartView
