import * as fs from 'fs'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'
import { WebSocketServer } from './nuclearnet/web_socket_server'
import { WebSocket } from './nuclearnet/web_socket_server'
import { WriteStream } from 'fs'
import { NodeSystemClock } from './time/node_clock'
import { Clock } from './time/clock'

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
    this.socket.on('record', this.onRecord)
    this.socket.on('unrecord', this.onUnrecord)
  }

  public static of(socket: WebSocket, nuclearnetClient: NUClearNetClient): NUsightServerClient {
    return new NUsightServerClient(socket, NodeSystemClock, nuclearnetClient)
  }

  public onRecord(peer: NUClearNetPeer, requestToken: string) {
    const recorder = NbsRecorder.of(peer, this.nuclearnetClient)
    const stopRecording = recorder.record(`recordings/${this.clock.now()}.tbs`)
    this.stopRecordingMap.set(requestToken, stopRecording)
  }

  public onUnrecord(requestToken: string) {
    const stopRecording = this.stopRecordingMap.get(requestToken)
    if (stopRecording) {
      stopRecording()
    }
  }
}

class NbsRecorder {
  private recording: boolean
  private file: WriteStream

  public constructor(private peer: NUClearNetPeer,
                     private clock: Clock,
                     private nuclearnetClient: NUClearNetClient) {
    this.recording = false
  }

  public static of(peer: NUClearNetPeer, nuclearnetClient: NUClearNetClient): NbsRecorder {
    return new NbsRecorder(peer, NodeSystemClock, nuclearnetClient)
  }

  public record(filename: string): () => void {
    this.file = fs.createWriteStream(filename, { defaultEncoding: 'binary' })
    const stopListening = this.nuclearnetClient.onPacket(this.onPacket)
    this.recording = true
    return () => {
      stopListening()
      this.recording = false
    }
  }

  private onPacket = (packet: NUClearNetPacket) => {
    if (!this.arePeersEqual(this.peer, packet.peer)) {
      return
    }

    // NBS File Format:
    // 3 Bytes - NUClear radiation symbol header, useful for synchronisation when attaching to a existing stream.
    // 4 Bytes - The remaining packet length i.e. 16 bytes + N payload bytes
    // 8 Bytes - 64bit timestamp in microseconds. Note: this is not necessarily a unix timestamp.
    // 8 Bytes - 64bit bit hash of the message type.
    // N bytes - The binary packet data itself.

    const header = Buffer.from([0xE2, 0x98, 0xA2]) // NUClear radiation symbol.

    // 64bit timestamp in microseconds.
    const time = this.clock.now() * 1000;
    const timeBuffer = new Buffer(8);
    const MAX_UINT32 = 0xFFFFFFFF;
    const highByte = ~~(time / MAX_UINT32);
    const lowByte = (time % MAX_UINT32) - highByte;
    timeBuffer.writeUInt32BE(highByte, 0);
    timeBuffer.writeUInt32BE(lowByte, 4);

    const remainingByteLength = new Buffer(4);
    remainingByteLength.writeUInt32LE(timeBuffer.byteLength + packet.hash.byteLength + packet.payload.byteLength, 0)

    // Write parts to file
    this.file.write(header)
    this.file.write(remainingByteLength);
    this.file.write(timeBuffer);
    this.file.write(packet.hash);

  }

  private arePeersEqual(peerA: NUClearNetPeer, peerB: NUClearNetPeer) {
    return peerA.name === peerB.name && peerA.address === peerB.address && peerA.port === peerB.port
  }
}
