import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Mesh } from 'three'
import { SphereBufferGeometry } from 'three'
import { MeshBasicMaterial } from 'three'
import { PlaneBufferGeometry } from 'three'
import { SkyboxModel } from './model'

export class SkyboxViewModel {
  public constructor(private model: SkyboxModel) {
  }

  public static of = createTransformer((model: SkyboxModel): SkyboxViewModel => {
    return new SkyboxViewModel(model)
  })

  @computed
  public get skybox(): SkyBoxProps {
    // reference: http://threejs.org/examples/#webgl_shaders_sky
    const sky = SkyboxModel.of()
    sky.mesh.name = 'skyboxSky'

    const sunSphere = new Mesh(
      new SphereBufferGeometry( 40, 16, 8 ),
      new MeshBasicMaterial( { color: 0xffffff } ),
    )
    sunSphere.position.y = - 49
    sunSphere.visible = false
    sunSphere.name = 'skyboxSun'

    const groundGeo = new PlaneBufferGeometry( 40, 40 )
    const groundMat = new MeshBasicMaterial( { color: 0x613610 } )
    const ground = new Mesh( groundGeo, groundMat )
    ground.name = 'skyboxGround'
    ground.position.y = -0.01
    ground.rotation.x = - Math.PI / 2

    const effectController  = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.53, // default 0.8
      luminance: 0.5,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: ! true,
    }

    const distance = 40

    sky.uniforms.turbidity.value = effectController.turbidity
    sky.uniforms.rayleigh.value = effectController.rayleigh
    sky.uniforms.luminance.value = effectController.luminance
    sky.uniforms.mieCoefficient.value = effectController.mieCoefficient
    sky.uniforms.mieDirectionalG.value = effectController.mieDirectionalG

    const theta = Math.PI * ( effectController.inclination - 0.5 )
    const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 )

    sunSphere.position.x = distance * Math.cos( phi )
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta )
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta )

    sunSphere.visible = effectController.sun

    sky.uniforms.sunPosition.value.copy( sunSphere.position )

    return {
      sky: sky.mesh,
      sun: sunSphere,
      ground,
    }
  }
}

interface SkyBoxProps {
  sky: Mesh
  sun: Mesh
  ground: Mesh
}
