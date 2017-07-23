import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './list_field.css'
import * as editorStyle from '../editor.css'
import * as classnames from 'classnames'

import { ConfigurationField, FieldProps } from '../editor'
import { MapField } from './map_field'
import { NumberValue } from '../values/number_value'
import { StringValue } from '../values/string_value'

@observer
export class ListField extends React.Component<FieldProps> {
  public render(): JSX.Element {
    return (
      <ul className={style.listField}>
        { this.props.data.name &&
          <div className={style.listField__header + ' ' + editorStyle.editorLine}>{ this.props.data.name }</div>
        }

        <div className={style.listField__subFields}>
          { this.props.data.value.map((field: ConfigurationField) => {
            switch (field.type) {
              case 'INT_VALUE':
              case 'DOUBLE_VALUE':
                return <li className={style.listField__subField + ' ' + editorStyle.editorLine} key={field.uid}>
                  <NumberValue data={field} onChange={this.props.onChange} />
                </li>
              case 'STRING_VALUE':
                return <li className={style.listField__subField + ' ' + editorStyle.editorLine} key={field.uid}>
                  <StringValue data={field} onChange={this.props.onChange} />
                </li>
              case 'MAP_VALUE':
                return <li className={style.listField__subField + ' ' + editorStyle.editorLine} key={field.uid}>
                  <MapField data={field} onChange={this.props.onChange} />
                </li>
              case 'LIST_VALUE':
                const classes = classnames(
                  style.listField__subField, editorStyle.editorLine, editorStyle.editorLine__nestedList
                )
                return <li className={classes} key={field.uid}>
                  <ListField data={field} onChange={this.props.onChange} />
                </li>
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
