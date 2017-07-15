import { MessageTypePath } from './message_type_names'

self.addEventListener('message', (e: MessageEvent) => {
  self.postMessage({ 'token': 'Hello main thread!!' })
})
