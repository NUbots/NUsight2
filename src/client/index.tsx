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
import { Classifier } from './components/classifier/view'
import { ConfigurationController } from './components/configuration/controller'
import { ConfigurationModel } from './components/configuration/model'
import { configurationData } from './components/configuration/data'
import { ConfigurationView } from './components/configuration/view'
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

const appController = AppController.of()
AppNetwork.of(nusightNetwork, appModel)
const menu = withRobotSelectorMenuBar(appModel.robots, appController.toggleRobotEnabled)

ReactDOM.render(
  <BrowserRouter>
    <AppView>
      <Switch>
        <Route exact path='/' component={Dashboard}/>
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
        <Route path='/classifier' component={Classifier}/>
        <Route path='/subsumption' component={Subsumption}/>
        <Route path='/gamestate' component={GameState}/>
        <Route path='/configuration' render={() => {
          // TODO (Paye): Use the network/simulator for the model data
          const configurationModel = ConfigurationModel.of({ files: configurationData })
          const configurationController = ConfigurationController.of({ model: configurationModel })
          return <ConfigurationView controller={configurationController} model={configurationModel} />
        }}/>
      </Switch>
    </AppView>
  </BrowserRouter>,
  document.getElementById('root'),
)

