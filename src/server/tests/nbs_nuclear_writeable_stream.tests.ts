import * as fs from 'fs'
import * as stream from 'stream'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../nuclearnet/fake_nuclearnet_server'
import { NbsNUClearWritableStream } from '../nusight_server'
import { NBsNUClearTransformSteam } from '../nusight_server'
import WritableStream = NodeJS.WritableStream

describe.skip('NbsNUClearWritableStream', () => {
  let writeStream: WritableStream
  let nuclearnetClient: FakeNUClearNetClient

  beforeEach(() => {
    const nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    writeStream = new NbsNUClearWritableStream(nuclearnetClient)
  })

  it('asdfas', done => {
    jest.spyOn(nuclearnetClient, 'send')
    const file = fs.createReadStream('/Users/brendan/Lab/NUsight2/recordings/darwin3_WalkAround.nbs')
    file.pipe(writeStream).on('finish', () => {
      // expect(nuclearnetClient.send).toHaveBeenCalledTimes(149)
      done()
    })
  })
})

describe('NBsNUClearTransformSteam', () => {
  let transform: stream.Transform

  beforeEach(() => {
    transform = new NBsNUClearTransformSteam()
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
