import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'

export class ClassifierController {
  constructor(private network: ClassifierNetwork) {
  }

  static of(network: ClassifierNetwork) {
    return new ClassifierController(network)
  }

  destroy = () => {
    this.network.destroy()
  }
}
