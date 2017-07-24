import { observable } from 'mobx'
import { Mesh } from 'three'
import { MeshLambertMaterial } from 'three'
import { Object3D } from 'three'
import { SphereGeometry } from 'three'
import { Vector3 } from 'three'

export class BallModel extends Object3D {
  @observable public mesh: Mesh
  @observable public name: string
  @observable public position: Vector3

  public constructor(mesh: Mesh, position: Vector3, name: string) {
    super()

    this.mesh = mesh
    this.name = name
    this.position.copy(position)

    this.add(this.mesh)
  }

  public static of(opts: BallModelOpts = {}) {
    let mesh = opts.mesh;

    // Create the mesh if not given one
    if (!mesh) {
      const radius = opts.radius || 0.0335
      const segments = 16
      const rings = 16
      const color = opts.color || '#FFCC00'

      // Create the sphere geometry
      const geometry = new SphereGeometry(radius, segments, rings)

      // Create a material
      const material = new MeshLambertMaterial({
        color
      })

      // Create the sphere mesh with its geometry and specified material
      mesh = new Mesh(geometry, material)
    }

    return new BallModel(mesh, opts.position || new Vector3(0, 0, 0), opts.name || 'Ball')
  }
}

interface BallModelOpts {
  mesh?: Mesh
  position?: Vector3
  name?: string
  radius?: number
  color?: string
}
