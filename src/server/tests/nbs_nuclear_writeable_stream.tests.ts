import * as fs from 'fs'
import * as stream from 'stream'
import { Stream } from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../nuclearnet/fake_nuclearnet_server'
import { NbsFrameTransformStream } from '../nusight_server'
import { NbsFrameDecoderStream } from '../nusight_server'
import { NbsNUClearPlayback } from '../nusight_server'
import { NodeSystemClock } from '../time/node_clock'
import WritableStream = NodeJS.WritableStream

describe('NbsFrameTransformStream', () => {
  let transform: stream.Transform

  beforeEach(() => {
    transform = new NbsFrameTransformStream()
  })

  it('Emits 6988 frames', done => {
    const file = fs.createReadStream('/Users/brendan/Lab/NUsight2/recordings/darwin3_WalkAround.nbs')
    const spy = jest.fn()
    file.pipe(transform).on('data', spy).on('finish', () => {
      expect(spy).toHaveBeenCalledTimes(6988)
      done()
    })
  })
})

// describe('NbsNUClearWritableStream', () => {
//   let transform: stream.Transform
//   let writeStream: WritableStream
//   let nuclearnetClient: FakeNUClearNetClient
//
//   beforeEach(() => {
//     const nuclearnetServer = new FakeNUClearNetServer()
//     nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
//     transform = new NbsFrameTransformStream()
//     writeStream = new NbsNUClearWritableStream(nuclearnetClient)
//   })
//
//   it('asdfas', done => {
//     jest.spyOn(nuclearnetClient, 'send')
//     const file = fs.createReadStream('/Users/brendan/Lab/NUsight2/recordings/darwin3_WalkAround.nbs')
//     file.pipe(transform).pipe(writeStream).on('finish', () => {
//       console.log((nuclearnetClient.send as jest.Mock<any>).mock.calls[0][0].type.toString('hex'))
//       expect(nuclearnetClient.send).toHaveBeenCalledTimes(6988)
//       done()
//     })
//   })
// })

describe('NbsNUClearPlayback', () => {
  let stream: Stream
  let nuclearnetClient: NUClearNetClient

  beforeEach(() => {
    const nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)

    stream = fs.createReadStream('/Users/brendan/Lab/NUsight2/recordings/darwin3_WalkAround.nbs')
      .pipe(new NbsFrameTransformStream())
      .pipe(new NbsFrameDecoderStream)

  })

  it.skip('asdf', done => {
    jest.spyOn(nuclearnetClient, 'send')
    stream
      .pipe(new NbsNUClearPlayback(nuclearnetClient, NodeSystemClock))
      .on('finish', () => {
        done()
      })
  })
})
