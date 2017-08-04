import * as dateformat from 'dateformat'
import * as mkdirp from 'mkdirp-promise'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import * as path from 'path'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../../shared/time/clock'
import { NbsRecorderController } from '../nbs/nbs_recorder_controller'
import { DirectNUClearNetClient } from '../nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { NodeSystemClock } from '../time/node_clock'

export class RecordingController {
  private peerStopRecording: Map<NUClearNetPeer, () => void>

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private clock: Clock,
                     private recordingDirectory: string) {
    this.peerStopRecording = new Map()

    this.nuclearnetClient.onJoin(this.onJoin)
    this.nuclearnetClient.onLeave(this.onLeave)
  }

  public static of({ fakeNetworking }: { fakeNetworking: boolean }) {
    const nuclearnetClient: NUClearNetClient = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    // TODO (Annable): clean up.
    const recordingDirectory = `recordings/${dateformat(NodeSystemClock.date(), 'yyyy-mm-dd-HHMMss')}`
    return new RecordingController(nuclearnetClient, NodeSystemClock, recordingDirectory)
  }

  public connect(options: NUClearNetOptions) {
    this.nuclearnetClient.connect(options)
  }

  private onJoin = (peer: NUClearNetPeer) => {
    if (peer.name === 'nusight') {
      return
    }

    // TODO (Annable): Clean this up.
    const peerRecorder = NbsRecorderController.of(peer, this.nuclearnetClient)
    mkdirp(this.recordingDirectory).then(() => {
      const timestamp = dateformat(this.clock.date(), 'yyyy-mm-dd-HHMMss')
      const filename = `${timestamp}-${peer.name}-${peer.address}-${peer.port}`.replace(/[^a-zA-Z0-9\-_]+/g, '_')
      const filepath = path.join(this.recordingDirectory, `${filename}.nbz`)
      console.log(`recording to ${filepath}`)
      this.peerStopRecording.set(peer, peerRecorder.record(filepath))
    })
  }

  private onLeave = (peer: NUClearNetPeer) => {
    if (peer.name === 'nusight') {
      return
    }

    const peerKey = Array.from(this.peerStopRecording.keys()).find(otherPeer => this.arePeersEqual(otherPeer, peer))

    if (peerKey) {
      const peerStopRecording = this.peerStopRecording.get(peerKey)
      if (peerStopRecording) {
        peerStopRecording()
      }
    }
  }

  private arePeersEqual(peerA: NUClearNetPeer, peerB: NUClearNetPeer) {
    return peerA.name === peerB.name && peerA.address === peerB.address && peerA.port === peerB.port
  }
}
