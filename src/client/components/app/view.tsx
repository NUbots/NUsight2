import * as React from 'react'
import { NavigationView } from '../navigation/view'
import * as style from './style.css'
import { NavigationBuilder } from '../../navigation'
import { Component } from 'react'

export class AppView extends Component<{ nav: NavigationBuilder }> {
  public render() {
    const { nav, children } = this.props
    return (
      <div className={style.app}>
        <NavigationView nav={nav}/>
        <div className={style.app__container}>
          <div className={style.app__content}>
            {children}
          </div>
        </div>
      </div>
    )
  }
}
