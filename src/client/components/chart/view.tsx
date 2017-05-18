import { observer } from 'mobx-react'
import * as React from 'react'
import Sidebar from 'react-sidebar'
import { SmoothieChart } from 'smoothie'
import { SelectionTree } from './selectiontree/index'
import * as style from './style.css'

const MenuBar = () => {
  return (
      <ul className={style.chart__menu}>
      </ul>
  )
}

@observer
export class ChartView extends React.Component<any, any> {
  private canvas: HTMLCanvasElement
  private smoothie: SmoothieChart

  constructor(props: any, context: any) {
    super(props, context)
  }

  public render(): JSX.Element {

    const sidebarContent = <SelectionTree model={this.props.chartStore} />
    return (
      <div className={style.chart}>
        <MenuBar/>
        <Sidebar sidebar={sidebarContent}
                 open={true}
                 docked={true}
                 shadow={true}
                 contentClassName={style.chart__canvasContainer}
                 pullRight={true}>
          <canvas className={style.chart__canvas} ref={canvas => {
            this.canvas = canvas
          }}/>
        </Sidebar>
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
  }

  public componentWillUnmount(): void {
    this.smoothie.stop()
  }
}

export default ChartView
