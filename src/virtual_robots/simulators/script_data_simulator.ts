import { IComputedValue } from 'mobx'

import { Simulator } from '../simulator'
import { Message } from '../simulator'

export class ScriptDataSimulator implements Simulator {

  constructor() {
  }

  static of() {
    return new ScriptDataSimulator()
  }

  packets(): Array<IComputedValue<Message>> {
    return []
  }
}
