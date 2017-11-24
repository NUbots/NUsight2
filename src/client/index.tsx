import { useStrict } from 'mobx'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Switch } from 'react-router-dom'
import { AppController } from './components/app/controller'
import { AppModel } from './components/app/model'
import { AppNetwork } from './components/app/network'
import { AppView } from './components/app/view'
import { Chart } from './components/chart/view'
import { ClassifierModel } from './components/classifier/model'
import { ClassifierNetwork } from './components/classifier/network'
import { ClassifierView } from './components/classifier/view'
import { DashboardController } from './components/dashboard/controller'
import { FieldController } from './components/dashboard/field/controller'
import { Field } from './components/dashboard/field/view'
import { DashboardModel } from './components/dashboard/model'
import { DashboardNetwork } from './components/dashboard/network'
import { Dashboard } from './components/dashboard/view'
import { GameState } from './components/game_state/view'
import { LocalisationController } from './components/localisation/controller'
import { LocalisationModel } from './components/localisation/model'
import { LocalisationNetwork } from './components/localisation/network'
import { LocalisationView } from './components/localisation/view'
import { withRobotSelectorMenuBar } from './components/menu_bar/view'
import { NUClear } from './components/nuclear/view'
import { Scatter } from './components/scatter_plot/view'
import { Subsumption } from './components/subsumption/view'
import { Vision } from './components/vision/view'
import { NUsightNetwork } from './network/nusight_network'

// enable MobX strict mode
useStrict(true)

const appModel = AppModel.of()
const nusightNetwork = NUsightNetwork.of(appModel)
nusightNetwork.connect({ name: 'nusight' })

const localisationModel = LocalisationModel.of(appModel)
const dashboardModel = DashboardModel.of(appModel.robots)
const classifierModel = ClassifierModel.of(appModel)

const appController = AppController.of()
AppNetwork.of(nusightNetwork, appModel)
const menu = withRobotSelectorMenuBar(appModel.robots, appController.toggleRobotEnabled)

ReactDOM.render(
  <BrowserRouter>
    <AppView>
      <Switch>
        <Route exact path='/' render={() => {
          const model = dashboardModel
          const field = () => <Field controller={FieldController.of()} model={model.field}/>
          const network = DashboardNetwork.of(nusightNetwork)
          const controller = DashboardController.of()
          return <Dashboard controller={controller} Field={field} menu={menu} model={model} network={network}/>
        }}/>
        <Route path='/localisation' render={() => {
          const model = localisationModel
          const controller = LocalisationController.of()
          const network = LocalisationNetwork.of(nusightNetwork, model)
          return <LocalisationView controller={controller} menu={menu} model={model} network={network}/>
        }}/>
        <Route path='/vision' component={Vision}/>
        <Route path='/chart' component={Chart}/>
        <Route path='/scatter' component={Scatter}/>
        <Route path='/nuclear' component={NUClear}/>
        <Route path='/classifier' render={() => {
          const model = classifierModel
          const network = ClassifierNetwork.of(nusightNetwork, model)
          return <ClassifierView model={model} network={network}/>
        }}/>
        <Route path='/subsumption' component={Subsumption}/>
        <Route path='/gamestate' component={GameState}/>
      </Switch>
    </AppView>
  </BrowserRouter>,
  document.getElementById('root'),
)

