import { TreeNode } from './model'
import * as files from './sample-config-files.json'

interface File {
  path: string
  content: any
}

export function createTreeFromFiles(files: any): TreeNode {
  // The tree (root node)
  const tree: TreeNode = {
    label: 'config/',
    expanded: true,
    leaf: false,
    selected: false,
    children: [],
  }

  // A map of file paths to tree nodes
  const pathNodeMap = {
    'config/': tree,
  }

  // Create a node for each file and add it to the tree
  files.forEach((file: File) => {
    // Remove consecutive slashes from the path
    file.path = file.path.replace(/\/\//g, '/')

    // Remove the first segment ('config/') from the path and pass it as parentPath,
    // since we've already created it as the root node - this assumes that every
    // config file is in one directory - config/
    createTreeNode(file.path.split('/').slice(1), 'config/', file, pathNodeMap)
  })

  return tree
}

export function createTreeNode(pathSegments: string[], parentPath: string, file: File, pathNodeMap: any) {
  const isFolder = pathSegments.length > 1
  const label = pathSegments[0] + (isFolder ? '/' : '')
  const currentPath = parentPath + label

  // Abort if the current path is a file node already in the tree
  if (!isFolder && pathNodeMap[currentPath] !== undefined) {
    return
  }

  // Recurse and abort if the current path is a folder node already in the tree
  if (isFolder && pathNodeMap[currentPath] !== undefined) {
    createTreeNode(pathSegments.slice(1), currentPath, file, pathNodeMap)
    return
  }

  // Create the new node
  const node = {
    label,
    expanded: false,
    leaf: !isFolder,
    selected: false,
    data: isFolder ? undefined : file,
    children: [],
  }

  // Add the new node to the tree
  pathNodeMap[parentPath].children.push(node)

  // Add the new node to the path map
  pathNodeMap[currentPath] = node

  // Recurse if the new node is a folder
  if (isFolder) {
    createTreeNode(pathSegments.slice(1), currentPath, file, pathNodeMap)
  }
}

export const configurationData = createTreeFromFiles(files)
