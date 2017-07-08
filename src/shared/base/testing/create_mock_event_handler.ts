import Mock = jest.Mock

export type FakeEventHandler<T> = Mock<(cb: T) => void> & {
  fakeEvent: T
}

export const createMockEventHandler = <T extends Function>(): FakeEventHandler<T> => {
  const listeners: T[] = []
  const fakeHandler: FakeEventHandler<T> = Object.assign(
    jest.fn<(cb: T) => void>((cb: T) => {
      listeners.push(cb)
    }),
    {
      fakeEvent: ((...args: any[]) => {
        listeners.forEach((listener: T) => {
          listener(...args)
        })
      }) as any as T,
    })
  return fakeHandler
}
