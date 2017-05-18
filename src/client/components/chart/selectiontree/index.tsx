import * as React from 'react'
import { observer } from 'mobx-react'

@observer
export class SelectionTree extends React.Component<any, any> {

  public render(): JSX.Element {

    return (
      <ul>
        <li>
          <ul>
            <li>

            </li>
          </ul>
        </li>
      </ul>
    )
  }
}
