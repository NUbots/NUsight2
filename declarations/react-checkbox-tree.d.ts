import { Component } from "react";

interface Node {
  label: string
  value: string | number
  icon: any
}

export interface TreeNodeProps {
    checked: number
    expanded: boolean
    label: string
    optimisticToggle: boolean
    showNodeIcon: boolean
    treeId: string,
    value: string,
    onCheck: (checked: Node[]) => void,
    onExpand: (expanded: Node[]) => void,

    children?: any,
    className?: string,
    icon?: any,
    // rawChildren?: arrayOf(nodeShape),
}

export declare class TreeNode  extends Component<TreeNodeProps, {}> {}


export interface CheckboxTreeProps {
    checked?: string[]
    expanded?: string[]
    name?: string
    nameAsArray?: boolean
    optimisticToggle?: boolean
    showNodeIcon?: boolean
    onCheck?: (checked: Node[]) => void,
    onExpand?: (expanded: Node[]) => void,
}

export declare class CheckboxTree extends Component<CheckboxTreeProps, {}> {}

export default CheckboxTree
