import * as React from 'react'
import * as style from './style.css'

export interface PanelProps {
  title: string
  className?: string
}

export class Panel extends React.Component<PanelProps> {
  public static defaultProps: Partial<PanelProps> = {
    className: '',
  }

  public render(): JSX.Element {
    return (
      <div className={style.panel + ' ' + this.props.className}>
        <div className={style.panel__header}>
          <div className={style.panel__title}>{ this.props.title }</div>
        </div>

        <div className={style.panel__body}>{ this.props.children }</div>
      </div>
    )
  }
}
