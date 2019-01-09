import { action, computed, observable, reaction } from 'mobx'
import { Component } from 'react'
import * as React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { Object3D } from 'three'
import { AxesHelper } from 'three'
import { Box3 } from 'three'
import { Camera } from 'three'
import { WebGLRenderer } from 'three'
import { Mesh } from 'three'
import { MeshPhongMaterial } from 'three'
import { PerspectiveCamera } from 'three'
import { PointLight } from 'three'
import { Scene } from 'three'
import { SpotLight } from 'three'
import { CircleGeometry } from 'three'

import * as styles from './styles.css'

export class ModelVisualiser extends Component<{ model: Object3D }> {
  private dispose?: () => void

  @observable.ref
  private canvas: HTMLCanvasElement | null = null

  @observable.ref
  private width?: number

  @observable.ref
  private height?: number

  componentDidMount() {
    const renderer = new WebGLRenderer({ canvas: this.canvas!, antialias: true })
    renderer.setClearColor('white')
    this.dispose = reaction(
      () => ({ scene: this.scene, camera: this.camera, size: { width: this.width, height: this.height } }),
      ({ scene, camera, size }) => this.renderScene(renderer, scene, camera, size),
      { fireImmediately: true },
    )
  }

  componentWillUnmount() {
    this.dispose && this.dispose()
  }

  render() {
    return <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}>
      <div className={styles.modelVisualiser}>
        <canvas ref={this.setRef}/>
      </div>
    </ReactResizeDetector>
  }

  @action.bound
  onResize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  private renderScene(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    size: { width?: number, height?: number },
  ) {
    size.width && size.height && renderer.setSize(size.width, size.height, false)
    renderer.render(scene, camera)
  }

  @computed
  private get camera() {
    const aspect = (this.width || 320) / (this.height || 240)
    const camera = new PerspectiveCamera(75, aspect, 0.01, 100)
    camera.position.set(0.4, 0.3, 0.3)
    camera.up.set(0, 0, 1)
    camera.lookAt(0, 0, 0)
    return camera
  }

  @computed
  private get scene() {
    const scene = new Scene()
    scene.add(this.floor)
    scene.add(this.props.model)
    scene.add(this.helper)
    scene.add(this.light)
    scene.add(this.light2)
    return scene
  }

  @computed
  private get helper() {
    return new AxesHelper()
  }

  @computed
  private get floor() {
    const bbox = new Box3().setFromObject(this.props.model)
    const radius = Math.max(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y)
    const geom = new CircleGeometry(radius * 0.75, 80)
    const mat = new MeshPhongMaterial({ color: '#888', specular: 1 })
    const mesh = new Mesh(geom, mat)
    mesh.position.set(0, 0, bbox.min.z)
    return mesh
  }

  @computed
  private get light() {
    const light = new SpotLight('#fff', 1, 20, Math.PI / 8)
    light.position.set(0, 0, 1)
    return light
  }

  @computed
  private get light2() {
    const light = new PointLight('#fff')
    light.position.copy(this.camera.position)
    return light
  }

  @action.bound
  private setRef(ref: HTMLCanvasElement | null) {
    this.canvas = ref
  }
}
