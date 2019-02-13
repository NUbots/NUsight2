import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { ScriptTunerController } from '../controller'
import { ScriptTunerModel } from '../model'

import { EditorController } from './controller'
import { LineEditorController } from './line/controller'
import { LineEditor } from './line/view'
import * as style from './style.css'
import { Timeline } from './timeline/view'
import { EditorViewModel } from './view_model'

type EditorProps = {
  className?: string
  controller: ScriptTunerController
  model: ScriptTunerModel
}

@observer
export class Editor extends React.Component<EditorProps> {
  props: EditorProps
  timelineElement?: HTMLDivElement
  bodyElement?: HTMLDivElement
  controller?: EditorController

  constructor(props: EditorProps) {
    super(props)
    this.props = props
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onDocumentKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onDocumentKeydown)
  }

  onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.code === 'Space' && this.props.model.selectedScript) {
      this.props.controller.togglePlayback()
    }
  }

  render() {
    const { className, model } = this.props
    const viewModel = EditorViewModel.of(model)
    this.controller = EditorController.of({
      viewModel,
      controller: this.props.controller,
    })

    return <div className={classNames([className, style.editor])}>
      <div className={style.editorHeader}>
        <div className={style.editorTitle}>
          { model.selectedScript ? `${model.selectedScript.path} – Editor` : 'Editor' }
        </div>
        { model.selectedScript && <div className={style.editorControls}>
            <button title='Jump to start' onClick={this.jumpToStart}>
              <svg width='24' height='24' viewBox='0 0 24 24'>
                <path d='M6 6h2v12H6zm3.5 6l8.5 6V6z'/><path d='M0 0h24v24H0z' fill='none'/>
              </svg>
            </button>
            <button title={model.isPlaying ? 'Pause' : 'Play'} onClick={this.togglePlayback}>
              <svg width='24' height='24' viewBox='0 0 24 24'>
                {
                  model.isPlaying
                    ? <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/>
                    : <path d='M8 5v14l11-7z'/>
                }
              </svg>
            </button>
            <button title='Jump to end' onClick={this.jumpToEnd}>
              <svg width='24' height='24' viewBox='0 0 24 24'>
                <path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'/><path d='M0 0h24v24H0z' fill='none'/>
              </svg>
            </button>
            <button title='Zoom in' onClick={this.zoomIn}>+</button>
            <button title='Zoom out' onClick={this.zoomOut}>-</button>
          </div>
        }
      </div>

      { model.selectedScript === undefined &&
        <div className={style.editorEmpty}>Select a script to edit</div>
      }

      { model.selectedScript && <Timeline
          className={style.editorTimeline}
          setPlayTime={this.controller.setPlayTime}
          editorViewModel={viewModel}
          ref={this.onTimelineRef}
        />
      }

      { model.selectedScript && <div className={style.editorBody} ref={this.onBodyRef}>
          {
            model.selectedScriptServos.map((servo, index) => {
              const controller = LineEditorController.of(servo)
              return <LineEditor
                controller={controller}
                servo={servo}
                editorViewModel={viewModel}
                key={index}
              />
            })
          }
        </div>
      }
    </div>
  }

  onTimelineRef = (timelineComponent: Timeline | null) => {
    if (timelineComponent) {
      const timelineElement = ReactDOM.findDOMNode(timelineComponent) as HTMLDivElement

      if (timelineElement) {
        timelineElement.addEventListener('scroll', this.onBodyScroll, { passive: true })
        this.timelineElement = timelineElement
      }
    } else {
      this.timelineElement = undefined
    }
  }

  onBodyRef = (bodyElement: HTMLDivElement | null) => {
    if (bodyElement) {
      bodyElement.addEventListener('scroll', this.onBodyScroll, { passive: true })
      this.bodyElement = bodyElement
    } else {
      this.bodyElement = undefined
    }
  }

  onTimelineScroll = (event: UIEvent) => {
    if (this.bodyElement) {
      this.bodyElement.scrollLeft = (event.currentTarget as HTMLDivElement).scrollLeft
    }
  }

  onBodyScroll = (event: UIEvent) => {
    if (this.timelineElement) {
      this.timelineElement.scrollLeft = (event.currentTarget as HTMLDivElement).scrollLeft
    }
  }

  private jumpToStart = () => {
    if (this.controller) {
      this.controller.jumpToStart()
    }
  }

  private togglePlayback = () => {
    if (this.controller) {
      this.controller.togglePlayback()
    }
  }

  private jumpToEnd = () => {
    if (this.controller) {
      this.controller.jumpToEnd()
    }
  }

  private zoomIn = () => {
    if (this.controller) {
      this.controller.zoomIn()
    }
  }

  private zoomOut = () => {
    if (this.controller) {
      this.controller.zoomOut()
    }
  }
}
