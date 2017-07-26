import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './editor.css'

import { ListField } from './fields/list_field'
import { MapField } from './fields/map_field'
import { ScalarField } from './fields/scalar_field'
import { ConfigurationField, ConfigurationFile } from '../model'

export interface FieldProps {
  data: ConfigurationField,
  onChange?(field: ConfigurationField, newValue: any, e: any): void
}

export interface EditorProps {
  data: ConfigurationFile,
  onChange?(field: ConfigurationField, newValue: any, e: any): void
}

@observer
export class Editor extends React.Component<EditorProps> {
  public render(): JSX.Element {
    const field = this.props.data.content
    return (
      <div className={style.editor}>
        { field.type === 'MAP_VALUE' && <MapField data={field} onChange={this.props.onChange} /> }
        { field.type === 'LIST_VALUE' && <ListField data={field} onChange={this.props.onChange} /> }
        { (field.type === 'BOOL_VALUE' ||
           field.type === 'INT_VALUE' ||
           field.type === 'DOUBLE_VALUE' ||
           field.type === 'STRING_VALUE') &&
          <ScalarField data={field} onChange={this.props.onChange} />
        }
      </div>
    )
  }
}
