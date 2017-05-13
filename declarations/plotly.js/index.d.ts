// Refer to: http://stackoverflow.com/a/39989713
import 'plotly.js'
declare module 'plotly.js' {
  type Update = { x: Array<number[]>, y: Array<number[]> }
  interface PlotlyStatic {
    extendTraces(element: HTMLDivElement, update: Update, indices: number[], maxPoints?: number): void
  }
}
