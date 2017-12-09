import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'

export class ClassifierController {
  constructor(private network: ClassifierNetwork) {
  }

  public static of(network: ClassifierNetwork) {
    return new ClassifierController(network)
  }

  public destroy = () => {
    this.network.destroy()
  }
}
