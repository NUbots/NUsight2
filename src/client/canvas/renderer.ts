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
import { Object2d } from './object/object2d'
import { Group } from './object/group'
import { Scene } from './object/scene'
import { Shape } from './object/shape'

export class CanvasRenderer {
  constructor(private context: CanvasRenderingContext2D) {
  }

  public static of(context: CanvasRenderingContext2D): CanvasRenderer {
    return new CanvasRenderer(context)
  }

  public render(scene: Scene, camera: Transform): void {
    const canvas = this.context.canvas
    const translateDash = Vector2.from(camera.translate).applyTransform({
      rotate: -camera.rotate,
      scale: {
        x: 1 / camera.scale.x,
        y: 1 / camera.scale.y,
      },
      translate: {
        x: 0,
        y: 0,
      },
    })

    this.context.clearRect(0, 0, canvas.width, canvas.height)

    this.context.save()
    this.context.scale(camera.scale.x, camera.scale.y)
    this.context.rotate(-camera.rotate)
    this.context.translate(translateDash.x, translateDash.y)

    this.renderObjects(scene.children, camera)

    this.context.restore()
  }

  private renderObjects(objects: Object2d[], camera: Transform) {
    for (const obj of objects) {
      this.context.save()
      const translateDash = Vector2.from(obj.transform.translate).applyTransform({
        rotate: -obj.transform.rotate,
        scale: {
          x: 1 / obj.transform.scale.x,
          y: 1 / obj.transform.scale.y,
        },
        translate: {
          x: 0,
          y: 0,
        },
      })
      this.context.scale(obj.transform.scale.x, obj.transform.scale.y)
      this.context.rotate(-obj.transform.rotate)
      this.context.translate(translateDash.x, translateDash.y)
      if (obj instanceof Group) {
        this.renderObjects(obj.children, camera)
      } else if (obj instanceof Shape) {
        // TODO Annable help Olejniczak: Fix text transform with obj rotate
        this.renderShape(obj, camera)
      }
      this.context.restore()
    }
  }

  private renderShape(shape: Shape, camera: Transform): void {
    const { appearance, geometry } = shape
    if (geometry instanceof ArrowGeometry) {
      this.renderArrow({ appearance, geometry })
    } else if (geometry instanceof CircleGeometry) {
      this.renderCircle({ appearance, geometry })
    } else if (geometry instanceof LineGeometry) {
      this.renderLine({ appearance, geometry })
    } else if (geometry instanceof MarkerGeometry) {
      this.renderMarker({ appearance, geometry })
    } else if (geometry instanceof PolygonGeometry) {
      this.renderPolygon({ appearance, geometry })
    } else if (geometry instanceof TextGeometry) {
      this.renderText({ appearance, camera, geometry })
    }
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

  private renderArrow(opts: { appearance: Appearance, geometry: ArrowGeometry, }): void {
    const { appearance, geometry } = opts
    const width = geometry.width * 0.5
    const headLength = geometry.headLength * 0.5
    const headWidth = geometry.headWidth * 0.5

    this.context.save()
    this.context.translate(geometry.origin.x, geometry.origin.y)
    this.context.rotate(Math.atan2(geometry.direction.y, geometry.direction.x))

    // Draw the arrow facing the positive x-axis.
    this.context.beginPath()
    this.context.moveTo(0, -width)
    this.context.lineTo(geometry.length - headLength, -width)
    this.context.lineTo(geometry.length - headLength, -headWidth)
    this.context.lineTo(geometry.length, 0)
    this.context.lineTo(geometry.length - headLength, headWidth)
    this.context.lineTo(geometry.length - headLength, width)
    this.context.lineTo(0, width)
    this.context.closePath()

    this.applyAppearance(appearance)

    this.context.stroke()
    this.context.fill()
    this.context.restore()
  }

  private renderCircle(opts: { appearance: Appearance, geometry: CircleGeometry, }): void {
    const { appearance, geometry } = opts

    this.context.beginPath()
    this.context.arc(
      geometry.x,
      geometry.y,
      geometry.radius,
      0,
      2 * Math.PI,
    )

    this.applyAppearance(appearance)
    this.context.fill()
    this.context.stroke()
  }

  private renderLine(opts: { appearance: Appearance, geometry: LineGeometry, }): void {
    const { appearance, geometry } = opts

    this.context.beginPath()
    this.context.moveTo(geometry.origin.x, geometry.origin.y)
    this.context.lineTo(geometry.target.x, geometry.target.y)

    this.applyAppearance(appearance)
    this.context.stroke()
  }

  private renderMarker(opts: { appearance: Appearance, geometry: MarkerGeometry, }): void {
    const { appearance, geometry } = opts
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
      endAngle,
    )
    // The diagonal length of a unit square.
    const sqrt2 = Math.sqrt(2)
    // Convert the heading to absolute canvas coordinates.
    this.context.lineTo(
      position.x + sqrt2 * geometry.radius * geometry.heading.x,
      position.y + sqrt2 * geometry.radius * geometry.heading.y,
    )
    this.context.closePath()

    this.applyAppearance(appearance)
    this.context.fill()
    this.context.stroke()
  }

  private renderPolygon(opts: { appearance: Appearance, geometry: PolygonGeometry, }): void {
    const { appearance, geometry } = opts

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

  private renderText(opts: { appearance: Appearance, camera: Transform, geometry: TextGeometry, }): void {
    const { appearance, camera, geometry } = opts
    const position = Vector2.from(geometry)
    const maxWidth = geometry.maxWidth === -1 ? undefined : geometry.maxWidth

    this.context.font = `1em ${geometry.fontFamily}`
    this.context.textAlign = geometry.textAlign
    this.context.textBaseline = geometry.textBaseline

    const textWidth = this.context.measureText(geometry.text).width
    const scale = maxWidth ? (maxWidth / textWidth) : geometry.scale.x
    this.context.font = `${scale}em ${geometry.fontFamily}`

    if (geometry.alignToView) {
      // Ensure the text is always rendered without rotation such that it is aligned with the screen.
      this.context.save()
      this.context.scale(Math.sign(camera.scale.x), Math.sign(camera.scale.y))
      this.context.rotate(-camera.rotate)
      position.applyTransform(new Transform({
        rotate: -camera.rotate,
        scale: { x: Math.sign(camera.scale.x), y: Math.sign(camera.scale.y) },
        translate: { x: 0, y: 0 },
      }))
    }
    this.context.translate(position.x, position.y)

    this.applyAppearance(appearance)
    this.context.fillText(geometry.text, 0, 0)

    if (geometry.alignToView) {
      this.context.restore()
    }
  }
}
