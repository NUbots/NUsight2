import { useStrict } from 'mobx'
import { runInAction } from 'mobx'
import { Provider } from 'mobx-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { browserHistory, IndexRoute, Route, Router } from 'react-router'
import * as io from 'socket.io-client'
import { AppView } from './components/app/view'
import { ChartModel } from './components/chart/model'
import { ChartDataModel } from './components/chart/model'
import { ChartView } from './components/chart/view'
import { Classifier } from './components/classifier/view'
import { Dashboard } from './components/dashboard/view'
import { GameState } from './components/game_state/view'
import { RobotModel } from './components/localisation/darwin_robot/model'
import { LocalisationModel } from './components/localisation/model'
import { LocalisationPresenter } from './components/localisation/presenter'
import { LocalisationView } from './components/localisation/view'
import { NUClear } from './components/nuclear/view'
import { Scatter } from './components/scatter_plot/view'
import { Subsumption } from './components/subsumption/view'
import { Vision } from './components/vision/view'
import { ChartTreeModel } from './components/chart/model'

// enable MobX strict mode
useStrict(true)

const stores = {
  localisationStore: LocalisationModel.of(),
  chartStore: ChartModel.of(),
}

const a = ChartTreeModel.of('darwin1')
stores.chartStore.tree.push(a)

const b = ChartTreeModel.of('sensors')
const c = ChartTreeModel.of('battery')
c.children.push(ChartDataModel.of())
const d = ChartTreeModel.of('position')
d.children.push(ChartDataModel.of())
d.children.push(ChartDataModel.of())
d.children.push(ChartDataModel.of())

a.children.push(b)
b.children.push(c)
b.children.push(d)

stores.chartStore.tree.push()

runInAction(() => {
  stores.localisationStore.camera.position.set(0, 0.2, 0.5)

  const colors = [null, 'magenta', null, 'blue', null, 'cyan', null, 'red']
  const numRobots = 8
  new Array(numRobots).fill(0).map((_, id) => {
    const robot = RobotModel.of({ id, name: `Robot ${id + 1}`, color: colors[id], heading: 0 })
    stores.localisationStore.robots.push(robot)
    return robot
  })
})

requestAnimationFrame(function update() {
  requestAnimationFrame(update)
  runInAction(() => {
    const numRobots = stores.localisationStore.robots.length;
    stores.localisationStore.robots.forEach((robot, i) => {

      const angle = i * (2 * Math.PI) / numRobots + Date.now() / 4E3
      const distance = Math.cos(Date.now() / 1E3 + 4 * i) * 0.3 + 1
      robot.position.x = distance * Math.cos(angle)
      robot.position.z = distance * Math.sin(angle)
      robot.heading = -angle - Math.PI / 2

      const motorAngle = Math.cos(Date.now() / 1E3 + i) / 2 + 0.5
      robot.motors.rightShoulderPitch.angle = motorAngle
      robot.motors.leftShoulderPitch.angle = motorAngle
      robot.motors.rightShoulderRoll.angle = motorAngle
      robot.motors.leftShoulderRoll.angle = motorAngle
      robot.motors.rightElbow.angle = motorAngle
      robot.motors.leftElbow.angle = motorAngle
      robot.motors.rightHipYaw.angle = motorAngle
      robot.motors.leftHipYaw.angle = motorAngle
      robot.motors.rightHipRoll.angle = motorAngle
      robot.motors.leftHipRoll.angle = motorAngle
      robot.motors.rightHipPitch.angle = motorAngle
      robot.motors.leftHipPitch.angle = motorAngle
      robot.motors.rightKnee.angle = motorAngle
      robot.motors.leftKnee.angle = motorAngle
      robot.motors.rightAnklePitch.angle = motorAngle
      robot.motors.leftAnklePitch.angle = motorAngle
      robot.motors.rightAnkleRoll.angle = motorAngle
      robot.motors.leftAnkleRoll.angle = motorAngle
      // robot.motors.headPan.angle = angle
      // robot.motors.headTilt.angle = angle
    })
  })
})

io.connect(document.location.origin)

// render react DOM
ReactDOM.render(
    <Provider {...stores} >
      <Router history={browserHistory}>
        <Route path='/' component={AppView}>
          <IndexRoute component={Dashboard}/>
          <Route path='/localisation' component={() => {
            const presenter = LocalisationPresenter.of({
              model: stores.localisationStore,
            })
            return <LocalisationView presenter={presenter} localisationStore={stores.localisationStore}/>
          }}/>
          <Route path='/vision' component={Vision}/>
          <Route path='/chart' component={() => {
            return <ChartView chartStore={stores.chartStore} />
          }}/>
          <Route path='/scatter' component={Scatter}/>
          <Route path='/nuclear' component={NUClear}/>
          <Route path='/classifier' component={Classifier}/>
          <Route path='/subsumption' component={Subsumption}/>
          <Route path='/gamestate' component={GameState}/>
        </Route>
      </Router>
    </Provider >,
    document.getElementById('root'),
)
