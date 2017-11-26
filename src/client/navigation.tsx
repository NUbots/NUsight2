import { ComponentType } from 'react'
import * as React from 'react'
import { Route } from 'react-router'

type Config = {
  exact?: boolean
  route: string
  tab: { icon: any, text: string }
  Content: ComponentType,
}

export class NavigationBuilder {
  configs: Config[] = []

  static of() {
    return new NavigationBuilder()
  }

  add(config: Config) {
    this.configs.push(config)
  }

  routes() {
    return this.configs.map(c => (
      <Route exact={c.exact} path={c.route} render={() => <c.Content/>}/>
    ))
  }
}
