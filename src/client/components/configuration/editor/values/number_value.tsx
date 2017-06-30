import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './number_value.css'

import { FieldProps } from '../editor'

@observer
export class NumberValue extends React.Component<FieldProps> {
  public render(): JSX.Element {
    return (
      <div className={style.numberValue}>
        <input
          className={style.numberValue__input}
          type='number'
          value={this.props.data.value}
          onChange={this.onChange}
        />
      </div>
    )
  }

  public onChange = (e: any) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.data, e.target.value, e)
    }
  }
}
