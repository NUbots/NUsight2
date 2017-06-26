import { action, observable } from 'mobx'
import * as Plotly from 'plotly.js'

export class ScatterplotModel {

  @observable public fps: number
  @observable public maxPoints: number

  public traces: Map<string, Trace>
  public graphUpdateX: Map<number, number[]>
  public graphUpdateY: Map<number, number[]>
  public graphUpdateZ: Map<number, number[]>
  private nextTraceId: number = 0

  public constructor(opts: ScatterplotModelProps) {
    Object.assign(this, opts)
  }

  public static of() {
    return new ScatterplotModel({
      fps: 10,
      maxPoints: 100,
      traces: new Map<string, Trace>(),
      graphUpdateX: new Map<number, number[]>(),
      graphUpdateY: new Map<number, number[]>(),
      graphUpdateZ: new Map<number, number[]>(),
    })
  }

  @action
  public getGraphUpdateX(id: number): number[] {
    let graph: number[]

    if (this.graphUpdateX.has(id)) {
      graph = this.graphUpdateX.get(id) || [] // || [] to stop TypeScript from complaining
    } else {
      graph = []
      this.graphUpdateX.set(id, graph)
    }

    return graph
  }

  @action
  public getTrace(key: string): Trace {
    let trace: Trace

    if (this.traces.has(key)) {
      trace = this.traces.get(key) || this.createTrace(key)
    } else {
      trace = this.createTrace(key)
      this.traces.set(key, trace)
    }

    return trace
  }

  @action
  public getGraphUpdateY(id: number): number[] {
    let graph: number[]

    if (this.graphUpdateY.has(id)) {
      graph = this.graphUpdateY.get(id) || [] // || [] to stop TypeScript from complaining
    } else {
      graph = []
      this.graphUpdateY.set(id, graph)
    }

    return graph
  }

  @action
  public getGraphUpdateZ(id: number): number[] {
    let graph: number[]

    if (this.graphUpdateZ.has(id)) {
      graph = this.graphUpdateZ.get(id) || [] // || [] to stop TypeScript from complaining
    } else {
      graph = []
      this.graphUpdateZ.set(id, graph)
    }

    return graph
  }

  @action
  public getNextTraceID(): number {
    let id = this.nextTraceId
    this.nextTraceId += 1
    return id
  }

  @action
  private createTrace(label: string): Trace {
    const trace: Trace = {
      mode: 'markers',
      type: 'scattergl',
      hoverinfo: 'x+y',
      marker: { size: 12 },
      name: label,
      xVal: 0,
      id: -1,
      display: true, // TODO: set this to false, and create a config panel to enable it
      addTrace: true, // TODO: set this to false, and create a config panel to enable it
    }

    return trace
  }
}

interface Trace {
  mode: string
  type: string
  hoverinfo: string
  marker: Plotly.ShortMarker
  name: string
  xVal: number
  id: number
  display: boolean
  addTrace: boolean
}

interface ScatterplotModelProps {
  fps: number
  maxPoints: number
  traces: Map<string, Trace>
  graphUpdateX: Map<number, number[]>
  graphUpdateY: Map<number, number[]>
  graphUpdateZ: Map<number, number[]>
}
