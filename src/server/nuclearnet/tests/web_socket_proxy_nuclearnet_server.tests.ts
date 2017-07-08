import { WebSocketProxyNUClearNetServer } from '../web_socket_proxy_nuclearnet_server'
import { WebSocketServer } from '../web_socket_server'
import { WebSocket } from '../web_socket_server'
import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import Mocked = jest.Mocked
import { FakeNUClearNetClient } from '../fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../fake_nuclearnet_server'

describe('WebSocketProxyNUClearNetServer', () => {
  let onClientConnectionListener: (socket: WebSocket) => void
  let webSocketServer: Mocked<WebSocketServer>
  let webSocket: WebSocket
  let nuclearnetServer: FakeNUClearNetServer
  let nuclearnetClient: FakeNUClearNetClient
  let server: WebSocketProxyNUClearNetServer

  beforeEach(() => {
    webSocket = createMockInstance(WebSocket)
    webSocketServer = createMockInstance(WebSocketServer)
    webSocketServer.onConnection.mockImplementation((listener: (socket: WebSocket) => void) => {
      onClientConnectionListener = listener
    })
    nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    server = new WebSocketProxyNUClearNetServer(webSocketServer, nuclearnetClient)
  })

  it('listens to new connections', () => {
    expect(webSocketServer.onConnection).toHaveBeenCalled()
  })

  it('asdfklasdj', () => {
    onClientConnectionListener(webSocket)

    const alice = new FakeNUClearNetClient(nuclearnetServer)
    alice.connect({ name: 'alice'})

    expect(webSocket.send).toHaveBeenCalledWith('nuclear_join', {
      name: 'alice',
      address: 'localhost',
      port: 1234,
    })
  })

  it('forwards NUClearNet network joins to socket', () => {

  })
})
