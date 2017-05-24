import * as React from 'react'
import * as style from './style.css'

import { Panel } from './panel/panel'
import { Node, Tree } from './tree/tree'
import { TreeModel } from './tree_model'

const model = new TreeModel({
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
      <Panel title='Files' className={style.configuration__sidebar}>
        <Tree onClick={model.onNodeClick} data={model.data} />
      </Panel>

      <div className={style.configuration__content}>
        <div className={style.configuration__contentPlaceholder}>
          Select a file to edit
        </div>
      </div>
    </div>
  </div>
)
