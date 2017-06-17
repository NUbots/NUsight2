import { Container } from 'inversify'
import { LocalisationController } from './components/localisation/controller'
import { LocalisationModel } from './components/localisation/model'
import { LocalisationNetwork } from './components/localisation/network'
import { GlobalNetwork } from './network/global_network'
import { Network } from './network/network'

export const container = new Container()

container.bind(GlobalNetwork).toConstantValue(GlobalNetwork.of())
container.bind(Network).to(Network).inTransientScope()
container.bind(LocalisationNetwork).to(LocalisationNetwork).inTransientScope()
container.bind(LocalisationController).to(LocalisationController).inSingletonScope()
container.bind(LocalisationModel).toConstantValue(LocalisationModel.of())
