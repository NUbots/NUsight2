import { createMockEventHandler } from '../create_mock_event_handler'
import { createMockInstance } from '../create_mock_instance'
import Mocked = jest.Mocked

describe('createMockEventHandler', () => {
  it('calls all registered callbacks when a mock event is fired', () => {
    const testMock = createMockInstance(TestClass)
    const onTestEvent = createMockEventHandler<TestEventListener>()
    testMock.onTestEvent = onTestEvent

    const cb1 = jest.fn()
    testMock.onTestEvent(cb1)

    const cb2 = jest.fn()
    testMock.onTestEvent(cb2)

    const cb3 = jest.fn()
    const off = testMock.onTestEvent(cb3)
    off()

    onTestEvent.mockEvent('foo', 2)

    expect(cb1).toHaveBeenCalledWith('foo', 2)
    expect(cb2).toHaveBeenCalledWith('foo', 2)
    expect(cb3).not.toHaveBeenCalled()
  })
})

type TestEventListener = (str: string, num: number) => void

class TestClass {
  public onTestEvent(callback: TestEventListener): () => void {
    return () => {}
  }
}
