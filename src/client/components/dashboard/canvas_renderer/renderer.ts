import { Vector2 } from '../../../math/vector2'

export type CircleProps = {
  fillStyle?: string
  lineWidth?: number
  radius: number
  strokeStyle?: string
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
export type Camera = {
  rotate?: number
  scale?: number
  translate?: { x?: number, y?: number }
}

// TODO Monica abstract away view from geometry props
export class CanvasRenderer {
  constructor(private context: CanvasRenderingContext2D) {}

  public static of(context: CanvasRenderingContext2D): CanvasRenderer {
    return new CanvasRenderer(context)
  }

  public render(scene: Scene, camera: Camera = {}): void {
    const context = this.context
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.save()

    const scale = camera.scale || 1
    context.scale(scale, scale)

    const theta = camera.rotate || 0
    context.rotate(theta)

    // Use -theta here because context.rotate is using a clockwise system.
    const rotationMatrix = [
      Math.cos(-theta), -Math.sin(-theta),
      Math.sin(-theta), Math.cos(-theta)
    ]

    const translate = Object.assign({}, { x: 0, y: 0 }, camera.translate)
    const translateDash = Vector2.of(
      translate.x * rotationMatrix[0] + translate.y * rotationMatrix[1],
      translate.x * rotationMatrix[2] + translate.y * rotationMatrix[3]
    )
    .divideScalar(scale)

    context.translate(translateDash.x, translateDash.y)

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
    context.restore()
  }

  private renderCircle(context: CanvasRenderingContext2D, props: CircleProps): void {
    context.beginPath()
    context.arc(props.x, props.y, props.radius, 0, 2 * Math.PI, false)
    context.fillStyle = props.fillStyle || 'transparent'
    context.lineWidth = props.lineWidth || 0
    context.strokeStyle = props.strokeStyle || 'transparent'
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
