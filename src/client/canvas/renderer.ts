import { Transform } from '../math/transform'
import { Vector2 } from '../math/vector2'
import { Appearance } from './appearance/appearance'
import { BasicAppearance } from './appearance/basic_appearance'
import { LineAppearance } from './appearance/line_appearance'
import { CircleGeometry } from './geometry/circle_geometry'
import { LineGeometry } from './geometry/line_geometry'
import { MarkerGeometry } from './geometry/marker_geometry'
import { RectangleGeometry } from './geometry/rectangle_geometry'
import { TextGeometry } from './geometry/text_geometry'
import { Shape } from './object/shape'

// TODO Monica fix typing here
export type Scene = Array<any>

export class CanvasRenderer {
  constructor(private context: CanvasRenderingContext2D) {}

  public static of(context: CanvasRenderingContext2D): CanvasRenderer {
    return new CanvasRenderer(context)
  }

  public render(scene: Scene, transform: Transform): void {
    const canvas = this.context.canvas
    this.context.clearRect(0, 0, canvas.width, canvas.height)
    const renderObjects = (objects: Scene) => {
      for (const obj of objects) {
        if (Array.isArray(obj)) {
          renderObjects(obj)
          continue
        }
        if (obj.geometry instanceof CircleGeometry) {
          this.renderCircle(obj, transform)
          continue
        }
        if (obj.geometry instanceof LineGeometry) {
          this.renderLine(obj, transform)
          continue
        }
        if (obj.geometry instanceof MarkerGeometry) {
          this.renderMarker(obj, transform)
          continue
        }
        if (obj.geometry instanceof RectangleGeometry) {
          this.renderRectangle(obj, transform)
          continue
        }
        if (obj.geometry instanceof TextGeometry) {
          this.renderText(obj, transform)
          continue
        }
      }
    }
    renderObjects(scene)
  }

  private applyAppearance(appearance: Appearance, transform: Transform): void {
    if (appearance instanceof BasicAppearance) {
      this.applyBasicAppearance(appearance, transform)
    }
    if (appearance instanceof LineAppearance) {
      this.applyLineAppearance(appearance, transform)
    }
  }

  private applyBasicAppearance(appearance: BasicAppearance, transform: Transform): void {
    this.context.fillStyle = appearance.fillStyle
    this.context.lineWidth = appearance.lineWidth * transform.scale
    this.context.strokeStyle = appearance.strokeStyle
  }

  private applyLineAppearance(appearance: LineAppearance, transform: Transform): void {
    this.context.lineCap = appearance.lineCap
    this.context.lineDashOffset = appearance.lineDashOffset
    this.context.lineJoin = appearance.lineJoin
    this.context.lineWidth = appearance.lineWidth * transform.scale
    this.context.strokeStyle = appearance.strokeStyle
  }

  private renderCircle(shape: Shape<CircleGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    const position = Vector2.of(geometry.y, geometry.x).applyTransform(transform)

    this.context.beginPath()
    this.context.arc(
      position.x,
      position.y,
      geometry.radius * transform.scale,
      0,
      2 * Math.PI
    )

    this.applyAppearance(appearance, transform)
    this.context.fill()
    this.context.stroke()
  }

  private renderLine(shape: Shape<LineGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    const origin = Vector2.of(geometry.origin.y, geometry.origin.x).applyTransform(transform)
    const target = Vector2.of(geometry.target.y, geometry.target.x).applyTransform(transform)

    this.context.beginPath()
    this.context.moveTo(origin.x, origin.y)
    this.context.lineTo(target.x, target.y)

    this.applyAppearance(appearance, transform)
    this.context.stroke()
  }

  private renderMarker(shape: Shape<MarkerGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    const position = Vector2.of(geometry.y, geometry.x).applyTransform(transform)
    const headingTransform = Transform.of({ rotate: transform.rotate })
    const heading = Vector2.of(geometry.heading.y, geometry.heading.x)
      .applyTransform(headingTransform)
      .normalize()
    const radius = geometry.radius * transform.scale

    const headingAngle = Math.atan2(heading.y, heading.x)
    const arcDistance = 3 * Math.PI * 0.5
    // By default, the arc startAngle begins on the positive x-axis and rotates clockwise. If the startAngle and
    // endAngle are offset by a quadrant, the arc will point toward the positive x-axis instead of starting there.
    const startAngleOffset = Math.PI * 0.25
    const startAngle = headingAngle + startAngleOffset
    const endAngle = headingAngle + arcDistance + startAngleOffset

    this.context.beginPath()
    this.context.arc(
      position.x,
      position.y,
      radius,
      startAngle,
      endAngle
    )
    // Scales heading vector to bounding square.
    const sqrt2 = Math.sqrt(2)
    // Convert the heading to absolute canvas coordinates.
    this.context.lineTo(
      position.x + sqrt2 * radius * heading.x,
      position.y + sqrt2 * radius * heading.y
    )
    this.context.closePath()

    this.applyAppearance(appearance, transform)
    this.context.fill()
    this.context.stroke()
  }

  private renderRectangle(shape: Shape<RectangleGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    const topLeft = Vector2.of(geometry.y, geometry.x).applyTransform(transform)
    const topRight = Vector2.of(geometry.y - geometry.width, geometry.x).applyTransform(transform)
    const bottomRight = Vector2.of(geometry.y - geometry.width, geometry.x - geometry.height).applyTransform(transform)
    const bottomLeft = Vector2.of(geometry.y, geometry.x - geometry.height).applyTransform(transform)

    this.context.beginPath()
    this.context.moveTo(topLeft.x, topLeft.y)
    this.context.lineTo(topRight.x, topRight.y)
    this.context.lineTo(bottomRight.x, bottomRight.y)
    this.context.lineTo(bottomLeft.x, bottomLeft.y)
    this.context.closePath()

    this.applyAppearance(appearance, transform)
    this.context.fill()
    this.context.stroke()
  }

  private renderText(shape: Shape<TextGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    const position = Vector2.of(geometry.y, geometry.x).applyTransform(transform)
    const maxWidth = geometry.maxWidth === -1 ? undefined : geometry.maxWidth * transform.scale

    this.context.font = geometry.font
    this.context.textAlign = geometry.textAlign
    this.context.textBaseline = geometry.textBaseline

    this.applyAppearance(appearance, transform)
    this.context.fillText(geometry.text, position.x, position.y, maxWidth)
  }
}
