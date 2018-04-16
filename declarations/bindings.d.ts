declare module 'bindings' {
  const bindings : <T>(name: string) => typeof T
  export = bindings
}
