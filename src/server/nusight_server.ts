import * as Buffers from 'buffers'
import * as fs from 'fs'
import { WriteStream } from 'fs'
import { ReadStream } from 'fs'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'
import { DirectNUClearNetClient } from './nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from './nuclearnet/fake_nuclearnet_client'
import { WebSocketServer } from './nuclearnet/web_socket_server'
import { WebSocket } from './nuclearnet/web_socket_server'
import { Clock } from './time/clock'
import { NodeSystemClock } from './time/node_clock'
import { Stream } from 'stream'
import WritableStream = NodeJS.WritableStream

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
    const recorder = NbsRecorder.of(peer, this.nuclearnetClient)
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
    const player = NbsPlayback.of(this.nuclearnetClient)
    console.log('playing', filename, requestToken)
    const stopPlaying = player.play(`recordings/${filename}`)
    this.stopRecordingMap.set(requestToken, stopPlaying)
  }

  private onPause = () => {

  }

  private onResume = () => {

  }

  public onStop = (requestToken: string) => {
    const stopRecording = this.stopRecordingMap.get(requestToken)
    if (stopRecording) {
      console.log('stop recording', requestToken)
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
      this.file.end()
    }
  }

  private onPacket = (packet: NUClearNetPacket) => {
    if (!this.arePeersEqual(this.peer, packet.peer)) {
      return
    }

    // NBS File Format:
    // 3 Bytes - NUClear radiation symbol header, useful for synchronisation when attaching to an existing stream.
    // 4 Bytes - The remaining packet length i.e. 16 bytes + N payload bytes
    // 8 Bytes - 64bit timestamp in microseconds. Note: this is not necessarily a unix timestamp.
    // 8 Bytes - 64bit bit hash of the message type.
    // N bytes - The binary packet payload.

    const header = Buffer.from([0xE2, 0x98, 0xA2]) // NUClear radiation symbol.

    // 64bit timestamp in microseconds.
    const time = this.clock.performanceNow() * 1e6
    const timeBuffer = new Buffer(8)
    // Convert double into two 32 bit integers.
    const MAX_UINT32 = 0xFFFFFFFF
    const highByte = ~~(time / MAX_UINT32)
    const lowByte = (time % MAX_UINT32) - highByte
    timeBuffer.writeUInt32LE(lowByte, 0)
    timeBuffer.writeUInt32LE(highByte, 4)

    const remainingByteLength = new Buffer(4)
    remainingByteLength.writeUInt32LE(timeBuffer.byteLength + packet.hash.byteLength + packet.payload.byteLength, 0)

    // Write parts to file
    this.file.write(header)
    this.file.write(remainingByteLength)
    this.file.write(timeBuffer)
    this.file.write(packet.hash)
    this.file.write(packet.payload)
  }

  private arePeersEqual(peerA: NUClearNetPeer, peerB: NUClearNetPeer) {
    return peerA.name === peerB.name && peerA.address === peerB.address && peerA.port === peerB.port
  }
}

const NUCLEAR_HEADER = 3

class NbsPlayback {
  private state: PlaybackState
  private inputStream: stream.Transform
  private outputStream: WritableStream
  private currentIndex: number

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private clock: Clock) {
    this.state = PlaybackState.Idle
    this.currentIndex = 0
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NbsPlayback(nuclearnetClient, NodeSystemClock)
  }

  public play(filename: string): () => void {
    this.state = PlaybackState.Playing

    this.inputStream = fs.createReadStream(filename, { encoding: 'binary' })
      .pipe(NbsFrameTransformStream.of())
      .pipe(NbsFrameDecoderStream.of())
      .on('finish', () => {
        this.state = PlaybackState.Idle
      })

    this.outputStream = this.inputStream.pipe(NbsNUClearPlayback.of(this.nuclearnetClient))

    return () => {
      if (this.state === PlaybackState.Playing) {
        this.state = PlaybackState.Idle
        this.inputStream.end()
      }
    }
  }

  public pause(): () => void {
    this.state = PlaybackState.Paused
    this.inputStream.pause()
    return () => {
      if (this.state === PlaybackState.Paused) {
        this.state = PlaybackState.Playing
        this.inputStream.resume()
      }
    }
  }
}

// type NbsNUClearWritableStreamOpts = {
// }

const NBS_NUCLEAR_HEADER = Buffer.from([0xE2, 0x98, 0xA2]) // NUClear radiation symbol.

export class NbsFrameTransformStream extends stream.Transform {
  private buffers: Buffers
  private foundHeader: boolean
  private foundPacketSize: boolean

  constructor() {
    super({
      objectMode: true,
    })

    this.buffers = new Buffers()
    this.foundHeader = false
    this.foundPacketSize = false
  }

  public static of(): NbsFrameTransformStream {
    return new NbsFrameTransformStream()
  }

  public _transform(chunk: any, encoding: string, done: (err?: any, data?: any) => void) {
    this.buffers.push(chunk)

    let frame
    while ((frame = this.getNextFrame(this.buffers)) !== undefined) {
      this.push(frame.buffer)
      this.buffers.splice(0, frame.offset + frame.buffer.byteLength)
    }

    done()
  }

  private getNextFrame(buffer: Buffers): { offset: number, buffer: Buffer } | undefined {
    const headerIndex = buffer.indexOf(NBS_NUCLEAR_HEADER)
    const headerSize = NBS_NUCLEAR_HEADER.byteLength
    const packetLengthSize = 4
    const headerAndPacketLengthSize = headerSize + packetLengthSize
    if (headerIndex >= 0) {
      const frame = buffer.slice(headerIndex)
      if (frame.length >= headerAndPacketLengthSize) {
        const packetSize = frame.slice(headerSize, headerSize + headerAndPacketLengthSize).readUInt32LE(0)
        if (frame.length >= headerAndPacketLengthSize + packetSize) {
          return {
            offset: headerIndex,
            buffer: frame.slice(0, headerAndPacketLengthSize + packetSize),
          }
        }
      }
    }
    return undefined
  }
}

export class NbsFrameDecoderStream extends stream.Transform {
  public constructor() {
    super({
      objectMode: true,
    })
  }

  public static of() {
    return new NbsFrameDecoderStream()
  }

  public _transform(buffer: Buffer, encoding: string, done: Function) {
    this.push({
      header: buffer.slice(0, 3),
      size: buffer.slice(3, 7), // TODO: decode
      timestamp: buffer.slice(7, 15), // TODO: decode
      hash: buffer.slice(15, 23),
      payload: buffer.slice(23),
    })
    done()
  }
}

type NbsFrame = {
  header: Buffer
  size: number
  timestamp: number,
  hash: Buffer,
  payload: Buffer,
}

export class NbsNUClearPlayback extends stream.Writable {
  private firstFrameTimestamp?: number
  private firstLocalTimestamp?: number

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private clock: Clock) {
    super({
      objectMode: true,
    })
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NbsNUClearPlayback(nuclearnetClient, NodeSystemClock)
  }

  public _write(frame: NbsFrame, encoding: string, done: Function) {
    if (this.firstFrameTimestamp === undefined || this.firstLocalTimestamp === undefined) {
      this.firstFrameTimestamp = frame.timestamp
      this.firstLocalTimestamp = this.clock.performanceNow()
    }
    const now = this.clock.performanceNow()
    const timeOffset = frame.timestamp - this.firstFrameTimestamp
    const timeout = this.firstLocalTimestamp + timeOffset - now
    this.clock.setTimeout(() => {
      this.nuclearnetClient.send({
        type: frame.hash,
        payload: frame.payload,
      })
      done()
    }, timeout)
  }
}

// export class NbsNUClearWritableStream extends stream.Writable {
//   private buffers: Buffers
//   private buffering: boolean
//   private payloadLength: number
//   private headerIndex: number
//
//   public constructor(private nuclearnetClient: NUClearNetClient/*, opts: NbsNUClearWritableStreamOpts*/) {
//     super()
//
//     this.buffers = new Buffers()
//     this.buffering = false
//     this.headerIndex = 0
//   }
//
//   public static of(opts: { fakeNetworking: boolean }) {
//     const network = opts.fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
//     return new NbsNUClearWritableStream(network)
//   }
//
//   public _write(chunk: Buffer, encoding: string, cb: Function) {
//     this.buffers.push(chunk)
//
//     if (!this.buffering) {
//       const headerIndex = chunk.indexOf(NBS_NUCLEAR_HEADER)
//       if (headerIndex >= 0) {
//         console.log(`Found header at ${headerIndex}`)
//         this.headerIndex = headerIndex
//         this.buffering = true
//       }
//     } else {
//       console.log(this.buffers.buffers.length)
//
//       const offset = this.headerIndex
//       if (this.buffers.length >= offset + 7) {
//         const remainingByteLength = this.buffers.slice(offset + 3, offset + 3 + 4).readUInt32LE(0)
//         this.payloadLength = remainingByteLength
//         if (this.buffers.length >= offset + 7 + remainingByteLength) {
//           const hash = this.buffers.slice(offset + 15, offset + 15 + 8)
//           const payload = this.buffers.slice(offset + 23, offset + 23 + remainingByteLength - 16)
//           this.nuclearnetClient.send({
//             type: hash,
//             payload,
//           })
//           this.buffering = false
//           const end = offset + 7 + remainingByteLength
//           this.buffers.splice(0, end)
//         }
//       }
//     }
//     cb()
//   }
//
//   decode(buffer: Buffer): { type: Buffer, payload: Buffer } {
//     return {
//       type: new Buffer(8),
//       payload: new Buffer(8),
//     }
//   }
// }

enum PlaybackState {
  Idle = 1,
  Paused,
  Playing,
}
