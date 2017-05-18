import * as React from 'react'
import * as style from './style.css'
import { Node, Tree } from './tree/tree'
import TreeStore from './tree_store'

const store = new TreeStore({
    label: 'root',
    expanded: true,
    leaf: false,
    selected: false,
    children: [
        {
            label: 'parent',
            expanded: false,
            leaf: false,
            selected: false,
            children: [
                { label: 'child1', expanded: false, leaf: true, selected: false },
                { label: 'child2', expanded: false, leaf: true, selected: false },
            ],
        },
        {
            label: 'parent',
            expanded: false,
            leaf: false,
            selected: false,
            children: [
                {
                    label: 'nested parent',
                    expanded: false,
                    leaf: false,
                    selected: false,
                    children: [
                        { label: 'nested child 1', expanded: false, leaf: true, selected: false },
                        { label: 'nested child 2', expanded: false, leaf: true, selected: false },
                    ],
                },
            ],
        },
        {
            label: 'Some file here',
            expanded: true,
            leaf: true,
            selected: false,
            children: [] as Node[],
        },
    ],
})

export const Configuration = () => (
  <div className={style.configuration}>
    <div className={style.configuration__header}>
      <h1 className={style.configuration__headerTitle}>Configuration</h1>
    </div>

    <div className={style.configuration__body}>
      <div className={style.configuration__sidebar}>
        <div className={style.configuration__sidebarHeader}>Files</div>
        <Tree onClick={store.onNodeClick} data={store.data} />
      </div>

      <div className={style.configuration__content}>
        <div className={style.configuration__contentPlaceholder}>
          Select a file to edit
        </div>
      </div>
    </div>
  </div>
)

export default Configuration
