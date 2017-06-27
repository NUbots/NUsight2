import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './map_field.css'

import { ConfigurationField, FieldProps } from '../editor'
import { ListField } from './list_field'
import { ScalarField } from './scalar_field'

@observer
export class MapField extends React.Component<FieldProps, void> {
  public render(): JSX.Element {
    return (
      <div className={style.mapField}>
        { this.props.data.name &&
          <div className={style.mapField__header}>{ this.props.data.name }</div>
        }

        <div className={style.mapField__subFields}>
          { Object.keys(this.props.data.value).map(fieldName => {
            const field: ConfigurationField = this.props.data.value[fieldName]

            switch (field.type) {
              case 'MAP_VALUE':
                return <MapField data={field} onChange={this.props.onChange} key={field.uid} />
              case 'LIST_VALUE':
                return <ListField data={field} onChange={this.props.onChange} key={field.uid}  />
              case 'BOOL_VALUE':
              case 'INT_VALUE':
              case 'DOUBLE_VALUE':
              case 'STRING_VALUE':
                return <ScalarField data={field} onChange={this.props.onChange} key={field.uid}  />
              default:
                // do nothing
            }
          })
          }
        </div>
      </div>
    )
  }
}
