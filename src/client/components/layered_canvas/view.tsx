import * as React from 'react'
import * as style from './style.css'
import { LayeredCanvasModel } from './model'

export interface LayeredCanvasProps {
  model: LayeredCanvasModel
}

export interface Layer {
  name: string
  type: string // TODO farrawell, why does string litterals fail '2d' | 'webgl' | 'experimental-webgl'
  visible: boolean
  group?: string
  context?: CanvasRenderingContext2D | WebGLRenderingContext | null
  webglAttributes?: WebGLContextAttributes
}

export interface LayerOptions {
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
            this.props.model.layers.filter(layer => layer.visible).map((layer, index) => {
              return (
                <canvas id={layer.name} className={style.layer_canvas} key={layer.name} ref={ canvas => {
                  if (canvas) {
                    layer.context = canvas.getContext(layer.type)
                  }
                }
                }/>
              )
            })
          }
        </div>
    )
  }
}
