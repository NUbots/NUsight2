import { observable } from 'mobx'
import { BackSide } from 'three'
import { UniformsUtils } from 'three'
import { ShaderMaterial } from 'three'
import { SphereBufferGeometry } from 'three'
import { Mesh } from 'three'
import { SkyShader } from './sky_shader'

export class SkyboxModel {

  @observable public uniforms: SkyUniforms
  @observable public mesh: Mesh

  public constructor({ mesh, uniforms }: SkyboxModelOpts) {
    this.mesh = mesh
    this.uniforms = uniforms
  }

  public static of() {
    const skyShader = new SkyShader()
    const uniforms = UniformsUtils.clone(skyShader.uniforms)
    const skyGeo = new SphereBufferGeometry( 40, 32, 15 )
    const skyMat = new ShaderMaterial({
      fragmentShader: skyShader.fragmentShader,
      vertexShader: skyShader.vertexShader,
      uniforms,
      side: BackSide,
    })
    return new SkyboxModel({
      uniforms,
      mesh: new Mesh( skyGeo, skyMat ),
    })
  }
}

interface SkyUniforms {
  luminance: {value: any}
  turbidity: {value: any}
  rayleigh: {value: any}
  mieCoefficient: {value: any}
  mieDirectionalG: {value: any}
  sunPosition: {value: any}
}

interface SkyboxModelOpts {
  uniforms: SkyUniforms
  mesh: Mesh
}
