import * as React from 'react'
import * as style from './style.css'

export interface ViewProps {
  title: string
  className?: string
  headerClassName?: string
  bodyClassName?: string
  leftMenu?: JSX.Element
  rightMenu?: JSX.Element
}

export class View extends React.Component<ViewProps> {
  public static defaultProps: Partial<ViewProps> = {
    className: '',
    headerClassName: '',
    bodyClassName: '',
  }

  public render(): JSX.Element {
    return (
      <div className={style.view + ' ' + this.props.className}>
        <div className={style.view__header + ' ' + this.props.headerClassName}>
          <div className={style.view__title}>{ this.props.title }</div>

          { this.props.leftMenu !== undefined &&
            <div className={style.view__leftMenu}>{ this.props.leftMenu }</div>
          }

          { this.props.rightMenu !== undefined &&
            <div className={style.view__rightMenu}>{ this.props.rightMenu }</div>
          }
        </div>

        <div className={style.view__body + ' ' + this.props.bodyClassName}>
          { this.props.children }
        </div>
      </div>
    )
  }
}
