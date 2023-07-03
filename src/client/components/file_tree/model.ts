import { observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

export interface TreeNode {
  label: string
  children: TreeNode[]
  expanded: boolean
  leaf: boolean
  file?: File
}

export interface File {
  path: string
  data?: any
}

export class FileTreeModel {
  @observable rootNode: TreeNode
  @observable selectedNode?: TreeNode

  constructor(files: File[]) {
    this.rootNode = createTreeFromFiles(files)
  }

  static of = createTransformer((files: File[]): FileTreeModel => {
    return new FileTreeModel(files)
  })
}

function createTreeFromFiles(files: File[]): TreeNode {
  const root = {
    label: 'root',
    children: [],
    leaf: false,
    expanded: true,
  }

  files.forEach(file => {
    const path = normalizePath(file.path)
    createTreeNode(path.split('/'), file, root)
  })

  return root
}

export function createTreeNode(pathSegments: string[], file: File, parent: TreeNode): void {
  if (pathSegments.length === 0) {
    throw Error('[createTreeNode]: pathSegments cannot be empty')
  } else if (pathSegments.length === 1) {
    const node = getOrCreateChild(parent, pathSegments[0])
    node.leaf = true
    node.file = file
  } else {
    const intermediateParent = getOrCreateChild(parent, pathSegments[0])
    intermediateParent.leaf = false

    createTreeNode(pathSegments.slice(1), file, intermediateParent)
  }
}

function getOrCreateChild(parent: TreeNode, childLabel: string): TreeNode {
  const existingChild = parent.children.find(parent => parent.label === childLabel)

  if (existingChild) {
    return existingChild
  }

  const newChild = {
    label: childLabel,
    children: [],
    leaf: false,
    expanded: false,
  }

  parent.children.push(newChild)

  return newChild
}

function normalizePath(path: string) {
  return path.replace(/\/\//g, '/') // Collapse consecutive slashes
}
