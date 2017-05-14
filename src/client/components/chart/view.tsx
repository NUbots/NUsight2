import * as React from 'react'
import { SmoothieChart } from 'smoothie'
import { TimeSeries } from 'smoothie'
import Sidebar from 'react-sidebar'
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
    const sidebarContent = <b>Hello!</b>
    return (
      <div className={style.chart}>
        <MenuBar/>
        <div className={style.chart__canvasContainer}>
          <Sidebar open={true}
                   docked={true}
                   shadow={true}
                   pullRight={true}>
            <canvas className={style.chart__canvas} ref={canvas => {
              this.canvas = canvas
            }}/>
          </Sidebar>
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
      '#a6cee3',
      '#1f78b4',
      '#b2df8a',
      '#33a02c',
      '#fb9a99',
      '#e31a1c',
      '#fdbf6f',
      '#ff7f00',
      '#cab2d6',
      '#6a3d9a',
      '#ffff99',
      '#b15928',
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
