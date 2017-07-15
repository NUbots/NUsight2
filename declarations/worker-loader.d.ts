declare module '*.worker.ts' {
  type WorkerLoader = new() => any
  const content: WorkerLoader
  export = content
}
