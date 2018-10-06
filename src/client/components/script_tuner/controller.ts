import { action } from 'mobx'

import { ScriptTunerNetwork } from './network'

export class ScriptTunerController {

  constructor(private network: ScriptTunerNetwork) {
    // TODO need to add an autorunner that if we are connected to the robot we need to send it update packets
  }

  static of(network: ScriptTunerNetwork) {
    return new ScriptTunerController(network)
  }
}
