import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './bool_value.css'

import { FieldProps } from '../editor'

@observer
export class BoolValue extends React.Component<FieldProps> {
  public render(): JSX.Element {
    return (
      <div className={style.boolValue}>
        <input
          className={style.boolValue__input}
          type='checkbox'
          checked={this.props.data.value}
          onChange={this.onChange}
        />

        <span className={style.boolValue__value}>
          { this.props.data.value ? 'true' : 'false' }
        </span>
      </div>
    )
  }

  public onChange = (e: any) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.data, e.target.checked, e)
    }
  }
}
