import { Container } from 'inversify'
import getDecorators from 'inversify-inject-decorators'
import { LocalisationPresenter } from './client/components/localisation/presenter'

export const container = new Container()

container.bind(LocalisationPresenter).to(LocalisationPresenter).inSingletonScope()

export const inject = getDecorators(container).lazyInject
