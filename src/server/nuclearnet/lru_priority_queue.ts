type Item<K, V> = {
  key: K,
  values: V[]
}

/**
 * A priority queue which favours values whose keys are the least recently used (LRU).
 *
 * Optionally can limit the queue length per key, favouring the newest entries and dropping old ones.
 */
export class LruPriorityQueue<K, V> {
  private readonly limitPerKey?: number
  private readonly queue: Array<Item<K, V>> = []
  private readonly map: Map<K, Item<K, V>> = new Map()

  constructor({ limitPerKey }: { limitPerKey?: number } = {}) {
    this.limitPerKey = limitPerKey
  }

  add(key: K, value: V) {
    let item = this.map.get(key)
    if (!item) {
      item = { key, values: [] }
      this.map.set(key, item)
      this.queue.push(item)
    }
    if (this.limitPerKey && item.values.length >= this.limitPerKey) {
      item.values.shift()
    }
    item.values.push(value)
  }

  pop(): V | undefined {
    /* tslint:disable-next-line prefer-for-of */
    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue.shift()!
      this.queue.push(item)
      const value = item.values.shift()
      if (value) {
        return value
      }
    }
  }
}
