import { Layer } from './view'
import { observable } from 'mobx'

export interface LayeredCanvasModelOpts {
  layers: Layer[]
}

export class LayeredCanvasModel {

  @observable public layers: Layer[]

  constructor(opts: LayeredCanvasModelOpts) {
    Object.assign(this, opts)
  }

  public static of() {
    return new LayeredCanvasModel({ layers: [] })
  }

  public add(layer: Layer): void {
    this.layers.push(layer)
  }

  public remove(name: string): void {
    this.layers = this.layers.filter(layer => layer.name !== name)
  }

  public hide(name: string): void {
    for(let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name === name) {
        this.layers[i].visible = false
        return
      }
    }
  }

  public hideGroup(group: string): void {
    for(let i = 0; i < this.layers.length; i++) {
      if(this.layers[i].group === group) {
        this.layers[i].visible = false
      }
    }
  }

  public hideAll(): void {
    for(let i = 0; i < this.layers.length; i++) {
      this.layers[i].visible = false
    }
  }

  public show(name: string): void {
    for(let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name === name) {
        this.layers[i].visible = true
        return
      }
    }
  }

  public showGroup(group: string): void {
    for(let i = 0; i < this.layers.length; i++) {
      if(this.layers[i].group === group) {
        this.layers[i].visible = true
      }
    }
  }

  public showAll(): void {
    for(let i = 0; i < this.layers.length; i++) {
      this.layers[i].visible = true
    }
  }

  public getContext(name: string) {
    for(let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name === name) {
        return this.layers[i].context
      }
    }
  }

  public getLayer(name: string): Layer | null {
    let foundLayer: Layer | null = null

    for(let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name === name) {
        foundLayer = this.layers[i]
      }
    }

    return foundLayer
  }

  public move(name: string, location: number) {
    let newLayers: Layer[] = []
    let layerToMove: Layer | null = this.getLayer(name)

    if (layerToMove != null) {

      this.layers.filter(layer => layer.name != name).forEach((layer, index) => {
        if (index === location) {
          newLayers.push(layerToMove!)
        }
        
        newLayers.push(layer)
      })

      this.layers = newLayers
    }
  }
}
