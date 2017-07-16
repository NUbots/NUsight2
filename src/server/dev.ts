import * as compression from 'compression'
import * as history from 'connect-history-api-fallback'
import * as express from 'express'
import * as http from 'http'
import * as minimist from 'minimist'
import * as favicon from 'serve-favicon'
import * as sio from 'socket.io'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../../webpack.config'
import { SensorDataSimulator } from '../simulators/sensor_data_simulator'
import { VirtualRobots } from '../simulators/virtual_robots'
import { DirectNUClearNetClient } from './nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from './nuclearnet/fake_nuclearnet_client'
import { WebSocketProxyNUClearNetServer } from './nuclearnet/web_socket_proxy_nuclearnet_server'
import { WebSocketServer } from './nuclearnet/web_socket_server'
import { NUsightServer } from './nusight_server'

const compiler = webpack(webpackConfig)

const args = minimist(process.argv.slice(2))
const withSimulators = args['with-simulators'] || false

const app = express()
const server = http.createServer(app)
const sioNetwork = sio(server)

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  index: 'index.html',
  stats: {
    colors: true,
  },
})

app.use(compression())
// We need to wrap the fallback history API with two instances of the dev middleware to handle the initial raw request
// and the following rewritten request.
// Refer to: https://github.com/webpack/webpack-dev-middleware/pull/44#issuecomment-170462282
app.use(devMiddleware)
app.use(history())
app.use(devMiddleware)
app.use(webpackHotMiddleware(compiler))
app.use(favicon(`${__dirname}/../assets/favicon.ico`))

const port = process.env.PORT || 3000
server.listen(port, () => {
  /* tslint:disable no-console */
  console.log(`NUsight server started at http://localhost:${port}`)
})

if (withSimulators) {
  const virtualRobots = VirtualRobots.of({
    fakeNetworking: true,
    numRobots: 3,
    simulators: [
      SensorDataSimulator.of(),
    ],
  })
  virtualRobots.simulateWithFrequency(60)
}

const nuclearnetClient = withSimulators ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()

WebSocketProxyNUClearNetServer.of(WebSocketServer.of(sioNetwork.of('/nuclearnet')), nuclearnetClient)

NUsightServer.of(WebSocketServer.of(sioNetwork.of('/nusight')), nuclearnetClient)
