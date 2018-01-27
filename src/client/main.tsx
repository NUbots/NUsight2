import { useStrict } from 'mobx'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Switch } from 'react-router-dom'

import * as components from '../../components.json'

import { AppController } from './components/app/controller'
import { AppModel } from './components/app/model'
import { AppNetwork } from './components/app/network'
import { AppView } from './components/app/view'
import { withRobotSelectorMenuBar } from './components/menu_bar/view'
import { NavigationConfiguration } from './navigation'
import { NUsightNetwork } from './network/nusight_network'

// enable MobX strict mode
useStrict(true)

const appModel = AppModel.of()
const nusightNetwork = NUsightNetwork.of(appModel)
nusightNetwork.connect({ name: 'nusight' })

const appController = AppController.of()
AppNetwork.of(nusightNetwork, appModel)
const menu = withRobotSelectorMenuBar(appModel.robots, appController.toggleRobotEnabled)

const nav = NavigationConfiguration.of()

async function installComponents(components: any) {

  const defaultDependencies = { nav, appModel, nusightNetwork, menu }
  const extraDependencies: any = { }

  // dynamically load our components based on the components.json file
  for (const component of components.modules) {
    if (component.enable) {
      const module = await import('./components/' + component.name + '/install')

      const custom: any = {}

      if (component.dependencies != null || component.dependencies.length > 0) {
        for (const dependency of component.dependencies) {
          custom[dependency] = extraDependencies[dependency]
        }
      }

      module.install({ ...defaultDependencies, ...custom })
    }
  }

  ReactDOM.render(
    <BrowserRouter>
      <AppView nav={nav}>
        <Switch>
          {...nav.getRoutes().map(config => (
            <Route key={config.path} exact={config.exact} path={config.path} render={() => <config.Content/>}/>
          ))}
        </Switch>
      </AppView>
    </BrowserRouter>,
    document.getElementById('root'),
  )
}

installComponents(components)
