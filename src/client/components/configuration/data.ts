import { Node } from './tree/tree'

export const configurationData = {
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
        {
          label: 'child1',
          expanded: false,
          leaf: true,
          selected: false,
        },
        {
          label: 'child2',
          expanded: false,
          leaf: true,
          selected: false,
        },
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
            {
              label: 'nested child 1',
              expanded: false,
              leaf: true,
              selected: false,
            },
            {
              label: 'nested child 2',
              expanded: false,
              leaf: true,
              selected: false,
            },
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
}
