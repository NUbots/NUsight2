import { observable } from 'mobx'

import { Transform } from '../../math/transform'
import { Shape } from './shape'
import { Geometry } from './shape'

export type GroupOpts = {
  children: Array<Group | Shape<Geometry>>
  transform: Transform
}

export class Group {
  @observable children: Array<Group | Shape<Geometry>>
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

  add(obj: Group | Shape<Geometry>): void {
    this.children.push(obj)
  }
}
