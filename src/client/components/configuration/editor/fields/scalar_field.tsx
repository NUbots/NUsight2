import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './scalar_field.css'

import { BoolValue } from '../values/bool_value'
import { FieldProps } from '../editor'
import { NumberValue } from '../values/number_value'
import { StringValue } from '../values/string_value'

@observer
export class ScalarField extends React.Component<FieldProps, void> {
  public render(): JSX.Element {
    const field = this.props.data
    return (
      <label className={style.scalarField}>
        <span className={style.scalarField__label} title={this.props.data.path}>{ this.props.data.name }</span>
        <div className={style.scalarField__value}>
          { field.type === 'BOOL_VALUE' &&
            <BoolValue data={field} onChange={this.props.onChange} />
          }
          { (field.type === 'INT_VALUE' || field.type === 'DOUBLE_VALUE') &&
            <NumberValue data={field} onChange={this.props.onChange} />
          }
          { field.type === 'STRING_VALUE' && <StringValue data={field} onChange={this.props.onChange} /> }
        </div>
      </label>
    )
  }
}
