import { Transform } from '../math/transform'
import { Vector2 } from '../math/vector2'
import { Appearance } from './appearance/appearance'
import { BasicAppearance } from './appearance/basic_appearance'
import { LineAppearance } from './appearance/line_appearance'
import { ArrowGeometry } from './geometry/arrow_geometry'
import { CircleGeometry } from './geometry/circle_geometry'
import { LineGeometry } from './geometry/line_geometry'
import { MarkerGeometry } from './geometry/marker_geometry'
import { PolygonGeometry } from './geometry/polygon_geometry'
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
    const translateDash = Vector2.from(transform.translate).applyTransform({
      rotate: -transform.rotate,
      scale: {
        x: 1 / transform.scale.x,
        y: 1 / transform.scale.y
      },
      translate: {
        x: 0,
        y: 0
      }
    })

    this.context.clearRect(0, 0, canvas.width, canvas.height)

    this.context.save()
    this.context.scale(transform.scale.x, transform.scale.y)
    this.context.rotate(-transform.rotate)
    this.context.translate(translateDash.x, translateDash.y)

    const renderObjects = (objects: Scene) => {
      for (const obj of objects) {
        if (Array.isArray(obj)) {
          renderObjects(obj)
          continue
        }
        // if (obj.geometry instanceof ArrowGeometry) {
        //   this.renderArrow(obj, transform)
        //   continue
        // }
        if (obj.geometry instanceof CircleGeometry) {
          this.renderCircle(obj)
          continue
        }
        if (obj.geometry instanceof LineGeometry) {
          this.renderLine(obj)
          continue
        }
        if (obj.geometry instanceof MarkerGeometry) {
          this.renderMarker(obj)
          continue
        }
        if (obj.geometry instanceof PolygonGeometry) {
          this.renderPolygon(obj)
          continue
        }
        if (obj.geometry instanceof TextGeometry) {
          this.renderText(obj)
          continue
        }
      }
    }
    renderObjects(scene)
    this.context.restore()
  }

  private applyAppearance(appearance: Appearance): void {
    if (appearance instanceof BasicAppearance) {
      this.applyBasicAppearance(appearance)
    }
    if (appearance instanceof LineAppearance) {
      this.applyLineAppearance(appearance)
    }
  }

  private applyBasicAppearance(appearance: BasicAppearance): void {
    this.context.fillStyle = appearance.fillStyle
    this.context.lineWidth = appearance.lineWidth
    this.context.strokeStyle = appearance.strokeStyle
  }

  private applyLineAppearance(appearance: LineAppearance): void {
    this.context.lineCap = appearance.lineCap
    this.context.lineDashOffset = appearance.lineDashOffset
    this.context.lineJoin = appearance.lineJoin
    this.context.lineWidth = appearance.lineWidth
    this.context.strokeStyle = appearance.strokeStyle
  }

  private renderArrow(shape: Shape<ArrowGeometry>, transform: Transform): void {
    const { geometry, appearance } = shape
    // const position = Vector2.of(geometry.origin.y, geometry.origin.x).applyTransform(transform)
    // const direction = Vector2.of(geometry.direction.y, geometry.direction.x)
    // const target = position.clone().add(direction.clone().multiplyScalar(geometry.length * transform.scale))
    //
    const headLength = geometry.headLength * 0.5
    const headWidth = geometry.headWidth * 0.5

    this.context.save()
    this.context.rotate(Math.atan2(geometry.direction.x, geometry.direction.y))
    this.context.translate(geometry.origin.y, geometry.origin.x)

    this.context.beginPath()
    this.context.moveTo(0, 0)
    this.context.lineTo(0, -geometry.length)
    this.context.lineTo(-headWidth, -geometry.length + headLength)
    this.context.moveTo(0, -geometry.length)
    this.context.lineTo(headWidth, -geometry.length + headLength)

    this.applyAppearance(appearance)

    this.context.stroke()
    this.context.restore()
  }

  private renderCircle(shape: Shape<CircleGeometry>): void {
    const { geometry, appearance } = shape

    this.context.beginPath()
    this.context.arc(
      geometry.x,
      geometry.y,
      geometry.radius,
      0,
      2 * Math.PI
    )

    this.applyAppearance(appearance)
    this.context.fill()
    this.context.stroke()
  }

  private renderLine(shape: Shape<LineGeometry>): void {
    const { geometry, appearance } = shape

    this.context.beginPath()
    this.context.moveTo(geometry.origin.x, geometry.origin.y)
    this.context.lineTo(geometry.target.x, geometry.target.y)

    this.applyAppearance(appearance)
    this.context.stroke()
  }

  private renderMarker(shape: Shape<MarkerGeometry>): void {
    const { geometry, appearance } = shape
    const position = Vector2.of(geometry.x, geometry.y)

    const headingAngle = Math.atan2(geometry.heading.y, geometry.heading.x)
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
      geometry.radius,
      startAngle,
      endAngle
    )
    // Scales heading vector to bounding square.
    const sqrt2 = Math.sqrt(2)
    // Convert the heading to absolute canvas coordinates.
    this.context.lineTo(
      position.x + sqrt2 * geometry.radius * geometry.heading.x,
      position.y + sqrt2 * geometry.radius * geometry.heading.y
    )
    this.context.closePath()

    this.applyAppearance(appearance)
    this.context.fill()
    this.context.stroke()
  }

  private renderPolygon(shape: Shape<PolygonGeometry>): void {
    const { geometry, appearance } = shape

    this.context.beginPath()
    this.context.moveTo(geometry.points[0].x, geometry.points[0].y)
    for (const point of geometry.points.slice(0)) {
      this.context.lineTo(point.x, point.y)
    }
    this.context.closePath()

    this.applyAppearance(appearance)
    this.context.fill()
    this.context.stroke()
  }

  private renderText(shape: Shape<TextGeometry>): void {
    const { geometry, appearance } = shape
    const position = Vector2.of(geometry.x, geometry.y)
    const fontSize = geometry.fontSize === '100%' ? '1em' : geometry.fontSize
    const maxWidth = geometry.maxWidth === -1 ? undefined : geometry.maxWidth

    this.context.font = `${fontSize} ${geometry.fontFamily}`
    this.context.textAlign = geometry.textAlign
    this.context.textBaseline = geometry.textBaseline

    const textWidth = this.context.measureText(geometry.text).width
    const scaleX = maxWidth ? (maxWidth / textWidth) : 1

    this.context.save()
    this.context.scale(scaleX, scaleX)

    this.applyAppearance(appearance)
    this.context.fillText(
      geometry.text,
      position.x / scaleX,
      position.y / scaleX,
      maxWidth ? maxWidth / scaleX : maxWidth
    )
    this.context.restore()
  }
}
