import SocketIO from 'socket.io-client'

import * as NUClearNetProxyParser from '../../shared/nuclearnet/nuclearnet_proxy_parser'

let socket: SocketIOClient.Socket
const events: Map<string, number> = new Map()
let callbackId = 0
const callbacks: Map<number, Function> = new Map()

const findBuffers = (obj: any): ArrayBuffer[] => {
  const buffers: any[] = []

  Object.keys(obj).forEach(k => {
    if (obj[k] instanceof ArrayBuffer) {
      buffers.push(obj[k])
    } else if (typeof obj[k] === 'object') {
      buffers.push(...findBuffers(obj[k]))
    }
  })

  return buffers
}

addEventListener('message', (e: MessageEvent) => {
  switch (e.data.command) {
    case 'construct': {
      const { uri, opts } = e.data
      socket = SocketIO(uri, {
        ...opts,
        parser: NUClearNetProxyParser,
      })
      break
    }
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

          postMessage(
            {
              event: e.data.event,
              args,
            },
            findBuffers(args),
          )
        })
      }

      events.set(e.data.event, events.get(e.data.event)! + 1)
      break

    case 'off': {
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
    }

    case 'send':
      socket.emit(e.data.event, ...e.data.args)
      break
  }
})

export default ({} as any) as new () => Worker
