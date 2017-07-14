import { createMockEventHandler } from '../../../shared/base/testing/create_mock_event_handler'
import { MockEventHandler } from '../../../shared/base/testing/create_mock_event_handler'
import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import { FakeNUClearNetClient } from '../fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../fake_nuclearnet_server'
import { WebSocketProxyNUClearNetServer } from '../web_socket_proxy_nuclearnet_server'
import { WebSocketServer } from '../web_socket_server'
import { WebSocket } from '../web_socket_server'
import Mocked = jest.Mocked

describe('WebSocketProxyNUClearNetServer', () => {
  let webSocketServer: Mocked<WebSocketServer>
  let onClientConnection: MockEventHandler<(socket: WebSocket) => void>
  let nuclearnetServer: FakeNUClearNetServer
  let nuclearnetClient: FakeNUClearNetClient
  let server: WebSocketProxyNUClearNetServer

  beforeEach(() => {
    webSocketServer = createMockInstance(WebSocketServer)
    onClientConnection = createMockEventHandler<(socket: WebSocket) => void>()
    webSocketServer.onConnection = onClientConnection
    nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    nuclearnetClient.connect({ name: 'bob' })
    server = new WebSocketProxyNUClearNetServer(webSocketServer, nuclearnetClient)
  })

  it('listens to new connections', () => {
    expect(webSocketServer.onConnection).toHaveBeenCalledTimes(1)
  })

  it('forwards NUClearNet network join events to socket', () => {
    const webSocket = createMockInstance(WebSocket)
    onClientConnection.mockEvent(webSocket)

    const alice = new FakeNUClearNetClient(nuclearnetServer)
    alice.connect({ name: 'alice' })

    expect(webSocket.send).toHaveBeenLastCalledWith('nuclear_join', expect.objectContaining({
      name: 'alice',
    }))
  })

  it('forwards NUClearNet network leave events to socket', () => {
    const webSocket = createMockInstance(WebSocket)
    onClientConnection.mockEvent(webSocket)

    const alice = new FakeNUClearNetClient(nuclearnetServer)
    const disconnect = alice.connect({ name: 'alice' })
    disconnect()

    expect(webSocket.send).toHaveBeenLastCalledWith('nuclear_leave', expect.objectContaining({
      name: 'alice',
    }))
  })
})
