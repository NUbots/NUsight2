import { hexToRGB } from '../rendering'


describe('hexToRGB', () => {

  it('converts hex colours to rgb', () => {

    expect(hexToRGB('#AABBCC')).toEqual({
      r: 0xAA,
      g: 0xBB,
      b: 0xCC,
    })

  })
})
