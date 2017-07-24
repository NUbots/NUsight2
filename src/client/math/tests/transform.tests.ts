import { Transform } from '../transform'

describe('Transform', () => {
  describe('applyTransformLocal', () => {
    it('should apply rotate correctly', () => {
      const transform1 = Transform.of({ rotate: Math.PI })
      const transform2 = Transform.of({ rotate: Math.PI / 2 })

      const actual = transform1.applyTransformLocal(transform2)
      const expected = Transform.of({ rotate: Math.PI * 1.5  })
      expect(actual).toEqual(expected)
    })

    it('should apply scale correctly', () => {
      const transform1 = Transform.of({ scale: { x: 2, y: 3 } })
      const transform2 = Transform.of({ scale: { x: 4, y: -5 } })

      const actual = transform1.applyTransformLocal(transform2)
      const expected = Transform.of({ scale: { x: 8, y: -15 } })
      expect(actual).toEqual(expected)
    })

    it('should apply translate correctly', () => {
      const transform1 = Transform.of({ translate: { x: 2, y: 3 } })
      const transform2 = Transform.of({ translate: { x: 4, y: -5 } })

      const actual = transform1.applyTransformLocal(transform2)
      const expected = Transform.of({ translate: { x: 6, y: -2 } })
      expect(actual).toEqual(expected)
    })

    it('should apply all transforms correctly', () => {
      const transform1 = Transform.of({
        rotate: Math.PI / 2,
        scale: {
          x: 2,
          y: 2,
        },
        translate: {
          x: 2,
          y: 1,
        },
      })
      const transform2 = Transform.of({
        rotate: Math.PI,
        scale: {
          x: 1,
          y: 1,
        },
        translate: {
          x: 1,
          y: -2,
        },
      })

      const actual = transform1.applyTransformLocal(transform2)
      const expected = Transform.of({
        rotate: 3 * Math.PI / 2,
        scale: {
          x: 2,
          y: 2,
        },
        translate: {
          x: 6,
          y: 3,
        }
      })
      expect(actual).toEqual(expected)
    })
  })

  describe('applyTransformWorld', () => {
    it('should apply rotate correctly', () => {
      const transform1 = Transform.of({ rotate: Math.PI })
      const transform2 = Transform.of({ rotate: Math.PI / 2 })

      const actual = transform1.applyTransformWorld(transform2)
      const expected = Transform.of({ rotate: 3 * Math.PI / 2  })
      expect(actual).toEqual(expected)
    })

    it('should apply scale correctly', () => {
      const transform1 = Transform.of({ scale: { x: 2, y: 3 } })
      const transform2 = Transform.of({ scale: { x: 4, y: -5 } })

      const actual = transform1.applyTransformWorld(transform2)
      const expected = Transform.of({ scale: { x: 8, y: -15 } })
      expect(actual).toEqual(expected)
    })

    it('should apply translate correctly', () => {
      const transform1 = Transform.of({ translate: { x: 2, y: 3 } })
      const transform2 = Transform.of({ translate: { x: 4, y: -5 } })

      const actual = transform1.applyTransformWorld(transform2)
      const expected = Transform.of({ translate: { x: 6, y: -2 } })
      expect(actual).toEqual(expected)
    })

    it('should apply all transforms correctly', () => {
      const transform1 = Transform.of({
        rotate: Math.PI,
        scale: {
          x: 2,
          y: 3,
        },
        translate: {
          x: 2,
          y: 3,
        },
      })
      const transform2 = Transform.of({
        rotate: Math.PI / 2,
        scale: {
          x: 4,
          y: -5,
        },
        translate: {
          x: 4,
          y: -5,
        },
      })

      const actual = transform1.applyTransformWorld(transform2)
      const expected = Transform.of({
        rotate: 3 * Math.PI / 2,
        scale: {
          x: 8,
          y: -15,
        },
        translate: {
          x: 6,
          y: -2,
        }
      })
      expect(actual).toEqual(expected)
    })
  })
})
