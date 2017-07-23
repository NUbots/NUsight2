import { computed } from 'mobx'
import { Transform } from '../../math/transform'
import { Group } from './group'
import { GroupOpts } from './group'
import { Object2d } from './object2d'
import { action } from 'mobx'
import { observable } from 'mobx'

export type SceneOpts = GroupOpts

export class Scene implements Object2d {
  @observable private group: Group

  public constructor(opts: SceneOpts) {
    this.group = Group.of(opts)
  }

  public static of({
    children = [],
    transform = Transform.of(),
  }: Partial<SceneOpts> = {}): Scene {
    return new Scene({
      children,
      transform
    })
  }

  @action
  public add(obj: Object2d): void {
    this.group.add(obj)
  }

  @computed
  public get children(): Object2d[] {
    return this.group.children
  }

  @computed
  public get transform(): Transform {
    return this.group.transform
  }
}
