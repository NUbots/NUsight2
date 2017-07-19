import * as stream from 'stream'

export class FakeNbsStream extends stream.PassThrough {
  public generate(numFrames: number) {
    for (let i = 0; i < numFrames; i++) {
      const buffer = Buffer.from('e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212', 'hex')
      this.write(buffer)
    }
    this.end()
  }

  public generatewithGarbage(numFrames: number) {
    for (let i = 0; i < numFrames; i++) {
      const buffer = Buffer.from('c96540e298a218000000c042f15c9654050010abef8b5398f0d41212121212121212f350ab21', 'hex')
      this.write(buffer)
    }
    this.end()
  }
}
