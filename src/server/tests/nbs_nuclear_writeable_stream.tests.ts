import * as fs from 'fs'
import * as stream from 'stream'
import { Stream } from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { NbsFrameChunker } from '../nbs/nbs_frame_chunker'
import { NbsFrameDecoder } from '../nbs/nbs_frame_streams'
import { NbsNUClearPlayback } from '../nbs/nbs_nuclear_playback'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../nuclearnet/fake_nuclearnet_server'
import { FakeNodeClock } from '../time/fake_node_clock'
import { FakeNbsStream } from './fake_nbs_binary_stream'

describe('NbsFrameChunker', () => {
  let transform: stream.Transform

  beforeEach(() => {
    transform = new NbsFrameChunker()
  })

  it.skip('finds 6988 frames within binary stream', done => {
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
      .pipe(new NbsFrameChunker())
      .pipe(new NbsFrameDecoder())

  })

  it.skip('sends 6988 messages to NUClearNet', done => {
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

  it('sends all generated messages to NUClearNet', done => {
    const fakeClock = FakeNodeClock.of()
    jest.spyOn(nuclearnetClient, 'send')
    const stream = new FakeNbsStream()
    stream
      .pipe(new NbsFrameChunker())
      .pipe(new NbsFrameDecoder())
      .on('data', () => {
        // Ensure that all timers instantly run after each chunk is received.
        // Run on the next tick to allow NbsNUClearPlayback to schedule the timers first.
        process.nextTick(() => fakeClock.runAllTimers())
      })
      .pipe(new NbsNUClearPlayback(nuclearnetClient, fakeClock))
      .on('finish', () => {
        expect(nuclearnetClient.send).toHaveBeenCalledTimes(1000)
        done()
      })
    stream.generate(1000)
  })

  it('can handle garbage', done => {
    const fakeClock = FakeNodeClock.of()
    jest.spyOn(nuclearnetClient, 'send')
    const stream = new FakeNbsStream()
    stream
      .pipe(new NbsFrameChunker())
      .pipe(new NbsFrameDecoder())
      .on('data', () => {
        // Ensure that all timers instantly run after each chunk is received.
        // Run on the next tick to allow NbsNUClearPlayback to schedule the timers first.
        process.nextTick(() => fakeClock.runAllTimers())
      })
      .pipe(new NbsNUClearPlayback(nuclearnetClient, fakeClock))
      .on('finish', () => {
        expect(nuclearnetClient.send).toHaveBeenCalledTimes(1000)
        done()
      })
    stream.generatewithGarbage(1000)
  })
})
