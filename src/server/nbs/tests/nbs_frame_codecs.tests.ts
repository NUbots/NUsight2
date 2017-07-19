import { hashType } from '../../nuclearnet/fake_nuclearnet_server'
import { encodeFrame } from '../nbs_frame_codecs'
import { decodeFrame } from '../nbs_frame_codecs'

describe('NbsFrameCodecs', () => {
  describe('encoding', () => {
    it('encodes frames', () => {
      const hash = hashType('message.input.sensors')
      const timestamp = 1500379664696000
      const payload = new Buffer(8).fill(0x12)
      const buffer = encodeFrame({ timestampInMicroseconds: timestamp, hash, payload })
      expect(buffer.toString('hex')).toEqual('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212')
    })
  })

  describe('decoding', () => {
    it('decodes frames', () => {
      const buffer = Buffer.from('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212', 'hex')
      const frame = decodeFrame(buffer)
      expect(frame).toEqual({
        timestamp: 1500379664696000,
        hash: hashType('message.input.sensors'),
        payload: new Buffer(8).fill(0x12)
      })
    })
  })

  describe('roundtrip', () => {
    it('decode than encode should equal original', () => {
      const buffer = Buffer.from('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212', 'hex')
      expect(encodeFrame(decodeFrame(buffer))).toEqual(buffer)
    })

    it('encode than decode should equal original', () => {
      const frame = {
        hash: hashType('message.input.sensors'),
        timestamp: 1500379664696000,
        payload: new Buffer(8).fill(0x12),
      }
      expect(decodeFrame(encodeFrame(frame))).toEqual(frame)
    })
  })
})
