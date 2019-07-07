import { objectFit } from '../three'

describe('objectFit', () => {
  describe('fill', () => {
    it('always returns container size', () => {
      expect(objectFit({ width: 40, height: 10 }, { type: 'fill' })).toEqual({ width: 40, height: 10 })
      expect(objectFit({ width: 20, height: 30 }, { type: 'fill' })).toEqual({ width: 20, height: 30 })
    })
  })

  describe('contain', () => {
    it('square content contains portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'contain', aspect: 1 })).toEqual({ width: 10, height: 10 })
    })

    it('square content contains landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'contain', aspect: 1 })).toEqual({ width: 10, height: 10 })
    })

    it('portrait content contains portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'contain', aspect: 2 })).toEqual({ width: 10, height: 20 })
    })

    it('portrait content contains landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'contain', aspect: 2 })).toEqual({ width: 5, height: 10 })
    })

    it('landscape content contains portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'contain', aspect: 0.5 })).toEqual({ width: 10, height: 5 })
    })

    it('landscape content contains landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'contain', aspect: 0.5 })).toEqual({ width: 20, height: 10 })
    })
  })

  describe('cover', () => {
    it('square content covers portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'cover', aspect: 1 })).toEqual({ width: 20, height: 20 })
    })

    it('square content covers landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'cover', aspect: 1 })).toEqual({ width: 20, height: 20 })
    })

    it('portrait content covers portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'cover', aspect: 2 })).toEqual({ width: 10, height: 20 })
    })

    it('portrait content contains landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'cover', aspect: 2 })).toEqual({ width: 20, height: 40 })
    })

    it('landscape content covers portrait container', () => {
      expect(objectFit({ width: 10, height: 20 }, { type: 'cover', aspect: 0.5 })).toEqual({ width: 40, height: 20 })
    })

    it('landscape content contains landscape container', () => {
      expect(objectFit({ width: 20, height: 10 }, { type: 'cover', aspect: 0.5 })).toEqual({ width: 20, height: 10 })
    })
  })
})
