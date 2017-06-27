import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './bool_value.css'

import { FieldProps } from '../editor'

@observer
export class BoolValue extends React.Component<FieldProps, void> {
  public render(): JSX.Element {
    return (
      <div className={style.boolValue}>
        <input
          className={style.boolValue__input}
          type='checkbox'
          checked={this.props.data.value}
          onChange={this.props.onChange}
        />

        <span className={style.boolValue__value}>
          { this.props.data.value ? 'true' : 'false' }
        </span>
      </div>
    )
  }
}
