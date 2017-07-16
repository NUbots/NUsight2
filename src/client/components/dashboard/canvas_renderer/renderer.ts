import { Vector2 } from '../../../math/vector2'

export type CircleProps = {
  lineWidth: number
  radius: number
  strokeStyle: string
  type: 'circle'
  x: number
  y: number
}

export type LineProps = {
  lineWidth: number
  origin: Vector2
  strokeStyle: string
  target: Vector2
  type: 'line'
}

export type RectangleProps = {
  height: number
  lineWidth: number
  strokeStyle: string
  type: 'rectangle'
  width: number
  x: number
  y: number
}

// TODO Monica fix typing here
export type Scene = Array<any>

// TODO Monica abstract away view from geometry props
export class CanvasRenderer {
  constructor(private context: CanvasRenderingContext2D) {}

  public static of(context: CanvasRenderingContext2D): CanvasRenderer {
    return new CanvasRenderer(context)
  }

  public render(scene: Scene): void {
    const context = this.context
    const renderObjects = (objects: Scene) => {
      for (const obj of objects) {
        if (Array.isArray(obj)) {
          renderObjects(obj)
          continue
        }
        if (obj.type === 'circle') {
          this.renderCircle(context, obj)
          continue
        }
        if (obj.type === 'line') {
          this.renderLine(context, obj)
          continue
        }
        if (obj.type === 'rectangle') {
          this.renderRectangle(context, obj)
          continue
        }
      }
    }
    renderObjects(scene)
  }

  public rotate(angle: number): void {
    this.context.rotate(angle)
  }

  public scale(width: number, height: number): void {
    this.context.scale(width, height)
  }

  public translate(x: number, y: number): void {
    this.context.translate(x, y)
  }

  private renderCircle(context: CanvasRenderingContext2D, props: CircleProps): void {
    context.beginPath()
    context.arc(props.x, props.y, props.radius, 0, 2 * Math.PI, false)
    context.fillStyle = 'transparent'
    context.lineWidth = props.lineWidth
    context.strokeStyle = props.strokeStyle
    context.fill()
    context.stroke()
  }

  private renderLine(context: CanvasRenderingContext2D, props: LineProps): void {
    const { origin, target } = props
    context.beginPath()
    context.moveTo(-origin.y, -origin.x)
    context.lineTo(-target.y, -target.x)
    context.fillStyle = 'transparent'
    context.strokeStyle = props.strokeStyle
    context.lineWidth = props.lineWidth
    context.fill()
    context.stroke()
  }

  private renderRectangle(context: CanvasRenderingContext2D, props: RectangleProps): void {
    context.beginPath()
    context.rect(-props.y, -props.x, props.width, props.height)
    context.fillStyle = 'transparent'
    context.lineWidth = props.lineWidth
    context.strokeStyle = props.strokeStyle
    context.fill()
    context.stroke()
  }

}
