import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'

export class ScriptTunerNetwork {
  constructor(private network: Network) {
  }

  static of(nusightNetwork: NUsightNetwork): ScriptTunerNetwork {
    const network = Network.of(nusightNetwork)
    return new ScriptTunerNetwork(network)
  }

  destroy() {
    this.network.off()
  }
}
