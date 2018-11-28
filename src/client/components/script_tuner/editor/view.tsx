import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { ScriptTunerController } from '../controller'
import { ScriptTunerModel } from '../model'

import { LineEditorController } from './line/controller'
import { LineEditor } from './line/view'
import * as style from './style.css'
import { Timeline } from './timeline/view'

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
    const { className, controller, model } = this.props
    const lineEditorController = LineEditorController.of()

    return <div className={classNames([className, style.editor])}>
      <div className={style.editorHeader}>Editor</div>
      <Timeline className={style.editorTimeline} length={90} ref={this.timelineRef} />
      <div className={style.editorBody} ref={this.bodyRef}>
        {
          model.servos.map((servo, index) => <LineEditor controller={lineEditorController} servo={servo} key={index} />)
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
