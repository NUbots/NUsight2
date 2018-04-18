import * as SocketIO from 'socket.io-client'

import * as NUClearProxyParser from '../../shared/network/nuclear_proxy_parser'

import { WebWorkerCallback } from './webworker_callback'

let socket: SocketIOClient.Socket
const events: Map<string, number> = new Map()
let callbackId = 0
const callbacks: Map<number, Function> = new Map()

addEventListener('message', (e: MessageEvent) => {
  switch (e.data.command) {

    case 'construct':
      const { uri, opts } = e.data
      socket = SocketIO(uri, {
        ...opts,
        parser: NUClearProxyParser,
      })
      break

    case 'connect':
      socket.connect()
      break

    case 'disconnect':
      socket.disconnect()
      break

    case 'callback':
      if (callbacks.has(e.data.id)) {
        callbacks.get(e.data.id)!(...e.data.args)
        callbacks.delete(e.data.id)
      }
      break

    case 'on':
      if (!events.has(e.data.event)) {
        events.set(e.data.event, 0)
        socket.on(e.data.event, (...args: any[]) => {

          // Map out the functions and replace them with a proxy
          args = args.map(v => {
            if (v instanceof Function) {
              const id = callbackId++
              callbacks.set(id, v)
              return { _webworkerCallback: id }
            } else {
              return v
            }
          })

          postMessage({
            event: e.data.event,
            args,
          },
            args.filter(a => a instanceof ArrayBuffer),
          )
        })
      }

      events.set(e.data.event, events.get(e.data.event)! + 1)
      break

    case 'off':
      if (!events.has(e.data.event)) {
        throw Error(`The event ${event} did not have any registered callbacks`)
      }

      const v = events.get(e.data.event)!
      if (v === 1) {

        // Since there is only ever one listener we can just remove it
        socket.off(e.data.event)
        events.delete(e.data.event)
      } else {
        events.set(e.data.event, v - 1)
      }

      break

    case 'send':
      socket.emit(e.data.event, ...e.data.args)
      break
  }
})
