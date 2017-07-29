import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import { DashboardModel } from './model'
import { DashboardNetwork } from './network'
import { RobotPanel } from './robot_panel/view'
import { RobotPanelViewModel } from './robot_panel/view_model'
import * as style from './style.css'
import { DashboardController } from './controller'

export type DashboardProps = {
  controller: DashboardController
  Field: ComponentType<{}>
  Menu: ComponentType<{}>
  model: DashboardModel
  network: DashboardNetwork
}

@observer
export class Dashboard extends Component<DashboardProps> {
  public componentWillUnmount(): void {
    this.props.network.destroy()
  }

  public render() {
    const { Field, Menu, model } = this.props
    const showPanels = model.robots.some(robot => robot.enabled)
    return (
      <div className={style.page}>
        <Menu>
          <ul className={style.menu}>
              <li className={style.menuItem}>
                <button className={style.menuButton} onClick={this.onToggleOrientationClick}>Flip Orientation</button>
              </li>
          </ul>
        </Menu>
        <div className={style.dashboard}>
          <div className={style.field}>
            <Field/>
          </div>
          {showPanels &&
          <div className={style.panels}>
            {model.robots.map(robot => {
              const model = RobotPanelViewModel.of(robot)
              return (
                robot.enabled &&
                <div className={style.panel} key={robot.name}>
                  <RobotPanel
                    connected={model.connected}
                    batteryValue={model.batteryValue}
                    behaviour={model.behaviour}
                    lastCameraImage={model.lastCameraImage}
                    lastSeenBall={model.lastSeenBall}
                    lastSeenGoal={model.lastSeenGoal}
                    mode={model.mode}
                    penalised={model.penalised}
                    penalty={model.penalty}
                    phase={model.phase}
                    title={model.title}
                    walkCommand={model.walkCommand}
                  />
                </div>
              )
            })}
          </div>
          }
        </div>
      </div>
    )
  }

  private onToggleOrientationClick = () => {
    const { controller, model } = this.props
    controller.toggleOrientation(model)
  }
}
