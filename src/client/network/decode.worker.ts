import { message } from '../../shared/proto/messages'

const HEADER_SIZE = 9

addEventListener('message', (e: MessageEvent) => {
  const token = e.data.token
  const type = e.data.type.split('.')
  const payload = e.data.payload

  // Using our message type access the appropriate decoder
  let decoder: any = message
  for (let i = 1; i < type.length; ++i) {
    decoder = decoder[type[i]]
  }

  // Remove NUsight header for decoding by protobufjs
  const buffer = new Uint8Array(payload).slice(HEADER_SIZE)
  const output = decoder.decode(buffer)

  // Send back our decoded data!
  postMessage({ 'token': token, 'output': output })
})
