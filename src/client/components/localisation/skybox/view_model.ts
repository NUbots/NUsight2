import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BackSide } from 'three'
import { Mesh } from 'three'
import { SphereBufferGeometry } from 'three'
import { MeshBasicMaterial } from 'three'
import { PlaneBufferGeometry } from 'three'
import { ShaderMaterial } from 'three'
import { UniformsUtils } from 'three'
import { Vector3 } from 'three'
import { SkyboxModel } from './model'
import { SkyShader } from './sky_shader'

export class SkyboxViewModel {

  public constructor(private model: SkyboxModel) {
  }

  public static of = createTransformer((model: SkyboxModel): SkyboxViewModel => {
    return new SkyboxViewModel(model)
  })

  @computed
  public get skybox() {
    // reference: http://threejs.org/examples/#webgl_shaders_sky
    const shader = new SkyShader()
    const uniforms = UniformsUtils.clone(shader.uniforms)
    const geo = new SphereBufferGeometry( 40, 32, 15 )
    const mat = new ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms,
      side: BackSide,
    })

    const mesh = new Mesh(geo, mat)
    mesh.name = 'skyboxSky'

    uniforms.turbidity.value = this.model.turbidity
    uniforms.rayleigh.value = this.model.rayleigh
    uniforms.luminance.value = this.model.luminance
    uniforms.mieCoefficient.value = this.model.mieCoefficient
    uniforms.mieDirectionalG.value = this.model.mieDirectionalG
    uniforms.sunPosition.value.copy(this.sunPosition)

    return mesh
  }

  @computed
  public get ground() {
    const groundGeo = new PlaneBufferGeometry( 40, 40 )
    const groundMat = new MeshBasicMaterial( { color: 0x613610 } )
    const ground = new Mesh( groundGeo, groundMat )
    ground.name = 'skyboxGround'
    ground.position.y = -0.01
    ground.rotation.x = - Math.PI / 2

    return ground
  }

  @computed
  public get sun() {
    const sunSphere = new Mesh(
      new SphereBufferGeometry( 40, 16, 8 ),
      new MeshBasicMaterial( { color: 0xffffff } ),
    )

    sunSphere.position.y = - 49
    sunSphere.visible = false
    sunSphere.name = 'skyboxSun'
    sunSphere.position.copy(this.sunPosition)
    sunSphere.visible = this.model.sun

    return sunSphere
  }

  @computed
  private get sunPosition(): Vector3 {
    const position = new Vector3()
    const distance = 40
    const theta = Math.PI * ( this.model.inclination - 0.5 )
    const phi = 2 * Math.PI * ( this.model.azimuth - 0.5 )

    position.x = distance * Math.cos( phi )
    position.y = distance * Math.sin( phi ) * Math.sin( theta )
    position.z = distance * Math.sin( phi ) * Math.cos( theta )

    return position
  }
}
