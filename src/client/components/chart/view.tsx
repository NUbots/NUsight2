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
  private timeseries: TimeSeries
  private dataGenerator

  constructor(props: any, context: any) {
    super(props, context)
  }

  public render(): JSX.Element {
    return (
      <div className={style.chart}>
        <MenuBar/>
        <canvas className={style.chart__canvas} width={1000} height={500} ref={canvas => {
          this.canvas = canvas
        }}/>
      </div>
    )
  }

  public componentDidMount(): void {

    if (!this.smoothie) {
      this.smoothie = new SmoothieChart()
    }

    if (this.canvas) {
      this.smoothie.streamTo(this.canvas)
    }

    this.timeseries.append(new TimeSeries())
    this.timeseries.append(new TimeSeries())

    this.timeseries.forEach(series => {
      this.smoothie.addTimeSeries(series)
    })

    this.dataGenerator = setInterval(() => {
      const time = new Date().getTime()
      this.timeseries.forEach(series => {
        series.append(time, Math.random())
      })
    }, 500)
  }

  public componentWillUnmount(): void {
    this.smoothie.stop();
    clearInterval(this.dataGenerator)
  }

  public componentDidUpdate(): void {
    // if (this.props.width != prevProps.width || this.props.height != prevProps.height) {
      // TODO resize the canvas or something
    // }
  }
}


export default ChartView
