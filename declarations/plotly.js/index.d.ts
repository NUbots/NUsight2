// Refer to: http://stackoverflow.com/a/39989713
import 'plotly.js'
declare module 'plotly.js' {
  type Update = { x: Array<number[]>, y: Array<number[]> }
  type ShortLayout = { width: number, height: number }
  type ShortMarker = {size: number}
  type ShortData = {x: Array<number[]>, y: Array<number[]>, z: Array<number[]>, mode: string, type: string, marker: ShortMarker, name: string}
  interface PlotlyStatic {
    extendTraces(element: HTMLDivElement, update: Update, indices: number[], maxPoints?: number): void
    relayout(element: HTMLDivElement, layout: ShortLayout): void
    addTraces(element: HTMLDivElement, traces: ShortData, newIndices?: number[]): void
  }
}
