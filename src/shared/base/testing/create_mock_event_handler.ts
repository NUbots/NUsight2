import Mock = jest.Mock

export type MockEventHandler<T> = Mock<(cb: T) => void> & {
  mockEvent: T
}

export const createMockEventHandler = <T extends Function>(): MockEventHandler<T> => {
  const listeners: T[] = []
  const mockEventHandler: MockEventHandler<T> = Object.assign(
    jest.fn<(cb: T) => void>((cb: T) => {
      listeners.push(cb)
    }),
    {
      mockEvent: ((...args: any[]) => {
        listeners.forEach((listener: T) => {
          listener(...args)
        })
      }) as any as T,
    })
  return mockEventHandler
}
