import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'
import { NbsPlaybackController } from './nbs/nbs_playback_controller'
import { NbsRecorderController } from './nbs/nbs_recorder_controller'
import { WebSocketServer } from './nuclearnet/web_socket_server'
import { WebSocket } from './nuclearnet/web_socket_server'
import { Clock } from './time/clock'
import { NodeSystemClock } from './time/node_clock'

export class NUsightServer {
  public constructor(private server: WebSocketServer, private nuclearnetClient: NUClearNetClient) {
    server.onConnection(this.onClientConnection)
  }

  public static of(server: WebSocketServer, nuclearnetClient: NUClearNetClient): NUsightServer {
    return new NUsightServer(server, nuclearnetClient)
  }

  private onClientConnection = (socket: WebSocket) => {
    NUsightServerClient.of(socket, this.nuclearnetClient)
  }
}

class NUsightServerClient {
  private stopRecordingMap: Map<string, () => void>

  public constructor(private socket: WebSocket, private clock: Clock, private nuclearnetClient: NUClearNetClient) {
    this.stopRecordingMap = new Map()

    this.socket.on('record', this.onRecord)
    this.socket.on('unrecord', this.onUnrecord)

    this.socket.on('play', this.onPlay)
    this.socket.on('pause', this.onPause)
    this.socket.on('resume', this.onResume)
    this.socket.on('stop', this.onStop)
  }

  public static of(socket: WebSocket, nuclearnetClient: NUClearNetClient): NUsightServerClient {
    return new NUsightServerClient(socket, NodeSystemClock, nuclearnetClient)
  }

  private onRecord = (peer: NUClearNetPeer, requestToken: string) => {
    const recorder = NbsRecorderController.of(peer, this.nuclearnetClient)
    const filename = `${peer.name.replace(/[^A-Za-z0-9]/g, '_')}_${this.clock.now()}.nbs`
    console.log('recording', peer, requestToken)
    const stopRecording = recorder.record(`recordings/${filename}`)
    this.stopRecordingMap.set(requestToken, stopRecording)
  }

  private onUnrecord = (requestToken: string) => {
    const stopRecording = this.stopRecordingMap.get(requestToken)
    if (stopRecording) {
      console.log('stop recording', requestToken)
      stopRecording()
    }
  }

  private onPlay = (filename: string, requestToken: string) => {
    const player = NbsPlaybackController.of(this.nuclearnetClient)
    console.log('playing', filename, requestToken)
    const stopPlaying = player.play(`recordings/${filename}`)
    this.stopRecordingMap.set(requestToken, stopPlaying)
  }

  private onPause = () => {

  }

  private onResume = () => {

  }

  private onStop = (requestToken: string) => {
    const stopRecording = this.stopRecordingMap.get(requestToken)
    if (stopRecording) {
      console.log('stop recording', requestToken)
      stopRecording()
    }
  }
}
