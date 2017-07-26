import { observer } from 'mobx-react'
import * as React from 'react'
import * as style from './style.css'

import { ConfigurationController } from './controller'
import { Editor } from './editor/editor'
import { ConfigurationModel } from './model'
import { Panel } from './panel/panel'
import { Tree } from './tree/tree'
import { View } from './view/view'

interface ConfigurationViewProps {
  controller: ConfigurationController
  model: ConfigurationModel
}

@observer
export class ConfigurationView extends React.Component<ConfigurationViewProps> {
  private model: ConfigurationModel
  private controller: ConfigurationController

  public constructor(props: ConfigurationViewProps, context: any) {
    super(props, context)
    this.model = this.props.model
    this.controller = this.props.controller
  }

  public onSaveOnChangeChange = (e: any) => {
    this.controller.updateSaveOnChange(e.target.checked)
  }

  public render(): JSX.Element {
    const ConfigurationMenu = <div>
      <label className={style.configuration__saveCheckboxLabel}>
        <input type='checkbox' checked={this.model.saveOnChange} onChange={this.onSaveOnChangeChange}/>
        Save on change
      </label>

      { !this.model.saveOnChange &&
        <button>Save now</button>
      }
    </div>

    return (
      <View
        title='Configuration'
        className={style.configuration}
        bodyClassName={style.configuration__body}
        rightMenu={ConfigurationMenu}
      >
        <Panel title='Files' className={style.configuration__sidebar}>
          <Tree onClick={this.controller.onNodeClick} data={this.model.files} />
        </Panel>

        <div className={style.configuration__content}>
          { this.model.selectedFile === null ?
            <div className={style.configuration__contentPlaceholder}>Select a file to edit</div> :
            <Panel title={this.model.selectedFile.data!.path}>
              <Editor data={this.model.selectedFile.data!} onChange={this.controller.onEditorChange} />
            </Panel>
          }
        </div>
      </View>
    )
  }
}
