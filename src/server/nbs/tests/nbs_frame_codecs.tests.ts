import { hashType } from '../../nuclearnet/fake_nuclearnet_server'
import { encodeFrame } from '../nbs_frame_codecs'
import { decodeFrame } from '../nbs_frame_codecs'

describe('NbsFrameCodecs', () => {
  describe('encoding', () => {
    it('encodes frames', () => {
      const hash = hashType('message.input.sensors')
      const timestamp = 1500379664696000
      const payload = new Buffer(8).fill(0x12)
      const buffer = encodeFrame({
        timestamp,
        hash,
        payload,
      })
      expect(buffer.toString('hex')).toEqual('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212')
    })
    })

  describe('decoding', () => {
    it('decodes frames', () => {
      const buffer = Buffer.from('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212', 'hex')
      const frame = decodeFrame(buffer)
      expect(frame.timestamp).toEqual(1500379664696000)
      expect(frame.hash.equals(hashType('message.input.sensors'))).toBeTruthy()
      expect(frame.payload.equals(new Buffer(8).fill(0x12))).toBeTruthy()
    })
  })
})
