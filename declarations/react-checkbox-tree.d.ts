/// <reference path="../node_modules/@types/react/index.d.ts"/>

declare module 'react-checkbox-tree' {
  interface Node {
    label: string
    value: string | number
    icon: any
  }

  interface CheckboxTreeProps {
    nodes: any
    checked?: string[]
    expanded?: string[]
    name?: string
    nameAsArray?: boolean
    optimisticToggle?: boolean
    showNodeIcon?: boolean
    onCheck?: (checked: Node[]) => void,
    onExpand?: (expanded: Node[]) => void,
  }

  const CheckboxTree: new() => React.Component<CheckboxTreeProps, any>

  export = CheckboxTree
}
