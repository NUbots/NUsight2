import * as React from 'react'
import * as style from './style.css'

export interface LayeredCanvasProps {
  layers: Layer[]
}

interface Layer {
  name: string
  hidden: boolean
  context: CanvasRenderingContext2D | WebGLRenderingContext
}

interface LayerOptions {
  context: HTMLCanvasElement
  group: string
}

export class LayeredCanvas extends React.Component<LayeredCanvasProps> {

  public constructor (props: LayeredCanvasProps, context: any) {
    super(props, context)
  }

  public render(): JSX.Element {
    return (
        <div>
          {
            this.props.layers.map(layer => {
              return (
                <canvas id={layer.name} className={style.layer_canvas}></canvas>
              )
            })
          }
        </div>
    )
  }
}
