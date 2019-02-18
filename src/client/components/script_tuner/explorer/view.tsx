import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { RobotModel } from '../../robot/model'
import { ScriptTunerController } from '../controller'
import { Script, ScriptTunerModel } from '../model'

import { ExplorerController } from './controller'
import { LoadingIcon } from './loading_icon/view'
import { RobotSelector } from './robot_selector/view'
import * as style from './style.css'

type ExplorerProps = {
  className?: string
  controller: ScriptTunerController
  model: ScriptTunerModel
}

@observer
export class Explorer extends React.Component<ExplorerProps> {
  render() {
    const { className, model } = this.props
    const controller = ExplorerController.of({
      controller: this.props.controller,
    })

    return <div className={classNames([className, style.explorer])}>
      <div className={style.explorerHeader}>
        <div className={style.explorerTitle}>Scripts</div>
      </div>
      <RobotSelector
        className={style.explorerRobotSelector}
        robots={model.robots}
        selected={model.sourceRobot}
        onSelect={controller.selectSourceRobot}
      />
      { model.isLoading &&
        <div className={style.explorerLoading}>
          <LoadingIcon className={style.explorerLoadingIcon} size={24} />
          <span>{ model.loadingMessage }</span>
        </div>
      }
      { !model.isLoading &&
        <div className={style.explorerBody}>
          { model.sourceRobot === undefined &&
            <div className={style.explorerEmpty}>Select a robot to view scripts</div>
          }
          { model.sourceRobot && model.scripts.length === 0 &&
            <div className={style.explorerEmpty}>No scripts for selected robot</div>
          }
          { model.sourceRobot && model.scripts.length > 0 &&
            <div className={style.explorerScripts}>{
              model.scripts.map(script => {
                const isSelected = Boolean(model.selectedScript &&  model.selectedScript.data.path === script.path)
                return <ScriptListItem
                  key={script.path}
                  script={script}
                  isSelected={isSelected}
                  onSelect={controller.selectScript}
                />
              })
            }</div>
          }
        </div>
      }
      { model.selectedScript &&
        <div className={style.explorerFooter}>
          <div className={style.explorerFooterGroup}>
            <span className={style.explorerFooterGroupLabel}>Target robot</span>
            <RobotSelector
              robots={model.robots}
              selected={model.targetRobot}
              onSelect={controller.selectTargetRobot}
              dropDirection='up'
            />
          </div>
          <div className={style.explorerFooterGroup}>
            <button
              className={style.explorerButton}
              disabled={!model.selectedScript.isDirty}
              onClick={controller.saveScript}
            >Save</button>
          </div>
        </div>
      }
    </div>
  }
}

@observer
export class ScriptListItem extends React.Component<{
  script: Script,
  isSelected: boolean,
  onSelect(script: Script): void
}> {
  render() {
    const { script, isSelected } = this.props
    return <div
      className={classNames([style.explorerScript, isSelected ? style.explorerScriptSelected : ''])}
      onClick={this.onClick}
    >{ script.path }</div>
  }

  private onClick = () => {
    this.props.onSelect(this.props.script)
  }
}
