import * as stream from 'stream'
import { SeededRandom } from '../../../shared/base/random/seeded_random'
import { hashType } from '../../nuclearnet/fake_nuclearnet_server'
import { FakeClock } from '../../time/fake_clock'
import { encodeFrame } from '../nbs_frame_codecs'

/**
 * A simple fake binary stream to test the nbs framing stream transforms.
 */
export class FakeNbsStream extends stream.PassThrough {
  public constructor(private clock: FakeClock, private random: SeededRandom) {
    super()
  }

  public static of(): FakeNbsStream {
    return new FakeNbsStream(FakeClock.of(), SeededRandom.of('fake_nbs_stream'))
  }

  /**
   * Generate valid stream of frame buffers
   */
  public generate(numFrames: number): void {
    for (let i = 0; i < numFrames; i++) {
      const buffer = this.fakeFrameBuffer()
      this.write(buffer)
    }
    this.end()
  }

  /**
   * Generate frame buffers which are padded on either size with randomness, designed to test resynchronisation.
   */
  public generateWithPaddedRandomness(numFrames: number): void {
    for (let i = 0; i < numFrames; i++) {
      // Create a real frame buffer, and a padded buffer which is twice the size.
      const buffer = this.fakeFrameBuffer()
      const paddedBuffer = this.randomBuffer(buffer.byteLength * 2)

      // Insert the real frame at a random location within the padded buffer.
      const offset = this.random.integer(0, buffer.byteLength)
      buffer.copy(paddedBuffer, offset)

      this.write(paddedBuffer)
    }
    this.end()
  }

  private fakeFrameBuffer() {
    return encodeFrame({
      timestampInMicroseconds: this.clock.performanceNow() * 1e6,
      hash: hashType('fake'),
      payload: new Buffer(8).fill(12),
    })
  }

  /**
   * Produce a buffer with random bytes as content.
   */
  private randomBuffer(size: number) {
    const buffer = new Buffer(size)
    for (let i = 0; i < buffer.byteLength; i++) {
      buffer[i] = this.random.integer(0, 255)
    }
    return buffer
  }
}
