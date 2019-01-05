type Item<K, V> = {
  type: K,
  values: V[]
}

export class LruPriorityQueue<K, V> {
  private readonly limitPerKey?: number
  private readonly queue: Array<Item<K, V>> = []
  private readonly map: Map<K, Item<K, V>> = new Map()

  constructor({ limitPerKey }: { limitPerKey?: number } = {}) {
    this.limitPerKey = limitPerKey
  }

  add(k: K, v: V) {
    let item = this.map.get(k)
    if (!item) {
      item = { type: k, values: [] }
      this.map.set(k, item)
      this.queue.push(item)
    }
    if (this.limitPerKey && item.values.length >= this.limitPerKey) {
      item.values.shift()
    }
    item.values.push(v)
  }

  next(): { key: K, value: V } | undefined {
    /* tslint:disable-next-line prefer-for-of */
    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue.shift()!
      this.queue.push(item)
      const nextValue = item.values.shift()
      if (nextValue) {
        return { key: item.type, value: nextValue }
      }
    }
  }
}
