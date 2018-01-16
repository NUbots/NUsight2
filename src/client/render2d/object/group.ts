import { observable } from 'mobx'

import { Transform } from '../../math/transform'

export type GroupOpts = {
  children: any[]
  transform: Transform
}

export class Group {
  @observable children: any[]
  @observable transform: Transform

  constructor(opts: GroupOpts) {
    this.children = opts.children
    this.transform = opts.transform
  }

  static of({
    children = [],
    transform = Transform.of(),
  }: Partial<GroupOpts> = {}): Group {
    return new Group({
      children,
      transform,
    })
  }

  add(obj: any): void {
    this.children.push(obj)
  }
}
