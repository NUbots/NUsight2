// Refer to: http://stackoverflow.com/a/39989713
import 'plotly.js'
declare module 'plotly.js' {
  type Update = { x: number[][], y: number[][] }
  type ShortLayout = { width: number, height: number }
  type ShortMarker = {size: number}
  type ShortData = {x: number[][], y: number[][], z: number[][], mode: string, type: string, marker: ShortMarker, name: string}
  type RestyleShort = {type: string}
  interface PlotlyStatic {
    extendTraces(element: HTMLDivElement, update: Update, indices: number[], maxPoints?: number): void
    relayout(element: HTMLDivElement, layout: ShortLayout): void
    addTraces(element: HTMLDivElement, traces: ShortData, newIndices?: number[]): void
    restyle(element: HTMLDivElement, update: RestyleShort): void
  }
}
