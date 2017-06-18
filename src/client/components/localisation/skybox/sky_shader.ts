import { observable } from 'mobx'
import { Vector3 } from 'three'
import * as SkyboxFrag from './skybox.frag'
import * as SkyboxVert from './skybox.vert'

interface SkyUniforms {
  luminance: {value: any}
  turbidity: {value: any}
  rayleigh: {value: any}
  mieCoefficient: {value: any}
  mieDirectionalG: {value: any}
  sunPosition: {value: any}
}

export class SkyShader {

  @observable public uniforms: SkyUniforms
  @observable public vertexShader: any
  @observable public fragmentShader: any

  constructor() {
    this.uniforms = {
      luminance: { value: 1 },
      turbidity: { value: 2 },
      rayleigh: { value: 1 },
      mieCoefficient: { value: 0.005 },
      mieDirectionalG: { value: 0.8 },
      sunPosition: { value: new Vector3() },
    }

    this.vertexShader = SkyboxVert

    this.fragmentShader = SkyboxFrag
  }
}
