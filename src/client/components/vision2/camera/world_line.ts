import * as THREE from 'three'

import { Vector2 } from '../../../math/vector2'
import { Vector3 } from '../../../math/vector3'
import { Vector4 } from '../../../math/vector4'
import { mesh } from '../../three/builders'
import { planeGeometry } from '../../three/builders'
import { rawShader } from '../../three/builders'
import { shaderMaterial } from '../../three/builders'
import { createUpdatableComputed } from '../../three/create_updatable_computed'
import { Canvas } from '../../three/three'

import { Lens } from './model'
import fragmentShader from './shaders/world_line.frag'
import vertexShader from './shaders/world_line.vert'

export interface ConeSegment {
  /** The normal axis of the plane in camera space. Only needed if start and end are parallel or anti-parallel. */
  axis?: Vector3,
  /** The camera space vector pointing to the start of the line segment. */
  start: Vector3,
  /** The camera space kvector pointing to the end of the line segment. */
  end: Vector3,
  /** The colour of the line to draw. */
  color?: Vector4,
  /** The width of the line to draw on the screen in pixels. */
  lineWidth?: number
}

export class WorldLine {
  constructor(
    private readonly canvas: Canvas,
    private readonly lens: Lens,
  ) {
  }

  static of(canvas: Canvas, lens: Lens) {
    return new WorldLine(canvas, lens)
  }

  /** Draws a plane projected to infinity in world space. */
  plane({ axis, color, lineWidth }: { axis: Vector3, color?: Vector4, lineWidth?: number }) {
    // Pick an arbitrary orthogonal vector
    const start = Vector3.fromThree(
      (!axis.x && !axis.y)
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(-axis.y, axis.x, 0).normalize(),
    )
    return this.coneSegment({ axis, start, end: start, color, lineWidth })
  }

  /** Draws a segment of a plane projected to infinity in world space. */
  planeSegment(segment: ConeSegment) {
    return this.coneSegment({
      ...segment,
      axis: segment.axis || Vector3.fromThree(
        new THREE.Vector3().crossVectors(
          segment.start.toThree(),
          segment.end.toThree(),
        ).normalize(),
      ),
    })
  }

  /**
   * Draw a cone projected to infinity in world space.
   * Note that it only draws the positive cone, not the negative cone.
   *
   * @param axis      the camera space axis of the cone to draw.
   * @param radius    the radius of the cone to draw (cos of the angle).
   * @param color     the color of the line to draw.
   * @param lineWidth the width of the line to draw on the screen in pixels.
   */
  cone({ axis, radius, color, lineWidth }: {
    axis: Vector3,
    radius: number,
    color?: Vector4,
    lineWidth?: number
  }) {

    // Pick an arbitrary orthogonal vector
    const orth = !axis.x && !axis.y ? new Vector3(0, 1, 0) : new Vector3(-axis.y, axis.x, 0).normalize()

    // Rotate our axis by this radius to get a start
    const start = Vector3.fromThree(axis.toThree().applyAxisAngle(orth.toThree(), Math.acos(radius)))

    return this.coneSegment({ axis, start, end: start, color, lineWidth })
  }

  readonly coneSegment = mesh((segment: ConeSegment) => ({
    geometry: WorldLine.geometry(),
    material: this.material(segment),
  }))

  private readonly material = shaderMaterial((segment: ConeSegment) => {
    const {
      projection,
      focalLength,
      centre = Vector2.of(),
      distortionCoeffecients = Vector2.of(),
    } = this.lens
    return {
      shader: WorldLine.shader,
      uniforms: {
        viewSize: { value: new THREE.Vector2(this.canvas.width, this.canvas.height) },
        projection: { value: projection },
        focalLength: { value: focalLength },
        centre: { value: centre.toThree() },
        k: { value: distortionCoeffecients.toThree() },
        axis: { value: segment.axis?.toThree() },
        start: { value: segment.start.toThree() },
        end: { value: segment.end.toThree() },
        color: { value: segment.color?.toThree() },
        lineWidth: { value: segment.lineWidth },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
    }
  })

  private static readonly shader = rawShader(() => ({ vertexShader, fragmentShader }))

  private static readonly geometry = planeGeometry(() => ({ width: 2, height: 2 }))

}

export const coneSegment = createUpdatableComputed(
  (opts: ConeSegment) => ({ ...opts }),
  (segment, opts) => {
    segment.axis = opts.axis
    segment.start = opts.start
    segment.end = opts.end
    segment.color = opts.color
    segment.lineWidth = opts.lineWidth
  },
)
