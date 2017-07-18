import * as fs from 'fs'
import * as stream from 'stream'
import { Stream } from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../nuclearnet/fake_nuclearnet_server'
import { NbsFrameTransformStream } from '../nusight_server'
import { NbsFrameDecoderStream } from '../nusight_server'
import { NbsNUClearPlayback } from '../nusight_server'
import WritableStream = NodeJS.WritableStream
import { FakeNodeClock } from '../time/fake_node_clock'
import { message } from '../../shared/proto/messages'
import nuclear = message.support.nuclear

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

  it('asdf', done => {
    const fakeClock = FakeNodeClock.of()
    jest.spyOn(nuclearnetClient, 'send')
    stream
      .on('data', () => {
        // Ensure that all timers instantly run after each chunk is received.
        // Run on the next tick to allow NbsNUClearPlayback to schedule the timers first.
        process.nextTick(() => fakeClock.runAllTimers())
      })
      .pipe(new NbsNUClearPlayback(nuclearnetClient, fakeClock))
      .on('finish', () => {
        expect(nuclearnetClient.send).toHaveBeenCalledTimes(6988)
        done()
      })
  })
})
