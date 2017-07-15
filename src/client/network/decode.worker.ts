import { MessageTypePath } from './message_type_names'

addEventListener('message', (e: MessageEvent) => {
  postMessage({ 'token': 'Hello main thread!!' })
})
