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
  timelineRef: React.RefObject<Timeline>
  bodyRef: React.RefObject<HTMLDivElement>

  constructor(props: EditorProps) {
    super(props)
    this.props = props
    this.timelineRef = React.createRef()
    this.bodyRef = React.createRef()
  }

  render() {
    const { className, model } = this.props
    const viewModel = EditorViewModel.of(model)
    const controller = EditorController.of(viewModel)

    return <div className={classNames([className, style.editor])}>
      <div className={style.editorHeader}>
        <div className={style.editorTitle}>Editor</div>
        <div className={style.editorControls}>
          <button title='Jump to start' onClick={() => controller.jumpToStart() }>
            <svg width='24' height='24' viewBox='0 0 24 24'>
              <path d='M6 6h2v12H6zm3.5 6l8.5 6V6z'/><path d='M0 0h24v24H0z' fill='none'/>
            </svg>
          </button>
          <button title='Pause' onClick={() => controller.togglePlayback() }>
            <svg width='24' height='24' viewBox='0 0 24 24'>
              {
                viewModel.isPlaying
                  ? <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/>
                  : <path d='M8 5v14l11-7z'/>
              }
            </svg>
          </button>
          <button title='Jump to end' onClick={() => controller.jumpToEnd() }>
            <svg width='24' height='24' viewBox='0 0 24 24'>
              <path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'/><path d='M0 0h24v24H0z' fill='none'/>
            </svg>
          </button>
        </div>
      </div>

      <Timeline
        className={style.editorTimeline}
        setCurrentTime={controller.setCurrentTime}
        editorViewModel={viewModel}
        ref={this.timelineRef}
      />

      <div className={style.editorBody} ref={this.bodyRef}>
        {
          model.servos.map((servo, index) => {
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
    </div>
  }

  componentDidMount() {
    const timelineElement = ReactDOM.findDOMNode(this.timelineRef.current!) as HTMLDivElement
    const bodyElement = this.bodyRef.current!

    timelineElement.addEventListener('scroll', this.onTimelineScroll, { passive: true })
    bodyElement.addEventListener('scroll', this.onBodyScroll, { passive: true })
  }

  componentWillUnmount() {
    const timelineElement = ReactDOM.findDOMNode(this.timelineRef.current!) as HTMLDivElement
    const bodyElement = this.bodyRef.current!

    timelineElement.removeEventListener('scroll', this.onTimelineScroll)
    bodyElement.removeEventListener('scroll', this.onBodyScroll)
  }

  onTimelineScroll = (event: UIEvent) => {
    this.bodyRef.current!.scrollLeft = (event.currentTarget as HTMLDivElement).scrollLeft
  }

  onBodyScroll = (event: UIEvent) => {
    const timelineElement = ReactDOM.findDOMNode(this.timelineRef.current!) as HTMLDivElement
    timelineElement.scrollLeft = (event.currentTarget as HTMLDivElement).scrollLeft
  }
}
