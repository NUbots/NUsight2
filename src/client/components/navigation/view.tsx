import * as React from 'react'
import { NavLink } from 'react-router-dom'
import ChartIcon from './icons/chart.svg'
import ControllerIcon from './icons/controller.svg'
import EyeIcon from './icons/eye.svg'
import MapIcon from './icons/map.svg'
import NUClearIcon from './icons/nuclear.svg'
import OrderingIcon from './icons/ordering.svg'
import ScatterIcon from './icons/scatter.svg'
import SpeedometerIcon from './icons/speedometer.svg'
import * as style from './style.css'
import { NavigationBuilder } from '../../navigation'

interface NavigationItemViewProps {
  exact?: boolean
  url: string
  Icon: any
  children?: any
}

const NavigationItemView = ({ exact = false, url, Icon, children = undefined }: NavigationItemViewProps) => (
  <li className={style.header__item}>
    <NavLink exact={exact} className={style.header__link} to={url} activeClassName={style['header__link--active']}>
      <Icon className={style.header__icon}/>
      <span>{children}</span>
    </NavLink>
  </li>
)

export const NavigationView = ({ nav }: { nav: NavigationBuilder}) => (
  <header className={style.header}>
    <h1 className={style.header__title}>NUsight</h1>
    <ul className={style.header__list}>
      <NavigationItemView exact url='/' Icon={SpeedometerIcon}>Dashboard</NavigationItemView>
      <NavigationItemView url='/localisation' Icon={MapIcon}>Localisation</NavigationItemView>
      <NavigationItemView url='/vision' Icon={EyeIcon}>Vision</NavigationItemView>
      <NavigationItemView url='/chart' Icon={ChartIcon}>Chart</NavigationItemView>
      <NavigationItemView url='/scatter' Icon={ScatterIcon}>Scatter</NavigationItemView>
      <NavigationItemView url='/nuclear' Icon={NUClearIcon}>NUClear</NavigationItemView>
      <NavigationItemView url='/subsumption' Icon={OrderingIcon}>Subsumption</NavigationItemView>
      <NavigationItemView url='/gamestate' Icon={ControllerIcon}>GameState</NavigationItemView>
      {...nav.configs.map(c => <NavigationItemView url={c.route} Icon={c.tab.icon}>{c.tab.text}</NavigationItemView>)}
    </ul>
  </header>
)
