import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './list_field.css'

import { ConfigurationField, FieldProps } from '../editor'
import { MapField } from './map_field'
import { NumberValue } from '../values/number_value'
import { StringValue } from '../values/string_value'

@observer
export class ListField extends React.Component<FieldProps, void> {
  public render(): JSX.Element {
    return (
      <ul className={style.listField}>
        { this.props.data.name &&
          <div className={style.listField__header}>{ this.props.data.name }</div>
        }

        <div className={style.listField__subFields}>
          { this.props.data.value.map((field: ConfigurationField) => {
            switch (field.type) {
              case 'INT_VALUE':
              case 'DOUBLE_VALUE':
                return <li key={field.uid}><NumberValue data={field} onChange={this.props.onChange} /></li>
              case 'STRING_VALUE':
                return <li key={field.uid}><StringValue data={field} onChange={this.props.onChange} /></li>
              case 'MAP_VALUE':
                return <li key={field.uid}><MapField data={field} onChange={this.props.onChange} /></li>
              case 'LIST_VALUE':
                return <li key={field.uid}><ListField data={field} onChange={this.props.onChange} /></li>
              default:
                // do nothing
            }
          })
          }
        </div>
      </ul>
    )
  }
}
