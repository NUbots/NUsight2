import { createSingletonFactory } from '../create_singleton_factory'

describe('createSingletonFactory', () => {
  class MyClass {
  }

  it('returns a new instance', () => {
    const factory = createSingletonFactory(() => new MyClass())
    expect(factory()).toBeInstanceOf(MyClass)
  })

  it('returns the same instance on from multiple calls', () => {
    const factory = createSingletonFactory(() => new MyClass())
    expect(factory()).toBe(factory())
  })

  it('returns separate instances for separate factories', () => {
    const factoryA = createSingletonFactory(() => new MyClass())
    const factoryB = createSingletonFactory(() => new MyClass())
    expect(factoryA()).not.toBe(factoryB())
  })
})
