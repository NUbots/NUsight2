import * as THREE from 'three'

import { mesh } from '../../three/builders'
import { planeGeometry } from '../../three/builders'
import { rawShader } from '../../three/builders'
import { shaderMaterial } from '../../three/builders'
import { createUpdatableComputed } from '../../three/create_updatable_computed'
import { Canvas } from '../../three/three'
import { VisionImage } from '../camera/model'

import fragmentShader from './shaders/world_line.frag'
import vertexShader from './shaders/world_line.vert'

/** If start === end this will draw the entire cone. */
export interface ConeSegment {
  /** The normal axis of the plane. This is only needed if start and end are parallel or anti-parallel. */
  axis?: THREE.Vector3,
  /** The vector pointing to the start of the line segment. */
  start: THREE.Vector3,
  /** The vector pointing to the end of the line segment. */
  end: THREE.Vector3,
  /** The colour of the line to draw. */
  colour?: THREE.Vector4,
  /** The width of the line to draw on the screen in pixels. */
  lineWidth?: number
}

export class WorldLine {
  constructor(
    private readonly canvas: Canvas,
    private readonly image: VisionImage,
  ) {
  }

  static of(canvas: Canvas, image: VisionImage) {
    return new WorldLine(canvas, image)
  }

  /** Draws a segment of a plane projected to infinity in world space. */
  planeSegment(segment: ConeSegment) {
    return this.coneSegment({
      ...segment,
      axis: segment.axis || new THREE.Vector3().crossVectors(segment.start, segment.end).normalize(),
    })
  }

  makePlane({ axis, colour, lineWidth }: { axis: THREE.Vector3, colour?: THREE.Vector4, lineWidth?: number }) {
    // Pick an arbitrary orthogonal vector
    const start = (!axis.x && !axis.y) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(-axis.y, axis.x, 0).normalize()
    return this.coneSegment({ axis, start, end: start, colour, lineWidth })
  }

  readonly coneSegment = mesh((segment: ConeSegment) => ({
    geometry: WorldLine.geometry(),
    material: this.material(segment),
  }))

  /**
   * Draw a cone. Note that it only draws the positive cone, not the negative cone.
   *
   * @param axis      the axis of the cone to draw.
   * @param radius    the radius of the cone to draw (cos of the angle).
   * @param colour    the colour of the line to draw.
   * @param lineWidth the width of the line to draw on the screen in pixels.
   */
  cone({ axis, radius, colour, lineWidth }: {
    axis: THREE.Vector3,
    radius: number,
    colour?: THREE.Vector4,
    lineWidth?: number
  }) {

    // Pick an arbitrary orthogonal vector
    const orth = !axis.x && !axis.y ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(-axis.y, axis.x, 0).normalize()

    // Rotate our axis by this radius to get a start
    const start = axis.clone().applyAxisAngle(orth, Math.acos(radius))

    return this.coneSegment({ axis, start, end: start, colour, lineWidth })
  }

  private readonly material = shaderMaterial((segment: ConeSegment) => ({
    shader: WorldLine.shader,
    uniforms: {
      viewSize: { value: new THREE.Vector2(this.canvas.width, this.canvas.height) },
      focalLength: { value: this.image.lens.focalLength },
      centre: { value: new THREE.Vector2(this.image.lens.centre.x, this.image.lens.centre.y) },
      projection: { value: this.image.lens.projection },
      axis: { value: segment.axis },
      start: { value: segment.start },
      end: { value: segment.end },
      colour: { value: segment.colour },
      lineWidth: { value: segment.lineWidth },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  }))

  private static readonly shader = rawShader(() => ({ vertexShader, fragmentShader }))

  private static readonly geometry = planeGeometry(() => ({ width: 2, height: 2 }))

}

export const coneSegment = createUpdatableComputed(
  (opts: ConeSegment) => ({ ...opts }),
  (segment, opts) => {
    segment.axis = opts.axis
    segment.start = opts.start
    segment.end = opts.end
    segment.colour = opts.colour
    segment.lineWidth = opts.lineWidth
  },
)
