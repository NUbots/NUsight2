import Mock = jest.Mock

export type MockEventHandler<T> = Mock<(cb: T) => () => void> & {
  mockEvent: T
}

export const createMockEventHandler = <T extends Function>(): MockEventHandler<T> => {
  const listeners: Set<T> = new Set()
  const mockEventHandler: MockEventHandler<T> = Object.assign(
    jest.fn<(cb: T) => () => void>((cb: T) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    }),
    {
      mockEvent: ((...args: any[]) => {
        for (const listener of listeners) {
          listener(...args)
        }
      }) as any as T,
    })
  return mockEventHandler
}
