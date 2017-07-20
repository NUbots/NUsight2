import { NbsFrameChunker } from '../nbs_frame_chunker'
import { FakeNbsStream } from './fake_nbs_binary_stream'
import { encodeFrame } from '../nbs_frame_codecs'
import { hashType } from '../../nuclearnet/fake_nuclearnet_server'
import { SeededRandom } from '../../../shared/base/random/seeded_random'

describe('NbsFrameChunker', () => {
  let stream: FakeNbsStream
  let chunker: NbsFrameChunker
  let random: SeededRandom

  beforeEach(() => {
    stream = FakeNbsStream.of()
    chunker = NbsFrameChunker.of()
    random = SeededRandom.of('NbsFrameChunker')
  })

  function fakeFrameBuffer(timestampInMicroseconds: number) {
    return encodeFrame({
      timestampInMicroseconds,
      hash: hashType('fake'),
      payload: new Buffer(8).fill(randomByte()),
    })
  }

  function randomByte() {
    return random.integer(0, 255)
  }

  it('finds the expected frames in a contiguous stream', done => {
    const spy = jest.fn()
    const buffer1 = fakeFrameBuffer(0)
    const buffer2 = fakeFrameBuffer(1)
    const buffer3 = fakeFrameBuffer(3)

    stream.pipe(chunker).on('data', spy).on('finish', () => {
      expect(spy).toHaveBeenCalledWith(buffer1)
      expect(spy).toHaveBeenCalledWith(buffer2)
      expect(spy).toHaveBeenCalledWith(buffer3)
      done()
    })

    stream.write(buffer1)
    stream.write(buffer2)
    stream.write(buffer3)
    stream.end()
  })

  it('synchronises and finds the expected frames with random leading bytes', done => {
    const spy = jest.fn()
    const buffer1 = fakeFrameBuffer(0)
    const buffer2 = fakeFrameBuffer(1)
    const buffer3 = fakeFrameBuffer(2)

    stream.pipe(chunker).on('data', spy).on('finish', () => {
      expect(spy).toHaveBeenCalledWith(buffer1)
      expect(spy).toHaveBeenCalledWith(buffer2)
      expect(spy).toHaveBeenCalledWith(buffer3)
      done()
    })

    stream.write(new Buffer(32).fill(randomByte()))
    stream.write(buffer1)
    stream.write(buffer2)
    stream.write(buffer3)
    stream.end()
  })

  it('synchronises and finds the expected frames with random interleaving bytes', done => {
    const spy = jest.fn()
    const buffer1 = fakeFrameBuffer(0)
    const buffer2 = fakeFrameBuffer(1)
    const buffer3 = fakeFrameBuffer(2)

    stream.pipe(chunker).on('data', spy).on('finish', () => {
      expect(spy).toHaveBeenCalledWith(buffer1)
      expect(spy).toHaveBeenCalledWith(buffer2)
      expect(spy).toHaveBeenCalledWith(buffer3)
      done()
    })

    stream.write(new Buffer(32).fill(randomByte()))
    stream.write(buffer1)
    stream.write(new Buffer(32).fill(randomByte()))
    stream.write(buffer2)
    stream.write(new Buffer(32).fill(randomByte()))
    stream.write(buffer3)
    stream.write(new Buffer(32).fill(randomByte()))
    stream.end()
  })
})
