import { runInAction } from 'mobx'
import { observable } from 'mobx'
import { onBecomeUnobserved } from 'mobx'
import { computedFn } from 'mobx-utils'

export const createUpdatableComputed = <T, O>(
  create: (opts: O) => T,
  update: (instance: T, opts: O) => void,
  dispose?: (instance: T) => void,
) => {
  return <D extends Array<unknown>>(getOpts: (...deps: D) => O): (...deps: D) => T => {
    let box = observable.box<T | undefined>(undefined, { equals: () => false, deep: false })
    onBecomeUnobserved(box, () => {
      const instance = box.get()
      if (instance != null) {
        dispose && dispose(instance)
        runInAction(() => box.set(undefined))
      }
    })
    return computedFn((...deps: D): T => {
      const opts = getOpts(...deps)
      let instance = box.get()
      if (instance == null) {
        instance = create(opts)
        runInAction(() => box.set(instance))
      }
      update(instance, opts)
      return instance
    }, { equals: () => false })
  }
}
