import { computed } from 'mobx'
import { observable } from 'mobx'
import { memoize } from '../../../base/memoize'

export enum CheckedState {
  Checked = 'checked',
  Unchecked = 'unchecked',
  Indeterminate = 'indeterminate',
}

export type TreeNodeModelOpts = {
  children: TreeNodeModel[]
  checkedState: CheckedState
  label: string
  expanded: boolean
  path?: string
}

export class TreeNodeModel {
  @observable public children: TreeNodeModel[]
  @observable public checkedState: CheckedState
  @observable public label: string
  @observable public expanded: boolean
  @observable public path?: string

  constructor(opts: TreeNodeModelOpts) {
    this.children = opts.children
    this.checkedState = opts.checkedState
    this.label = opts.label
    this.expanded = opts.expanded
    this.path = opts.path
  }

  public static of({
    children = [],
    checkedState = CheckedState.Unchecked,
    label,
    expanded = false,
    path,
  }: Partial<TreeNodeModel> = {}): TreeNodeModel {
    return new TreeNodeModel({
      children,
      checkedState,
      label,
      expanded,
      path,
    })
  }

  @computed
  public get leaf(): boolean {
    return this.children.length === 0
  }

  @computed
  public get checked(): CheckedState {
    if (this.leaf) {
      return this.checkedState
    }

    if (this.children.every(node => node.checked === CheckedState.Checked)) {
      return CheckedState.Checked
    }

    if (this.children.every(node => node.checked === CheckedState.Unchecked)) {
      return CheckedState.Unchecked
    }

    return CheckedState.Indeterminate
  }
}

export type TreeModelOpts = {
  nodes: TreeNodeModel[]
  usePessimisticToggle: boolean
}

export class TreeModel {
  @observable public nodes: TreeNodeModel[]
  @observable public usePessimisticToggle: boolean

  public constructor(opts: TreeModelOpts) {
    this.nodes = opts.nodes
    this.usePessimisticToggle = opts.usePessimisticToggle
  }

  public static of = memoize(({
    nodes = [],
    usePessimisticToggle = true,
  }: Partial<TreeModelOpts> = {}): TreeModel => {
    return new TreeModel({
      nodes,
      usePessimisticToggle,
    })
  })
}

export function createNodesFromData(data: any): TreeNodeModel[] {
  const nodes : TreeNodeModel[] = []

  Object.keys(data).forEach(key => {
    nodes.push(createNode(key, data[key]))
  })

  return nodes
}

export function createNode(label: string, data: any, parentPath: string = ''): TreeNodeModel {
  const path = parentPath.length > 0 ? `${parentPath}.${label}` : label

  const node : TreeNodeModel = new TreeNodeModel({
    children: [],
    checkedState: CheckedState.Checked,
    expanded: false,
    label,
    path,
  })

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    Object.keys(data).forEach(key => {
      node.children.push(createNode(key, data[key], path))
    })
  }

  return node
}
