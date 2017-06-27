import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './string_value.css'

import { FieldProps } from '../editor'

@observer
export class StringValue extends React.Component<FieldProps, void> {
  public render(): JSX.Element {
    return (
      <div className={style.stringValue}>
        <input
          className={style.stringValue__input}
          type='text'
          value={this.props.data.value}
          onChange={this.props.onChange}
        />
      </div>
    )
  }
}
