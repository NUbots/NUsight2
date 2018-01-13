import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'

export class NUClearNetStream extends stream.Duplex {
  constructor(private nuclearnetClient: NUClearNetClient) {
    super({
      objectMode: true,
    })
    nuclearnetClient.onPacket(this.onPacket);
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NUClearNetStream(nuclearnetClient)
  }

  onPacket = (packet: NUClearNetPacket) => {
    this.push({ event: 'packet', packet });
  }

  _read() {
    // TODO
  }

  // TODO: end when client disconnects?
  end() {
    this.push(null);
  }
}
