import { Container } from 'inversify'
import getDecorators from 'inversify-inject-decorators'
import { AppModel } from './client/components/app/model'
import { LocalisationController } from './client/components/localisation/controller'
import { LocalisationModel } from './client/components/localisation/model'

export const container = new Container()

container.bind(AppModel).toConstantValue(AppModel.of())

container.bind(LocalisationController).to(LocalisationController).inSingletonScope()
container.bind(LocalisationModel).toConstantValue(LocalisationModel.of())

export const inject = getDecorators(container).lazyInject
