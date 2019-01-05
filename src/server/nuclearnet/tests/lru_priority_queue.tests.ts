import { LruPriorityQueue } from '../lru_priority_queue'

describe('LruPriorityQueue', () => {
  /** Fetch all remaining items in the queue, in priority order.  */
  function all<K, V>(queue: LruPriorityQueue<K, V>): V[] {
    const items: V[] = []
    let item: V | undefined
    /* tslint:disable-next-line no-conditional-assignment */
    while ((item = queue.pop())) {
      items.push(item)
    }
    return items
  }

  it('interleaves keys', () => {
    const queue = new LruPriorityQueue<string, string>()
    queue.add('foo', 'foo_1')
    queue.add('foo', 'foo_2')
    queue.add('bar', 'bar_1')
    queue.add('bar', 'bar_2')
    queue.add('baz', 'baz_1')
    queue.add('baz', 'baz_2')
    expect(all(queue)).toEqual(['foo_1', 'bar_1', 'baz_1', 'foo_2', 'bar_2', 'baz_2'])
  })

  it('drops items when over limit', () => {
    const queue = new LruPriorityQueue<string, string>({ limitPerKey: 2 })
    queue.add('foo', 'foo_1')
    queue.add('foo', 'foo_2')
    queue.add('foo', 'foo_3')
    queue.add('foo', 'foo_4')
    queue.add('bar', 'bar_1')
    queue.add('bar', 'bar_2')
    queue.add('bar', 'bar_3')
    expect(all(queue)).toEqual(['foo_3', 'bar_2', 'foo_4', 'bar_3'])
  })
})
